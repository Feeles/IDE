import React, {PropTypes, Component} from 'react';
import ReactDOM from 'react-dom';

import { DropTarget } from 'react-dnd';
import { faintBlack } from 'material-ui/styles/colors';
import transitions from 'material-ui/styles/transitions';
import injectTapEventPlugin from 'react-tap-event-plugin';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();


import {
  putFile,
  deleteFile,
} from '../database/';
import { BinaryFile, SourceFile, configs } from '../File/';
import EditorPane, { codemirrorStyle } from '../EditorPane/';
import Hierarchy from '../Hierarchy/';
import Monitor, { MonitorTypes, maxByPriority } from '../Monitor/';
import Menu from '../Menu/';
import Sizer from './Sizer';
import FileDialog, { SaveDialog, RenameDialog, DeleteDialog } from '../FileDialog/';
import DragTypes from '../utils/dragTypes';
import { Tab } from '../ChromeTab/';
import * as Cards from '../Cards/';

const DOWNLOAD_ENABLED = typeof document.createElement('a').download === 'string';

const getStyle = (props, state, palette) => {
  const { isResizing } = state;
  const shrinkLeft = parseInt(props.rootStyle.width, 10) - state.monitorWidth < 200;
  const shrinkRight = state.monitorWidth < 100;

  return {

    shrinkLeft,
    shrinkRight,

    root: {
      position: 'relative',
      width: '100%',
      backgroundColor: palette.backgroundColor,
      overflow: 'scroll',
    },
    container: {
      display: 'flex',
      alignItems: 'stretch',
    },
    left: {
      flex: shrinkLeft ? '0 0 auto' : '1 1 auto',
      width: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    right: {
      flex: shrinkLeft ? '1 1 auto' : '0 0 auto',
      boxSizing: 'border-box',
      width: shrinkRight ? 0 : state.monitorWidth,
      paddingBottom: 4,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    dropCover: {
      position: 'absolute',
      opacity: isResizing ? 1 : 0,
      width: isResizing ? '100%' : 0,
      height: isResizing ? '100%' : 0,
      backgroundColor: faintBlack,
      zIndex: 2000,
      transition: transitions.easeOut(null, 'opacity'),
    },
  };
};

class Main extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    rootStyle: PropTypes.object.isRequired,
    project: PropTypes.object,
    launchIDE: PropTypes.func.isRequired,
    inlineScriptId: PropTypes.string,
    localization: PropTypes.object.isRequired,
    setLocalization: PropTypes.func.isRequired,
    setMuiTheme: PropTypes.func.isRequired,

    connectDropTarget: PropTypes.func.isRequired,
  };

  state = {
    monitorWidth: this.rootWidth / 2,
    monitorHeight: this.rootHeight,
    isResizing: false,
    monitorType: MonitorTypes.Card,

    files: this.props.files,
    reboot: false,
    href: 'index.html',

    tabs: [],

    port: null,
    coreString: null,

    project: this.props.project,

    cards: [{
      name: 'MonitorCard',
      visible: true,
      order: 0,
    }, {
      name: 'MediaCard',
      visible: true,
      order: 1,
    }, {
      name: 'ReadmeCard',
      visible: true,
      order: 2,
    }, {
      name: 'SnippetCard',
      visible: true,
      order: 3,
    }, {
      name: 'PaletteCard',
      visible: false,
      order: 4,
    }, {
      name: 'EnvCard',
      visible: true,
      order: 5,
    }, {
      name: 'CustomizeCard',
      visible: false,
      order: 6,
    }, {
      name: 'CreditsCard',
      visible: false,
      order: 7,
    }, {
      name: 'ShotCard',
      visible: false,
      order: 8,
    }, {
      name: 'EditorCard',
      visible: false,
      order: 9,
    }, {
      name: 'HierarchyCard',
      visible: false,
      order: 10,
    }],
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
    const pred = typeof name === 'function' ? name :
      (file) => (
        !file.options.isTrashed &&
        (file.name === name || file.moduleName === name)
      );

    return multiple ? files.filter(pred) : files.find(pred) || null;
  };

  componentDidMount() {
    const {
      inlineScriptId,
    } = this.props;

    document.title = this.getConfig('ogp')['og:title'];

    if (inlineScriptId) {
      const inlineLib = document.getElementById(inlineScriptId);
      if (inlineLib) {
        this.setState({
          coreString: inlineLib.textContent,
        });
      } else {
        throw `Missing script element has id="${inlineScriptId}"`;
      }
    } else {
      fetch(CORE_CDN_URL, { mode: 'cors' })
        .then(response => {
          if (!response.ok) {
            throw response.error ? response.error() : response.statusText;
          }
          return response.text();
        })
        .then((coreString) => this.setState({ coreString }));
    }

    this.setState({ reboot: true });
  }

  componentDidUpdate() {
    if (this.state.reboot) {
      this.setState({ reboot: false });
    }

    document.title = this.getConfig('ogp')['og:title'];
  }

  async setStatePromise(state) {
    return new Promise((resolve, reject) => {
      this.setState(state, resolve);
    });
  }

  addFile = async (file) => {
    await 1; // Be async
    const timestamp = file.lastModified || Date.now();
    const remove = this.inspection(file);
    if (file === remove) {
      return file;
    }
    this._configs.clear();
    const files = this.state.files
      .concat(file)
      .filter((item) => item !== remove);

    await this.setStatePromise({ files });

    if (this.state.project) {
      await putFile(this.state.project.id, file.serialize());
    }
    return file;
  };

  putFile = async (prevFile, nextFile) => {
    await 1; // Be async
    const timestamp = nextFile.lastModified || Date.now();
    const remove = this.inspection(nextFile);
    if (remove === nextFile) {
      return prevFile;
    }
    this._configs.clear();
    const files = this.state.files
      .filter((item) => item !== remove && item.key !== prevFile.key)
      .concat(nextFile);

    await this.setStatePromise({ files });

    if (this.state.project) {
      await putFile(this.state.project.id, nextFile.serialize());
    }
    return nextFile;
  };

  deleteFile = async (...targets) => {
    await 1; // Be async
    const timestamp = Date.now();

    const keys = targets.map((item) => item.key);
    const files = this.state.files.filter((item) => !keys.includes(item.key));
    await this.setStatePromise({ files });

    if (this.state.project) {
      const fileNames = targets.map((item) => item.name);
      await deleteFile(this.state.project.id, ...fileNames);
    }
  };

  _configs = new Map();
  getConfig = (key) => {
    if (this._configs.has(key)) {
      return this._configs.get(key);
    } else {
      const { test, defaultValue, multiple, bundle } = configs.get(key);
      const files = this.findFile((file) => (
        !file.options.isTrashed && test.test(file.name)
      ), multiple);

      const value = files ? (
        multiple ? bundle(files) : files.json
      ) : defaultValue;
      this._configs.set(key, value);
      return value;
    }
  };

  setConfig = (key, config) => {
    this._configs.delete(key);

    const { test, defaultName } = configs.get(key);
    const configFile = this.findFile((file) => (
      !file.options.isTrashed && test.test(file.name)
    ), false);

    // Update Mui theme
    if (key === 'palette') {
      this.props.setMuiTheme({
        palette: config,
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

  selectTab = (tab) => new Promise((resolve, reject) => {
    const tabs = this.state.tabs.map((item) => {
      if (item.isSelected) return item.select(false);
      return item;
    });

    const found = tabs.find((item) => item.is(tab));
    if (found) {
      const replace = found.select(true);
      this.setState({
        tabs: tabs.map((item) => item === found ? replace : item),
      }, () => resolve(replace));
    } else {
      if (!tab.isSelected) tab = tab.select(true);
      this.setState({
        tabs: tabs.concat(tab),
      }, () => resolve(tab));
    }
  });

  closeTab = (tab) => new Promise((resolve, reject) => {
    const tabs = this.state.tabs.filter((item) => item.key !== tab.key);
    if (tab.isSelected && tabs.length > 0) {
      tabs[0] = tabs[0].select(true);
    }
    this.setState({ tabs }, () => resolve());
  });

  saveAs = (...files) => {
    if (DOWNLOAD_ENABLED) {

      files.forEach((file) => {
        const a = document.createElement('a');
        const event = document.createEvent("MouseEvents");
        event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

        a.download = file.name;
        a.href = file.blobURL || URL.createObjectURL(
          new Blob([file.text], { type: file.type })
        );
        a.dispatchEvent(event)

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

  inspection = (newFile) => {

    const conflict = this.state.files
      .find((file) => (
        !file.options.isTrashed &&
        file.key !== newFile.key &&
        file.name === newFile.name
      ));

    if (conflict) {
      // TODO: FileDialog instead of.
      if (confirm(this.props.localization.common.conflict)) {
        return conflict;
      } else {
        return newFile;
      }
    }

    return null;
  };

  setProject = (project) => this.setStatePromise({
    project,
  });

  resize = ((waitFlag = false) =>
  (monitorWidth, monitorHeight, forceFlag = false) => {
    monitorWidth = Math.max(0, Math.min(this.rootWidth, monitorWidth));
    monitorHeight = Math.max(0, Math.min(this.rootHeight, monitorHeight));
    if (
      waitFlag && !forceFlag ||
      monitorWidth === this.state.monitorWidth &&
      monitorHeight === this.state.monitorHeight
    ) {
      return;
    }
    this.setState({ monitorWidth, monitorHeight }, () => {
      setTimeout(() => (waitFlag = false), 400);
    });
    waitFlag = true;
  })();

  handleTogglePopout = () => {
    const isPopout = this.state.monitorType === MonitorTypes.Popout;
    this.setState({
      reboot: !isPopout,
      monitorType: isPopout ?
        MonitorTypes.Card : MonitorTypes.Popout,
    });
  };

  setLocation = ({ href = 'index.html' } = { href: 'index.html' }) => {
    this.setState({
      reboot: true,
      monitorType: maxByPriority(this.state.monitorType, MonitorTypes.Card),
      href,
    });
  };

  setResizing = (isResizing) => {
    return this.setState({ isResizing })
  };

  handleToggleCard = async (name) => {
    const cards = this.state.cards.map((item) => {
      if (item.name === name) {
        return {...item, visible: !item.visible};
      }
      return item;
    });
    await this.setStatePromise({ cards });
  };

  openFileDialog = () => console.error('openFileDialog has not be declared');
  handleFileDialog = (ref) => ref && (this.openFileDialog = ref.open);

  render() {
    const {
      connectDropTarget,
    } = this.props;

    const {
      files, tabs,
      dialogContent,
      monitorWidth, monitorHeight, isResizing,
      reboot,
      port,
    } = this.state;

    const styles = getStyle(this.props, this.state, this.getConfig('palette'));

    const commonProps = {
      files,
      isResizing,
      localization: this.props.localization,
      getConfig: this.getConfig,
      setConfig: this.setConfig,
      findFile: this.findFile,
      addFile: this.addFile,
      putFile: this.putFile,
    };

    const isShrinked = (width, height) => width < 200 || height < 40;

    const cardProps = {
      EditorCard: {
        tabs,
        selectTab: this.selectTab,
        closeTab: this.closeTab,
        setLocation: this.setLocation,
        openFileDialog: this.openFileDialog,
        port,
        reboot,
        isShrinked: isShrinked(
          this.rootWidth - monitorWidth,
          this.rootHeight
        ),
        href: this.state.href,
      },
      HierarchyCard: {
        tabs,
        deleteFile: this.deleteFile,
        selectTab: this.selectTab,
        closeTab: this.closeTab,
        openFileDialog: this.openFileDialog,
        saveAs: this.saveAs,
      },
      MediaCard: {
        port: this.state.port,
      },
      ReadmeCard: {
        selectTab: this.selectTab,
        port: this.state.port,
        setLocation: this.setLocation,
      },
      ShotCard: {
        port: this.state.port,
      },
      SnippetCard: {
        tabs,
        selectTab: this.selectTab,
      },
      EnvCard: {
        selectTab: this.selectTab,
      },
      CustomizeCard: {
        selectTab: this.selectTab,
      },
      MonitorCard: {
        rootWidth: this.rootWidth,
        monitorWidth,
        isPopout: this.state.monitorType === MonitorTypes.Popout,
        togglePopout: this.handleTogglePopout,
        reboot,
        portRef: (port) => this.setState({ port }),
        coreString: this.state.coreString,
        saveAs: this.saveAs,
        href: this.state.href,
        setLocation: this.setLocation,
      },
    };

    const userStyle = this.findFile('feeles/codemirror.css');

    const orderedCardInfo = [...this.state.cards];
    orderedCardInfo.sort((a, b) => a.order - b.order);

    const left = orderedCardInfo.filter(item => item.visible && item.order % 2 === 1);
    const right = orderedCardInfo.filter(item => item.visible && item.order % 2 === 0);

    const leftCards = left.map((info, key) => {
      return React.createElement(Cards[info.name], {
        key,
        ...commonProps,
        ...cardProps[info.name],
      });
    });

    const rightCards = right.map((info, key) => {
      return React.createElement(Cards[info.name], {
        key,
        ...commonProps,
        ...cardProps[info.name],
      });
    });

    return connectDropTarget(
        <div style={styles.root}>
          <div style={styles.dropCover}></div>
          <Menu
            {...commonProps}
            togglePopout={this.handleTogglePopout}
            setLocalization={this.props.setLocalization}
            openFileDialog={this.openFileDialog}
            isPopout={this.state.monitorType === MonitorTypes.Popout}
            monitorWidth={monitorWidth}
            monitorHeight={monitorHeight}
            coreString={this.state.coreString}
            saveAs={this.saveAs}
            project={this.state.project}
            setProject={this.setProject}
            cards={this.state.cards}
            toggleCard={this.handleToggleCard}
            launchIDE={this.props.launchIDE}
          />
          <div style={styles.container}>
            <div style={styles.left}>
            {leftCards}
            </div>
            <Sizer
              monitorWidth={monitorWidth}
              monitorHeight={monitorHeight}
              onSizer={this.setResizing}
              // Be Update (won't use)
              files={files}
            />
            <div style={styles.right}>
            {rightCards}
            </div>
          </div>
          <FileDialog
            ref={this.handleFileDialog}
            localization={this.props.localization}
            getConfig={this.getConfig}
            setConfig={this.setConfig}
          />
            <style>{codemirrorStyle(this.getConfig('palette'))}</style>
          {userStyle ? (
            <style>{userStyle.text}</style>
          ) : null}
        </div>
    );
  }
}

const spec = {
  drop(props, monitor, component) {
    const offset = monitor.getDifferenceFromInitialOffset();
    const init = monitor.getItem();
    component.resize(
      init.width - offset.x,
      init.height + offset.y,
      true
    );
    return {};
  },
  hover(props, monitor, component) {
    const offset = monitor.getDifferenceFromInitialOffset();
    if (offset) {
      const init = monitor.getItem();
      component.resize(
        init.width - offset.x,
        init.height + offset.y
      );
    }
  },
};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
});

export default DropTarget(DragTypes.Sizer, spec, collect)(Main);
