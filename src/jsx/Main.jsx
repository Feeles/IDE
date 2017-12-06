/*global INLINE_SCRIPT_ID CORE_CDN_URL*/
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import EventEmitter from 'eventemitter2';
import Snackbar from 'material-ui/Snackbar';
import jsyaml from 'js-yaml';
const tryParseYAML = (text, defaultValue = {}) => {
  try {
    return jsyaml.safeLoad(text);
  } catch (e) {
    console.error(e);
    return defaultValue;
  }
};
const tryParseJSON = (text, defaultValue = {}) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error(e);
    return defaultValue;
  }
};

import injectTapEventPlugin from 'react-tap-event-plugin';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

import { FileView, createProject, updateProject } from '../database/';
import { SourceFile, configs } from 'File/';
import codemirrorStyle from 'js/codemirrorStyle';
import * as MonitorTypes from 'utils/MonitorTypes';
import Menu from '../Menu/';
import FileDialog, { SaveDialog } from 'FileDialog/';
import cardStateDefault from '../Cards/defaultState';
import CardContainer from '../Cards/CardContainer';
import CloneDialog from '../Menu/CloneDialog';
import Footer from './Footer';

const DOWNLOAD_ENABLED =
  typeof document.createElement('a').download === 'string';

const getStyle = (props, state, context) => {
  const shrinkLeft =
    parseInt(props.rootStyle.width, 10) - state.monitorWidth < 200;
  const shrinkRight = state.monitorWidth < 100;
  const { palette } = context.muiTheme;

  return {
    shrinkLeft,
    shrinkRight,

    root: {
      position: 'relative',
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: palette.backgroundColor
    }
  };
};

export default class Main extends Component {
  static propTypes = {
    files: PropTypes.array.isRequired,
    rootStyle: PropTypes.object.isRequired,
    project: PropTypes.object,
    launchIDE: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    setLocalization: PropTypes.func.isRequired,
    setMuiTheme: PropTypes.func.isRequired,
    deployURL: PropTypes.string,
    setDeployURL: PropTypes.func.isRequired
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  state = {
    monitorType: MonitorTypes.Card,

    fileView: new FileView(this.props.files),
    reboot: false,
    href: 'index.html',

    tabs: [],

    coreString: null,

    project: this.props.project,
    notice: null,
    // OAuth 認証によって得られる UUID.
    // あくまで発行しているのは feeles.com である
    // この値はユーザが見えるところには表示してはならない
    oAuthId: null,

    cards: cardStateDefault,
    cardIcons: null,
    // Advanced Mode
    showAll: false,
    // card =(emit)=> globalEvent =(on)=> card
    globalEvent: new EventEmitter({ wildcard: true })
  };

  get rootWidth() {
    return parseInt(this.props.rootStyle.width, 10);
  }

  get rootHeight() {
    return parseInt(this.props.rootStyle.height, 10);
  }

  componentWillMount() {
    // 互換性保持のため、 fileView に外から setState させる
    this.state.fileView.install(this);

    const feelesrc = this.loadConfig('feelesrc');
    this.props.setMuiTheme(feelesrc);

    const card = this.findFile('feeles/card.json');
    if (card) {
      this.setState({ cards: card.json });
    }
  }

  componentDidMount() {
    document.title = this.getConfig('ogp')['og:title'] || '';

    const chromosome = document.getElementById(INLINE_SCRIPT_ID);

    if (chromosome) {
      this.setState({
        coreString: chromosome.textContent
      });
    } else if (CORE_CDN_URL) {
      fetch(CORE_CDN_URL, { mode: 'cors' })
        .then(response => {
          if (!response.ok) {
            throw response.error ? response.error() : response.statusText;
          }
          return response.text();
        })
        .then(coreString => this.setState({ coreString }));
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.project !== nextProps.project) {
      this.setProject(nextProps.project);
    }
    if (this.props.localization !== nextProps.localization) {
      this.state.fileView.forceUpdate();
      this.setState({ reboot: true });
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    const { localization } = this.props;

    if (this.state.reboot) {
      this.setState({ reboot: false });
    }
    // 未オートセーブでファイルが更新されたとき、あらたにセーブデータを作る
    if (!this.state.project && prevState.fileView !== this.state.fileView) {
      if (process.env.NODE_ENV !== 'production') {
        // development のときは自動で作られない
        return;
      }
      // Create new project
      try {
        const project = await createProject(
          this.state.fileView.files.map(item => item.serialize())
        );
        // add deployURL if exists
        const { deployURL } = this.props;
        if (deployURL) {
          const nextProject = await updateProject(project.id, { deployURL });
          await this.setProject(nextProject);
        } else {
          await this.setProject(project);
        }
      } catch (e) {
        console.log(e);
        if (typeof e === 'string' && e in localization.cloneDialog) {
          alert(localization.cloneDialog[e]);
        }
      }
      // notice
      this.setState({
        notice: {
          message: localization.cloneDialog.autoSaved,
          action: localization.cloneDialog.setTitle,
          autoHideDuration: 20000,
          onActionTouchTap: () => {
            this.openFileDialog(CloneDialog, {
              coreString: this.state.coreString,
              files: this.state.fileView.files,
              saveAs: this.saveAs,
              project: this.state.project,
              setProject: this.setProject,
              launchIDE: this.props.launchIDE,
              deployURL: this.props.deployURL
            });
          }
        }
      });
    }

    document.title = this.getConfig('ogp')['og:title'] || '';
  }

  componentWillUnmount() {
    this.state.fileView.uninstall();
  }

  async setStatePromise(state) {
    return new Promise((resolve, reject) => {
      this.setState(state, resolve);
    });
  }

  _configs = new Map();
  getConfig = key => {
    if (this._configs.has(key)) {
      return this._configs.get(key);
    } else {
      const { test, defaultValue, multiple, bundle } = configs.get(key);
      const files = this.findFile(
        file => !file.options.isTrashed && test.test(file.name),
        multiple
      );

      const value = files
        ? multiple ? bundle(files) : files.json
        : defaultValue;
      this._configs.set(key, value);
      return value;
    }
  };

  setConfig = (key, config) => {
    this._configs.set(key, config);

    const { test, defaultName } = configs.get(key);
    const configFile = this.findFile(
      file => !file.options.isTrashed && test.test(file.name),
      false
    );

    // Update Mui theme
    if (key === 'palette') {
      const feelesrc = this.loadConfig('feelesrc');
      feelesrc.palette = config;
      this.props.setMuiTheme(feelesrc);
    }

    const indent = '    ';
    const text = JSON.stringify(config, null, indent);

    if (configFile) {
      return this.putFile(configFile, configFile.set({ text }));
    } else {
      const newFile = new SourceFile({
        type: 'application/json',
        name: defaultName,
        text
      });
      return this.addFile(newFile);
    }
  };

  resetConfig = fileName => {
    // Refresh config
    for (const [key, value] of configs.entries()) {
      if (value.test.test(fileName)) {
        this._configs.delete(key);
      }
    }
  };

  loadConfig = ext => {
    const json = `${ext}.json`;
    const yaml = `${ext}.yml`;
    // TODO: オブジェクト（ハッシュ）以外も使えるようにする
    const values = [].concat(
      // .json (JSON)
      this.state.fileView
        .getFilesByExtention(json)
        .map(file => tryParseJSON(file.text, {})),
      // .yml (YAML)
      this.state.fileView
        .getFilesByExtention(yaml)
        .map(file => tryParseYAML(file.text, {})),
      // .(ext) (JSON)
      this.state.fileView
        .getFilesByExtention(ext)
        .map(file => tryParseJSON(file.text, {}))
    );
    return Object.assign({}, ...values);
  };

  selectTab = tab =>
    new Promise((resolve, reject) => {
      const tabs = this.state.tabs.map(item => {
        if (item.isSelected) return item.select(false);
        return item;
      });

      const found = tabs.find(item => item.is(tab));
      if (found) {
        const replace = found.select(true);
        this.setState(
          {
            tabs: tabs.map(item => (item === found ? replace : item))
          },
          () => resolve(replace)
        );
      } else {
        if (!tab.isSelected) tab = tab.select(true);
        this.setState(
          {
            tabs: tabs.concat(tab)
          },
          () => resolve(tab)
        );
      }

      this.updateCard('EditorCard', { visible: true });
    });

  closeTab = tab =>
    new Promise((resolve, reject) => {
      const tabs = this.state.tabs.filter(item => item.key !== tab.key);
      if (tab.isSelected && tabs.length > 0) {
        tabs[0] = tabs[0].select(true);
      }
      this.setState({ tabs }, () => resolve());
    });

  saveAs = (...files) => {
    if (DOWNLOAD_ENABLED) {
      files.forEach(file => {
        const a = document.createElement('a');
        const event = document.createEvent('MouseEvents');
        event.initMouseEvent(
          'click',
          true,
          true,
          window,
          0,
          0,
          0,
          0,
          0,
          false,
          false,
          false,
          false,
          0,
          null
        );

        a.download = file.name;
        a.href =
          file.blobURL ||
          URL.createObjectURL(new Blob([file.text], { type: file.type }));
        a.dispatchEvent(event);

        if (a.href !== file.blobURL) {
          URL.revokeObjectURL(a.href);
        }
      });

      return Promise.resolve();
    } else {
      // for Safari/IE11/Edge
      return this.openFileDialog(SaveDialog, { content: files });
    }
  };

  setProject = project =>
    this.setStatePromise({
      project
    });

  handleTogglePopout = () => {
    const isPopout = this.state.monitorType === MonitorTypes.Popout;
    this.setState({
      reboot: true,
      monitorType: isPopout ? MonitorTypes.Card : MonitorTypes.Popout
    });
  };

  handleToggleFullScreen = () => {
    const isFullScreen = this.state.monitorType === MonitorTypes.FullScreen;
    this.setState({
      monitorType: isFullScreen ? MonitorTypes.Card : MonitorTypes.FullScreen
    });
  };

  setLocation = href => {
    this.setState(prevState => ({
      reboot: true,
      href: href || prevState.href
    }));
  };

  updateCard = (name, props) => {
    const nextCard = { ...this.state.cards };
    nextCard[name] = { ...nextCard[name], ...props };
    return this.setStatePromise({ cards: nextCard });
  };

  handleShowNotice = notice =>
    this.setStatePromise({
      notice
    });

  setOAuthId = (oAuthId = null) =>
    this.setStatePromise({
      oAuthId
    });

  toggleShowAll = () => this.setStatePromise({ showAll: !this.state.showAll });

  openFileDialog = () => console.error('openFileDialog has not be declared');
  handleFileDialog = ref => ref && (this.openFileDialog = ref.open);

  handleContainerRef = ref => {
    if (!this.state.cardIcons && ref) {
      const cardIcons = {};
      for (const [name, instance] of Object.entries(ref.cardRefs)) {
        if (instance.constructor.icon) {
          cardIcons[name] = instance.constructor.icon;
        }
      }
      this.setState({ cardIcons });
    }
  };

  render() {
    const { localization } = this.props;
    const styles = getStyle(this.props, this.state, this.context);

    const commonProps = {
      fileView: this.state.fileView,
      files: this.state.fileView.files,
      localization,
      getConfig: this.getConfig,
      setConfig: this.setConfig,
      loadConfig: this.loadConfig,
      findFile: this.findFile,
      addFile: this.addFile,
      putFile: this.putFile,
      showAll: this.state.showAll
    };

    const userStyle = this.findFile('feeles/codemirror.css');

    return (
      <div style={styles.root}>
        <Menu
          {...commonProps}
          setLocalization={this.props.setLocalization}
          openFileDialog={this.openFileDialog}
          coreString={this.state.coreString}
          saveAs={this.saveAs}
          project={this.state.project}
          setProject={this.setProject}
          cards={this.state.cards}
          updateCard={this.updateCard}
          launchIDE={this.props.launchIDE}
          deployURL={this.props.deployURL}
          setDeployURL={this.props.setDeployURL}
          oAuthId={this.state.oAuthId}
          setOAuthId={this.setOAuthId}
          showAll={this.state.showAll}
          toggleShowAll={this.toggleShowAll}
          cardIcons={this.state.cardIcons}
          globalEvent={this.state.globalEvent}
        />
        <CardContainer
          {...commonProps}
          cards={this.state.cards}
          updateCard={this.updateCard}
          tabs={this.state.tabs}
          selectTab={this.selectTab}
          closeTab={this.closeTab}
          setLocation={this.setLocation}
          openFileDialog={this.openFileDialog}
          reboot={this.state.reboot}
          href={this.state.href}
          coreString={this.state.coreString}
          monitorType={this.state.monitorType}
          saveAs={this.saveAs}
          toggleFullScreen={this.handleToggleFullScreen}
          togglePopout={this.handleTogglePopout}
          showNotice={this.handleShowNotice}
          deleteFile={this.deleteFile}
          oAuthId={this.state.oAuthId}
          ref={this.handleContainerRef}
          globalEvent={this.state.globalEvent}
        />
        <Footer
          deployURL={this.props.deployURL}
          localization={localization}
          showNotice={this.handleShowNotice}
        />
        <FileDialog
          ref={this.handleFileDialog}
          localization={this.props.localization}
          getConfig={this.getConfig}
          setConfig={this.setConfig}
          globalEvent={this.state.globalEvent}
        />
        <style>{codemirrorStyle(this.context.muiTheme)}</style>
        {userStyle ? <style>{userStyle.text}</style> : null}
        <Snackbar
          open={this.state.notice !== null}
          message=""
          autoHideDuration={4000}
          onRequestClose={() => this.setState({ notice: null })}
          {...this.state.notice}
        />
      </div>
    );
  }
}
