import React, { Component, PropTypes } from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
import TouchBackend from 'react-dnd-touch-backend';
import { DragDropContext } from 'react-dnd';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { grey300, grey700 } from 'material-ui/styles/colors';
import transitions from 'material-ui/styles/transitions';


import {
  readProject,
} from '../database/';
import {
  makeFromElement,
  BinaryFile,
  SourceFile,
  validateType
} from '../File/';
import getLocalization from '../localization/';
import getCustomTheme from '../js/getCustomTheme';
import Main from './Main';
import LaunchDialog from './LaunchDialog';

class RootComponent extends Component {

  static propTypes = {
    rootElement: PropTypes.object.isRequired,
    // A string as title of project opened
    title: PropTypes.string,
    // An URL string as JSON file provided
    jsonURL: PropTypes.string,
    // An URL string to continuous deploying
    deployURL: PropTypes.string,
  };

  state = {
    last: Infinity,
    files: [],
    // An object has project info
    project: null,
    localization: getLocalization(...(
      navigator.languages || [navigator.language]
    )),
    muiTheme: getCustomTheme({}),
    openDialog: false,
    // continuous deploying URL (if null, do first deployment)
    deployURL: null,
  };

  setStatePromise(nextState) {
    return new Promise((resolve, reject) => {
      this.setState(nextState, resolve);
    });
  }

  componentWillMount() {
    const {
      title,
      jsonURL
    } = this.props;

    const deployInfo = document.querySelector('script[x-feeles-deploy]');
    if (deployInfo) {
      this.setState({
        deployURL: deployInfo.getAttribute('x-feeles-deploy')
      });
    }

    if (typeof title === 'string') {
      // From indexedDB
      this.launchIDE({ title });

    } else if (typeof jsonURL === 'string') {
      // From fetching JSON
      this.launchFromURL(jsonURL);

    } else {
      this.setState({
        openDialog: true,
      });
    }
  }

  launchIDE = async ({ title }) => {
    if (!title) {
      // Required unique title of project to proxy it
      throw new Error(
        this.state.localization.cloneDialog.titleIsRequired,
      );
    }

    const {
      project,
      query,
      length,
    } = await readProject(title);

    this.setState({
      last: length,
      files: [],
      project,
      deployURL: project.deployURL,
    });

    query.each(value => {
      const seed = value.serializedFile;
      if (validateType('blob', seed.type)) {
        this.progress(new BinaryFile(seed));
      } else {
        this.progress(new SourceFile(seed));
      }
    });
  };

  launchFromElements = async () => {
    // from script elements
    const query = this.props.rootElement.getAttribute('data-target');
    const elements = document.querySelectorAll(`script${query}`);
    this.setState({
      last: elements.length,
    });

    for (const item of Array.from(elements)) {
      this.progress(await makeFromElement(item));
      if (Math.random() < 0.1 || this.state.last === 1) {
        await this.wait();
      }
    }
  };

  launchFromURL = async (url) => {
    // from json file URL
    const response = await fetch(url);
    const text = await response.text();
    const seeds = JSON.parse(text);

    if (!Array.isArray(seeds)) {
      throw 'Source JSON file must be an array. Could not open the URL.';
    }

    this.setState({
      last: seeds.length,
      files: []
    });

    for (const seed of seeds) {
      if (validateType('blob', seed.type)) {
        this.progress(new BinaryFile(seed));
      } else {
        this.progress(new SourceFile(seed));
      }
    }
  };

  wait() {
    return new Promise((resolve, reject) => {
      requestAnimationFrame(resolve);
    });
  }

  progress(file) {
    this.setState((prevState) => {
      return {
        last: prevState.last - 1,
        files: prevState.files.concat(file),
      };
    });
  }

  setLocalization = (localization) => this.setState({
    localization
  });

  setMuiTheme = (theme) => this.setState({
    muiTheme: getCustomTheme(theme),
  });

  closeDialog = () => this.setState({
    openDialog: false,
  });

  renderLoading = () => {
    const {
      last,
      files,
    } = this.state;

    const styles = {
      root: {
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      },
      header: {
        marginTop: 0,
        fontWeight: 100,
        color: 'white',
        fontFamily: '"Apple Chancery", cursive',
      },
      count: {
        color: grey700,
        fontSize: '.5rem',
        fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace',
        wordBreak: 'break-all',
      },
    };

    const author = document.querySelector('meta[name="og:author"],meta[property="og:author"]');
    const title = document.querySelector('meta[name="og:title"],meta[property="og:title"]');

    return (
      <div style={styles.root}>
        <h1 style={styles.header}>{title
          ? title.getAttribute('content')
          : (document.title || '❤️')
        }</h1>
      {last < Infinity ? (
        <span style={styles.count}>
          {'='.repeat(files.length) + '+' + '-'.repeat(last - 1)}
        </span>
      ) : null}
      {author && (
        <h2 style={styles.header}>{author.getAttribute('content')}</h2>
      )}
        <span style={styles.header}>Made with Feeles</span>
        <LaunchDialog
          open={this.state.openDialog}
          localization={this.state.localization}
          launchIDE={this.launchIDE}
          launchFromElements={this.launchFromElements}
          onRequestClose={this.closeDialog}
        />
        <style>{`
          html, body {
            background-color: ${grey300};
            transition: ${transitions.easeOut('4000ms')};
          }
        `}
        </style>
      </div>
    );
  };

  render() {
    const {
      rootElement,
    } = this.props;

    return (
      <MuiThemeProvider muiTheme={this.state.muiTheme}>
      {this.state.last > 0 ? this.renderLoading() : (
        <Main
          files={this.state.files}
          rootElement={rootElement}
          rootStyle={getComputedStyle(rootElement)}
          project={this.state.project}
          launchIDE={this.launchIDE}
          localization={this.state.localization}
          setLocalization={this.setLocalization}
          muiTheme={this.state.muiTheme}
          setMuiTheme={this.setMuiTheme}
          deployURL={this.state.deployURL}
          setDeployURL={deployURL => this.setState({deployURL})}
        />
      )}
      </MuiThemeProvider>
    );
  }
}


const dndBackend = 'ontouchend' in document ? TouchBackend : HTML5Backend;
export default DragDropContext(dndBackend)(RootComponent);
