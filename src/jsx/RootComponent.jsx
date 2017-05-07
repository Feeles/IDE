import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import HTML5Backend from 'react-dnd-html5-backend';
import TouchBackend from 'react-dnd-touch-backend';
import { DragDropContext } from 'react-dnd';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { grey300, grey700 } from 'material-ui/styles/colors';
import transitions from 'material-ui/styles/transitions';

import { readProject, findProject } from '../database/';
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
    deployURL: PropTypes.string
  };

  state = {
    last: Infinity,
    files: [],
    // An object has project info
    project: null,
    localization: null,
    muiTheme: getCustomTheme({}),
    openDialog: false,
    // continuous deploying URL (if null, do first deployment)
    deployURL: null
  };

  componentWillMount() {
    const { title } = this.props;

    this.setLocalization(...(navigator.languages || [navigator.language]));

    const deployInfo = document.querySelector('script[x-feeles-deploy]');
    if (deployInfo) {
      this.setState({
        deployURL: deployInfo.getAttribute('x-feeles-deploy')
      });
    }

    if (typeof title === 'string') {
      // From indexedDB
      this.launchIDE({ title });
    } else {
      if (process.env.NODE_ENV !== 'production') {
        if (this.props.jsonURL) {
          this.launchFromURL(this.props.jsonURL);
          return;
        }
      }
      this.setState({ openDialog: true });
    }
  }

  launchIDE = async ({ id, title }) => {
    if (!id && !title) {
      // Required unique title of project to proxy it
      throw new Error(this.state.localization.cloneDialog.titleIsRequired);
    }

    const { project, query, length } = await (id
      ? findProject(id)
      : readProject(title));

    this.setState({
      last: length,
      files: [],
      project,
      deployURL: project.deployURL
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
      last: elements.length
    });

    for (const item of Array.from(elements)) {
      await this.progress(await makeFromElement(item));
    }
  };

  launchFromURL = async url => {
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
        await this.progress(new BinaryFile(seed));
      } else {
        await this.progress(new SourceFile(seed));
      }
    }
  };

  defaultLaunch = async () => {
    if (typeof this.props.jsonURL === 'string') {
      await this.launchFromURL(this.props.jsonURL);
    } else {
      await this.launchFromElements();
    }
  };

  async progress(file) {
    if (Math.random() < 0.1 || this.state.last === 1) {
      await new Promise((resolve, reject) => {
        requestAnimationFrame(resolve);
      });
    }
    this.setState(prevState => {
      return {
        last: prevState.last - 1,
        files: prevState.files.concat(file)
      };
    });
  }

  setLocalization = (...langs) => {
    const localization = getLocalization(...langs);
    if (localization) {
      this.setState({ localization });
      moment.locale(langs);
    } else {
      throw new TypeError(`setLocalization: Cannot parse ${langs.join()}`);
    }
  };

  setMuiTheme = theme =>
    this.setState({
      muiTheme: getCustomTheme(theme)
    });

  closeDialog = () =>
    this.setState({
      openDialog: false
    });

  renderLoading = () => {
    const { last, files } = this.state;

    const styles = {
      root: {
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      },
      header: {
        marginTop: 0,
        fontWeight: 100,
        color: 'white',
        fontFamily: '"Apple Chancery", cursive'
      },
      count: {
        color: grey700,
        fontSize: '.5rem',
        fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace',
        wordBreak: 'break-all',
        marginBottom: '1.5rem'
      }
    };

    const author = document.querySelector(
      'meta[name="og:author"],meta[property="og:author"]'
    );
    const title = document.querySelector(
      'meta[name="og:title"],meta[property="og:title"]'
    );

    return (
      <div style={styles.root}>
        <h1 style={styles.header}>
          {title ? title.getAttribute('content') : document.title || '❤️'}
        </h1>
        {author &&
          <h2 style={styles.header}>{author.getAttribute('content')}</h2>}
        {last < Infinity
          ? <span style={styles.count}>
              {indicator(files.length, last)}
            </span>
          : null}
        <span style={styles.header}>Made with Feeles</span>
        <LaunchDialog
          open={this.state.openDialog}
          localization={this.state.localization}
          launchIDE={this.launchIDE}
          fallback={this.defaultLaunch}
          onRequestClose={this.closeDialog}
        />
        <style>
          {`
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
    const { rootElement } = this.props;

    return (
      <MuiThemeProvider muiTheme={this.state.muiTheme}>
        {this.state.last > 0
          ? this.renderLoading()
          : <Main
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
              setDeployURL={deployURL => this.setState({ deployURL })}
            />}
      </MuiThemeProvider>
    );
  }
}

const dndBackend = 'ontouchend' in document ? TouchBackend : HTML5Backend;
export default DragDropContext(dndBackend)(RootComponent);

function indicator(val, last) {
  const length = 32;
  const sum = Math.max(1, val + last) + 0.00001;
  const progress = Math.floor(val / sum * length);
  return '='.repeat(progress) + '+' + '-'.repeat(length - 1 - progress);
}
