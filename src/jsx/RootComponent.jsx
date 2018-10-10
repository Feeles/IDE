import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import HTML5Backend from 'react-dnd-html5-backend';
import TouchBackend from 'react-dnd-touch-backend';
import URLSearchParams from 'url-search-params';
import { DragDropContext } from 'react-dnd';
import V0MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import grey from '@material-ui/core/colors/grey';
import transitions from '@material-ui/core/styles/transitions';

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

import fetchPonyfill from 'fetch-ponyfill';
const fetch =
  window.fetch ||
  // for IE11
  fetchPonyfill({
    // TODO: use babel-runtime to rewrite this into require("babel-runtime/core-js/promise")
    Promise
  }).fetch;

const seedToFile = seed => {
  if (validateType('blob', seed.type)) {
    return new BinaryFile(seed);
  } else {
    return new SourceFile(seed);
  }
};

class RootComponent extends Component {
  static propTypes = {
    // Props of cardProps
    cardProps: PropTypes.object,
    // Handler of changing cardProps
    onCardPropsChange: PropTypes.func,
    // Toggle left menubar
    openSidebar: PropTypes.bool,
    // Disappear top navbar
    mini: PropTypes.bool,
    // Root element
    rootElement: PropTypes.object.isRequired,
    // Array of seed object
    seeds: PropTypes.array,
    // A string as title of project opened
    title: PropTypes.string,
    // An URL string as JSON file provided
    jsonURL: PropTypes.string,
    // Handle file change
    onChange: PropTypes.func,
    // Handle message from iframe
    onMessage: PropTypes.func,
    // Handle screenshot image change
    onThumbnailChange: PropTypes.func,
    // For using external DB
    disableLocalSave: PropTypes.bool
  };

  static defaultProps = {
    openSidebar: false,
    mini: false,
    disableLocalSave: false
  };

  state = {
    cardProps: null,
    last: Infinity,
    files: [],
    // An object has project info
    project: null,
    localization: null,
    muiTheme: getCustomTheme({}),
    openDialog: false,
    retryCount: 0,
    errorText: null
  };

  componentDidUpdate(prevProps) {
    // onCardPropsChange があるのに cardProps がないということは
    // 上位 component が props を変更してもここには来ないということなので, エラー
    if (this.props.onCardPropsChange && !this.props.cardProps) {
      throw new TypeError(
        'Props onCardPropsChange was given but missing cardProps!'
      );
    }

    // 基本的に cardProps は props で与えられたものをそのまま使う (Stateless)
    // onCardPropsChange が与えられなかった場合のみ内部的に state を変える
    if (prevProps.cardProps !== this.props.cardProps) {
      this.setState({
        cardProps: this.props.cardProps
      });
    }

    if (this.state.last === 0 && this.state.cardProps === null) {
      // ファイルのロードが終了したので, cardProps を設定する
      if (this.props.cardProps) {
        // 上位の component から props が与えられている
        this.setState({
          cardProps: this.props.cardProps
        });
      } else {
        // 与えられていないので、feeles/card.json を探す
        const card = this.state.files.find(
          file => file.name === 'feeles/card.json'
        );
        if (!card) {
          throw new Error('Missing feeles/card.json');
        } else {
          this.setState({
            cardProps: card.json
          });
        }
      }
    }
  }

  componentDidMount() {
    const { title, seeds, disableLocalSave } = this.props;

    this.setLocalization(this.langs);

    if (Array.isArray(seeds)) {
      this.setState({
        last: 0,
        files: seeds.map(seedToFile)
      });
    } else if (typeof title === 'string') {
      // From indexedDB
      this.launchIDE({ title });
    } else if (disableLocalSave) {
      // Use Feeles as a module. Do not access any local data.
      this.defaultLaunch();
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

  get langs() {
    return []
      .concat(new URLSearchParams(location.search).getAll('lang')) // ?lang=ll_CC
      .concat(navigator.languages || navigator.language); // browser settings
  }

  get localization() {
    return this.state.localization || getLocalization(this.langs);
  }

  launchIDE = async ({ id, title }) => {
    if (!id && !title) {
      // Required unique title of project to proxy it
      const { titleIsRequired } = this.localization.cloneDialog;
      this.setState({ errorText: titleIsRequired });
      console.info(titleIsRequired);
    }

    const { project, query, length } = await (id
      ? findProject(id)
      : readProject(title));

    this.setState({
      last: length,
      files: [],
      project
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
      this.setState(prevState => ({
        retryCount: prevState.retryCount + 1,
        errorText: e.message
      }));
      // Auto retry
      const delay = Math.pow(2, this.state.retryCount + 1);
      return new Promise((resolve, reject) => {
        window.setTimeout(() => {
          this.launchFromURL(url).then(resolve, reject);
        }, delay * 1000);
      });
    }

    let seeds = [];
    try {
      seeds = JSON.parse(text);
    } catch (e) {
      console.log(text);
      const errorText = `${url} is not valid JSON. Check the text in console.`;
      console.info(errorText);
      this.setState({ errorText });
      return;
    }

    if (!Array.isArray(seeds)) {
      console.log(seeds);
      const errorText =
        'Source JSON file must be an array. Check the value in cosole.';
      console.info(errorText);
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
      await new Promise(resolve => {
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

  /**
   * cardProps を変更する場合ここを通す
   * @param prevPropsToProps {Function} prevProps => props
   */
  setCardProps = prevPropsToProps => {
    if (this.props.onCardPropsChange) {
      // onCardPropsChange がある場合, 変更は上位の component に委ねる
      // cardProps が与えられていれば RootComponent はステートレスにふるまう
      const nextProps = prevPropsToProps(this.props.cardProps);
      this.props.onCardPropsChange(nextProps);
    } else {
      // onCardPropsChange がない場合, ここで一時的に state を変更する
      this.setState({
        cardProps: prevPropsToProps(this.state.cardProps)
      });
    }
  };

  renderLoading = () => {
    const { last, files, errorText, retryCount } = this.state;

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
        color: grey['700'],
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
        {retryCount > 0 ? (
          <div>
            {Math.pow(2, retryCount)}
            秒後にもう一度接続します...
          </div>
        ) : null}
        {author && (
          <h2 style={styles.header}>{author.getAttribute('content')}</h2>
        )}
        {last < Infinity ? (
          <span style={styles.count}>{indicator(files.length, last)}</span>
        ) : null}
        <span style={styles.header}>Made with Feeles</span>
        <LaunchDialog
          open={this.state.openDialog}
          localization={this.localization}
          launchIDE={this.launchIDE}
          fallback={this.defaultLaunch}
          onRequestClose={this.closeDialog}
        />
        <style>
          {`
          html, body {
            background-color: ${grey['300']};
            transition: ${transitions.create(['all'], { duration: 4000 })};
          }
        `}
        </style>
      </div>
    );
  };

  render() {
    const { rootElement } = this.props;

    return (
      <V0MuiThemeProvider muiTheme={this.state.muiTheme}>
        {this.state.last > 0 ? (
          this.renderLoading()
        ) : this.state.cardProps ? (
          <Main
            cardProps={this.state.cardProps}
            setCardProps={this.setCardProps}
            openSidebar={this.props.openSidebar}
            mini={this.props.mini}
            files={this.state.files}
            rootElement={rootElement}
            rootStyle={getComputedStyle(rootElement)}
            project={this.state.project}
            launchIDE={this.launchIDE}
            localization={this.localization}
            setLocalization={this.setLocalization}
            muiTheme={this.state.muiTheme}
            setMuiTheme={this.setMuiTheme}
            onChange={this.props.onChange}
            onMessage={this.props.onMessage}
            onThumbnailChange={this.props.onThumbnailChange}
            disableLocalSave={this.props.disableLocalSave}
          />
        ) : null}
      </V0MuiThemeProvider>
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
