import React, { Component } from 'react';
import PropTypes from 'prop-types';
import EventEmitter from 'eventemitter2';
import Snackbar from 'material-ui/Snackbar';
import jsyaml from 'js-yaml';
import _ from 'lodash';

const tryParseYAML = (text, defaultValue = {}) => {
  try {
    return jsyaml.safeLoad(text);
  } catch (e) {
    console.info(e);
    return defaultValue;
  }
};
const tryParseJSON = (text, defaultValue = {}) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    console.info(e);
    return defaultValue;
  }
};

import { FileView, createProject } from '../database/';
import { SourceFile, configs } from '../File/';
import codemirrorStyle from '../js/codemirrorStyle';
import * as MonitorTypes from '../utils/MonitorTypes';
import Menu from '../Menu/';
import FileDialog, { SaveDialog } from '../FileDialog/';
import cardStateDefault from '../Cards/defaultState';
import CardContainer from '../Cards/CardContainer';
import CloneDialog from '../Menu/CloneDialog';

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
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      lineHeight: 1.15,
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
    onChange: PropTypes.func,
    onMessage: PropTypes.func,
    onThumbnailChange: PropTypes.func,
    disableLocalSave: PropTypes.bool.isRequired
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

    project: this.props.project,
    notice: null,

    cards: cardStateDefault,
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

  /**
   * 元々 componentWillMount で実装されていた処理.
   * render が最初に呼ばれたときに一度だけ呼ばれる
   */
  componentWillMountCompat() {
    // 互換性保持のため、 fileView に外から setState させる
    this.state.fileView.install(this);

    const feelesrc = this.loadConfig('feelesrc');
    this.props.setMuiTheme(feelesrc);

    const card = this.findFile('feeles/card.json');
    if (card) {
      const cards = _.merge(this.state.cards, card.json);
      // ここで setState するのはアンチパターン
      this.setState({ cards });
    }
  }

  componentDidMount() {
    // 定期的にスクリーンショットを撮る
    if (this.props.onThumbnailChange) {
      const { globalEvent } = this.state;
      const cache = new Set();
      globalEvent.on('message.capture', event => {
        const { value } = event.data || {};
        if (!cache.has(value)) {
          this.props.onThumbnailChange(value);
          cache.add(value);
        }
      });
      const screenShotLater = async () => {
        await new Promise(resolve => window.setTimeout(resolve, 10 * 1000));
        const request = {
          query: 'capture',
          type: 'image/jpeg',
          requestedBy: 'auto' // 自動的にリクエストされることを表す
        };
        await this.state.globalEvent.emitAsync('postMessage', request);
        screenShotLater();
      };
      screenShotLater();
    }

    if (this.props.onChange) {
      // ファイルの内容を伝える（一番最初）
      this.props.onChange({ files: this.props.files });
    }

    // iframe からのイベントを伝える
    this.state.globalEvent.on('message.dispatchOnMessage', event => {
      if (this.props.onMessage) {
        this.props.onMessage({ ...event });
      }
    });
  }

  async componentDidUpdate(prevProps, prevState) {
    const { localization, project } = this.props;

    if (prevProps.project !== project) {
      this.setProject(project);
    }
    if (prevProps.localization !== localization) {
      this.state.fileView.forceUpdate();
      this.setState({ reboot: true });
    }

    if (this.state.reboot) {
      this.setState({ reboot: false });
    }
    // ファイル変更検知
    if (this.props.onChange && prevState.fileView !== this.state.fileView) {
      this.props.onChange({ files: this.state.fileView.files });
    }
    // 未オートセーブでファイルが更新されたとき、あらたにセーブデータを作る
    if (!this.state.project && prevState.fileView !== this.state.fileView) {
      if (process.env.NODE_ENV !== 'production') {
        // development のときは自動で作られない
        return;
      }
      if (this.props.disableLocalSave) {
        // disableLocalSave のときは自動で作られない
        return;
      }
      // Create new project
      try {
        const project = await createProject(
          this.state.fileView.files.map(item => item.serialize())
        );
        await this.setProject(project);
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
          onActionClick: () => {
            this.openFileDialog(CloneDialog, {
              files: this.state.fileView.files,
              project: this.state.project,
              setProject: this.setProject,
              launchIDE: this.props.launchIDE
            });
          }
        }
      });
    }
  }

  componentWillUnmount() {
    this.state.fileView.uninstall();
  }

  async setStatePromise(state) {
    return new Promise(resolve => {
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
        ? multiple
          ? bundle(files)
          : files.json
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
    new Promise(resolve => {
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
    new Promise(resolve => {
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

  toggleShowAll = () => this.setStatePromise({ showAll: !this.state.showAll });

  openFileDialog = () => console.info('openFileDialog has not be declared');
  handleFileDialog = ref => ref && (this.openFileDialog = ref.open);

  render() {
    if (this.componentWillMountCompat) {
      // render よりも先に呼ばれるライフサイクルメソッドがないので,
      // ここで呼んでいる. 一度しか呼ばれないように参照を null にする
      this.componentWillMountCompat();
      this.componentWillMountCompat = null;
      return null;
    }

    const { localization, disableLocalSave } = this.props;
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
        {disableLocalSave ? null : (
          <Menu
            {...commonProps}
            setLocalization={this.props.setLocalization}
            openFileDialog={this.openFileDialog}
            saveAs={this.saveAs}
            project={this.state.project}
            setProject={this.setProject}
            updateCard={this.updateCard}
            launchIDE={this.props.launchIDE}
            showAll={this.state.showAll}
            toggleShowAll={this.toggleShowAll}
            globalEvent={this.state.globalEvent}
          />
        )}
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
          monitorType={this.state.monitorType}
          saveAs={this.saveAs}
          toggleFullScreen={this.handleToggleFullScreen}
          togglePopout={this.handleTogglePopout}
          showNotice={this.handleShowNotice}
          deleteFile={this.deleteFile}
          ref={this.handleContainerRef}
          globalEvent={this.state.globalEvent}
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
