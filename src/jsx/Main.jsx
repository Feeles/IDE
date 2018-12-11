import React, { Component } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import EventEmitter from 'eventemitter2';
import Snackbar from '@material-ui/core/Snackbar';
import jsyaml from 'js-yaml';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Drawer from '@material-ui/core/Drawer';
import NavigationArrowBack from '@material-ui/icons/ArrowBack';
import ToggleCheckBox from '@material-ui/icons/CheckBox';
import ToggleCheckBoxOutlineBlank from '@material-ui/icons/CheckBoxOutlineBlank';
import convertAsset from '../utils/convertAsset';

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
import CardContainer from '../Cards/CardContainer';
import CloneDialog from '../Menu/CloneDialog';
import icons from './icons';

const DOWNLOAD_ENABLED =
  typeof document.createElement('a').download === 'string';

const cn = {
  root: style({
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.15
  }),
  alignRight: style({
    textAlign: 'right'
  }),
  drawer: {
    paper: style({
      position: 'absolute'
    })
  }
};

@withTheme()
export default class Main extends Component {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    cardProps: PropTypes.object.isRequired,
    setCardProps: PropTypes.func.isRequired,
    openSidebar: PropTypes.bool.isRequired,
    mini: PropTypes.bool.isRequired,
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
    disableLocalSave: PropTypes.bool.isRequired,
    asset: PropTypes.object
  };

  state = {
    openSidebar: false,
    monitorType: MonitorTypes.Card,

    fileView: new FileView(this.props.files),
    reboot: false,
    href: 'index.html',

    project: this.props.project,
    notice: null,
    // Advanced Mode
    showAll: false,
    // card =(emit)=> globalEvent =(on)=> card
    globalEvent: new EventEmitter({ wildcard: true }),
    // Asset definition exactly using
    asset: null
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
  }

  componentDidMount() {
    this.updateAssetDefinition();

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

    const feelesrc = this.loadConfig('feelesrc');
    this.props.setMuiTheme(feelesrc);
  }

  async componentDidUpdate(prevProps, prevState) {
    // mini の場合, openSidebar の props に追従 (stateless)
    if (this.props.mini && this.props.openSidebar !== this.state.openSidebar) {
      this.setState({
        openSidebar: this.props.openSidebar
      });
    }

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

  handleShowNotice = notice =>
    this.setStatePromise({
      notice
    });

  toggleShowAll = () => this.setStatePromise({ showAll: !this.state.showAll });

  openFileDialog = () => console.info('openFileDialog has not be declared');
  handleFileDialog = ref => ref && (this.openFileDialog = ref.open);

  setCardVisibility = (name, visible = false) => {
    this.props.setCardProps(prevProps => {
      const current = prevProps[name];
      if (!current) {
        throw TypeError(`Property ${name} is not found in cardProps`);
      }
      return {
        ...prevProps,
        [name]: {
          ...current,
          visible
        }
      };
    });
  };

  toggleSidebar = () => {
    if (this.props.mini) return; // mini の場合, stateless
    this.setState({
      openSidebar: !this.state.openSidebar
    });
  };

  renderMenuItem = (item, index) => {
    const { localization } = this.props;

    const lowerCase =
      item.name.substr(0, 1).toLowerCase() + item.name.substr(1);
    const localized = localization[lowerCase];
    const visible = this.props.cardProps[item.name].visible;
    return (
      <MenuItem
        key={index}
        onClick={() => {
          this.setCardVisibility(item.name, !visible);
        }}
      >
        <ListItemIcon>{item.icon}</ListItemIcon>
        <ListItemText>{localized ? localized.title : item.name}</ListItemText>
        <ListItemIcon>
          {visible ? <ToggleCheckBox /> : <ToggleCheckBoxOutlineBlank />}
        </ListItemIcon>
      </MenuItem>
    );
  };

  /**
   * 現行: アセット定義を setState する
   * 互換: 旧アセット定義を変換して使用する
   */
  updateAssetDefinition() {
    const { asset } = this.props;
    if (asset) {
      if (asset !== this.state.asset) {
        this.setState({ asset });
      }
      return;
    }
    // 互換モード
    const configs = this.state.fileView
      .getFilesByExtention('asset.yml')
      .map(file => file.text + '');
    const compatibleAsset = convertAsset(configs);
    this.setState({
      asset: compatibleAsset
    });
  }

  render() {
    if (this.componentWillMountCompat) {
      // render よりも先に呼ばれるライフサイクルメソッドがないので,
      // ここで呼んでいる. 一度しか呼ばれないように参照を null にする
      this.componentWillMountCompat();
      this.componentWillMountCompat = null;
      return null;
    }

    const { localization, mini } = this.props;

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
      <div className={cn.root}>
        {mini ? null : (
          <Menu
            {...commonProps}
            cardProps={this.props.cardProps}
            toggleSidebar={this.toggleSidebar}
            setLocalization={this.props.setLocalization}
            openFileDialog={this.openFileDialog}
            saveAs={this.saveAs}
            project={this.state.project}
            setCardVisibility={this.setCardVisibility}
            showAll={this.state.showAll}
            toggleShowAll={this.toggleShowAll}
            globalEvent={this.state.globalEvent}
          />
        )}
        <Drawer
          variant="persistent"
          open={this.state.openSidebar}
          onClose={this.toggleSidebar}
          classes={cn.drawer}
        >
          {this.props.mini ? null : (
            <div className={cn.alignRight}>
              <IconButton onClick={this.toggleSidebar}>
                <NavigationArrowBack />
              </IconButton>
            </div>
          )}
          {icons.map(this.renderMenuItem)}
        </Drawer>
        <CardContainer
          {...commonProps}
          cardProps={this.props.cardProps}
          setCardVisibility={this.setCardVisibility}
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
          asset={this.state.asset}
        />
        <FileDialog
          ref={this.handleFileDialog}
          localization={this.props.localization}
          getConfig={this.getConfig}
          setConfig={this.setConfig}
          globalEvent={this.state.globalEvent}
        />
        <style>{codemirrorStyle(this.props.theme)}</style>
        {userStyle ? <style>{userStyle.text}</style> : null}
        <Snackbar
          open={this.state.notice !== null}
          message=""
          autoHideDuration={4000}
          onClose={() => this.setState({ notice: null })}
          {...this.state.notice}
        />
      </div>
    );
  }
}
