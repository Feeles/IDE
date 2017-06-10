import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import EventEmitter from 'eventemitter2';
import Snackbar from 'material-ui/Snackbar';

import injectTapEventPlugin from 'react-tap-event-plugin';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

import {
  createProject,
  updateProject,
  putFile,
  deleteFile
} from '../database/';
import { BinaryFile, SourceFile, configs } from 'File/';
import codemirrorStyle from 'js/codemirrorStyle';
import * as MonitorTypes from 'utils/MonitorTypes';
import Menu from '../Menu/';
import FileDialog, {
  SaveDialog,
  RenameDialog,
  DeleteDialog
} from 'FileDialog/';
import { Tab } from 'ChromeTab/';
import cardStateDefault from '../Cards/defaultState';
import CardContainer from '../Cards/CardContainer';
import CloneDialog from '../Menu/CloneDialog';
import Footer from './Footer';

const DOWNLOAD_ENABLED =
  typeof document.createElement('a').download === 'string';

const getStyle = (props, state, palette) => {
  const shrinkLeft =
    parseInt(props.rootStyle.width, 10) - state.monitorWidth < 200;
  const shrinkRight = state.monitorWidth < 100;

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

    files: this.props.files,
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

  findFile = (name, multiple = false) => {
    const { files } = this.state;
    if (typeof name === 'string') {
      name = name.replace(/^(\.\/|\/)*/, '');
    }
    const pred = typeof name === 'function'
      ? name
      : file =>
          !file.options.isTrashed &&
          (file.name === name || file.moduleName === name);

    return multiple ? files.filter(pred) : files.find(pred) || null;
  };

  componentWillMount() {
    this.props.setMuiTheme({
      palette: this.getConfig('palette')
    });
    const card = this.findFile('feeles/card.json');
    if (card) {
      this.setState({ cards: card.json });
    }
  }

  componentDidMount() {
    document.title = this.getConfig('ogp')['og:title'] || '';

    const chromosome =
      document.getElementById(INLINE_SCRIPT_ID) ||
      document.getElementById(this.props.inlineScriptId); // backword compatibility

    if (chromosome) {
      this.setState({
        coreString: chromosome.textContent
      });
    } else if (!!CORE_CDN_URL) {
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
  }

  async componentDidUpdate(prevProps, prevState) {
    const { localization } = this.props;

    if (this.state.reboot) {
      this.setState({ reboot: false });
    }
    // 未オートセーブでファイルが更新されたとき、あらたにセーブデータを作る
    if (!this.state.project && prevState.files !== this.state.files) {
      if (process.env.NODE_ENV !== 'production') {
        // development のときは自動で作られない
        return;
      }
      // Create new project
      try {
        const project = await createProject(
          this.state.files.map(item => item.serialize())
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
              files: this.state.files,
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

  async setStatePromise(state) {
    return new Promise((resolve, reject) => {
      this.setState(state, resolve);
    });
  }

  addFile = async file => {
    const timestamp = file.lastModified || Date.now();
    const remove = this.inspection(file);
    if (file === remove) {
      return file;
    }
    const files = this.state.files.concat(file).filter(item => item !== remove);

    await this.setStatePromise({ files });
    this.resetConfig(file.name);

    if (this.state.project) {
      await putFile(this.state.project.id, file.serialize());
    }
    return file;
  };

  putFile = async (prevFile, nextFile) => {
    const timestamp = nextFile.lastModified || Date.now();
    const remove = this.inspection(nextFile);
    if (remove === nextFile) {
      return prevFile;
    }
    const files = this.state.files
      .filter(item => item !== remove && item.key !== prevFile.key)
      .concat(nextFile);

    await this.setStatePromise({ files });
    this.resetConfig(prevFile.name);

    if (this.state.project) {
      await putFile(this.state.project.id, nextFile.serialize());
    }
    return nextFile;
  };

  deleteFile = async (...targets) => {
    const timestamp = Date.now();

    const keys = targets.map(item => item.key);
    const files = this.state.files.filter(item => !keys.includes(item.key));
    await this.setStatePromise({ files });

    if (this.state.project) {
      const fileNames = targets.map(item => item.name);
      await deleteFile(this.state.project.id, ...fileNames);
    }
  };

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
      this.props.setMuiTheme({
        palette: config
      });
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

  inspection = newFile => {
    const conflict = this.state.files.find(
      file =>
        !file.options.isTrashed &&
        file.key !== newFile.key &&
        file.name === newFile.name
    );

    if (conflict) {
      // TODO: FileDialog instead of.
      console.log(newFile);
      if (confirm(this.props.localization.common.conflict)) {
        return conflict;
      } else {
        return newFile;
      }
    }

    return null;
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
      for (const [name, instance] of Object.entries(ref.refs)) {
        if (instance.constructor.icon) {
          cardIcons[name] = instance.constructor.icon;
        }
      }
      this.setState({ cardIcons });
    }
  };

  render() {
    const { connectDropTarget, localization } = this.props;
    const styles = getStyle(this.props, this.state, this.getConfig('palette'));

    const commonProps = {
      files: this.state.files,
      localization,
      getConfig: this.getConfig,
      setConfig: this.setConfig,
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
          saveAs={this.saveAs}
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
