import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import HTML5Backend from 'react-dnd-html5-backend';
import TouchBackend from 'react-dnd-touch-backend';
import URLSearchParams from 'url-search-params';
import { DragDropContext } from 'react-dnd';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { grey300, grey700 } from 'material-ui/styles/colors';
import transitions from 'material-ui/styles/transitions';

import { readProject, findProject } from '../database/';
import { makeFromElement, BinaryFile, SourceFile, validateType } from 'File/';
import getLocalization from '../localization/';
import getCustomTheme from '../js/getCustomTheme';
import Main from './Main';
import LaunchDialog from './LaunchDialog';

const seedToFile = seed => {
  if (validateType('blob', seed.type)) {
    return new BinaryFile(seed);
  } else {
    return new SourceFile(seed);
  }
};

class RootComponent extends Component {
  static propTypes = {
    rootElement: PropTypes.object.isRequired,
    // Array of seed object
    seeds: PropTypes.array,
    // A string as title of project opened
    title: PropTypes.string,
    // An URL string as JSON file provided
    jsonURL: PropTypes.string,
    // An URL string to continuous deploying
    deployURL: PropTypes.string,
    // Handle file change
    onChange: PropTypes.func
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
    deployURL: null,
    errorText: null
  };

  componentWillMount() {
    const { title, seeds } = this.props;

    const langs = []
      .concat(new URLSearchParams(location.search).getAll('lang')) // ?lang=ll_CC
      .concat(navigator.languages || navigator.language); // browser settings

    this.setLocalization(langs);

    const deployInfo = document.querySelector('script[x-feeles-deploy]');
    if (deployInfo) {
      this.setState({
        deployURL: deployInfo.getAttribute('x-feeles-deploy')
      });
    }

    if (Array.isArray(seeds)) {
      const files = seeds;
      this.setState({
        last: 0,
        files: seeds.map(seedToFile)
      });
    } else if (typeof title === 'string') {
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
      const { titleIsRequired } = this.state.localization.cloneDialog;
      this.setState({ errorText: titleIsRequired });
      console.error(titleIsRequired);
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
      const file = seedToFile(seed);
      this.progress(file);
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
    let text;
    try {
      const response = await fetch(url);
      text = await response.text();
    } catch (e) {
      this.setState({ errorText: e.message });
      console.error(e);
      return;
    }

    let seeds = [];
    try {
      seeds = JSON.parse(text);
    } catch (e) {
      console.log(text);
      const errorText = `${url} is not valid JSON. Check the text in console.`;
      console.error(errorText);
      this.setState({ errorText });
      return;
    }

    if (!Array.isArray(seeds)) {
      console.log(seeds);
      const errorText =
        'Source JSON file must be an array. Check the value in cosole.';
      console.error(errorText);
      this.setState({ errorText });
      return;
    }

    this.setState({
      last: seeds.length,
      files: []
    });

    for (const seed of seeds) {
      const file = seedToFile(seed);
      await this.progress(file);
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

  setLocalization = langs => {
    langs = [].concat(langs);
    const localization = getLocalization(langs);
    if (localization) {
      this.setState({ localization });
      moment.locale(localization.ll_CC);
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
    const { last, files, errorText } = this.state;

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
      errorText: {
        color: 'red'
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
        {errorText && <span style={styles.errorText}>{errorText}</span>}
        {author && (
          <h2 style={styles.header}>{author.getAttribute('content')}</h2>
        )}
        {last < Infinity ? (
          <span style={styles.count}>{indicator(files.length, last)}</span>
        ) : null}
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
        {this.state.last > 0 ? (
          this.renderLoading()
        ) : (
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
            setDeployURL={deployURL => this.setState({ deployURL })}
            onChange={this.props.onChange}
          />
        )}
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
