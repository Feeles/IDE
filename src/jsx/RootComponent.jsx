import React, { Component, PropTypes } from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
import TouchBackend from 'react-dnd-touch-backend';
import { DragDropContext } from 'react-dnd';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { grey100, grey500 } from 'material-ui/styles/colors';


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
    inlineScriptId: PropTypes.string,
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
  };

  setStatePromise(nextState) {
    return new Promise((resolve, reject) => {
      this.setState(nextState, resolve);
    });
  }

  componentWillMount() {
    const {
      title,
    } = this.props;

    if (typeof title === 'string') {
      // From indexedDB
      this.launchIDE({ title });
    } else {
      this.setState({
        openDialog: true,
      });
    }
  }

  launchIDE = async ({ title }) => {
    const {
      project,
      query,
      length,
    } = await readProject(title);

    this.setState({
      last: length,
      files: [],
      project,
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
        backgroundColor: grey100,
      },
      header: {
        fontWeight: 100,
        color: 'white',
        fontFamily: 'cursive',
      },
      count: {
        color: grey500,
        fontSize: '.5rem',
        fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace',
        wordBreak: 'break-all',
      },
    };

    return (
      <div style={styles.root}>
        <h1 style={styles.header}>Feeles</h1>
      {last < Infinity ? (
        <span key="0" style={styles.count}>
          {'='.repeat(files.length) + '+' + '-'.repeat(last - 1)}
        </span>
      ) : null}
        <LaunchDialog
          open={this.state.openDialog}
          localization={this.state.localization}
          launchIDE={this.launchIDE}
          launchFromElements={this.launchFromElements}
          onRequestClose={this.closeDialog}
        />
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
        />
      )}
      </MuiThemeProvider>
    );
  }
}


const dndBackend = 'ontouchend' in document ? TouchBackend : HTML5Backend;
export default DragDropContext(dndBackend)(RootComponent);
