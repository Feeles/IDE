import React, { PureComponent, PropTypes } from 'react';
import { DropTarget } from 'react-dnd';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import LinearProgress from 'material-ui/LinearProgress';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import { red50, red500 } from 'material-ui/styles/colors';
import transitions from 'material-ui/styles/transitions';
import { fade } from 'material-ui/utils/colorManipulator';
import HardwareKeyboardBackspace from 'material-ui/svg-icons/hardware/keyboard-backspace';
import ContentSave from 'material-ui/svg-icons/content/save';
import NavigationExpandLess from 'material-ui/svg-icons/navigation/expand-less';
import { emphasize } from 'material-ui/utils/colorManipulator';
import { Pos } from 'codemirror';
import beautify from 'js-beautify';


import DragTypes from '../utils/dragTypes';
import Editor from './Editor';
import CreditBar from './CreditBar';
import PlayMenu from './PlayMenu';
import AssetButton from './AssetButton';


const getStyle = (props, state, context) => {
  const {
    palette,
  } = context.muiTheme;

  return {
    root: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    error: {
      flex: '0 1 auto',
      margin: 0,
      padding: 8,
      borderStyle: 'double',
      backgroundColor: red50,
      color: red500,
      fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace',
      overflow: 'scroll',
    },
    editorContainer: {
      flex: '1 1 auto',
      position: 'relative',
    },
    menuBar: {
      display: 'flex',
      backgroundColor: palette.canvasColor,
      borderBottom: `1px solid ${palette.primary1Color}`,
      zIndex: 3,
    },
    barButton: {
      padding: 0,
      lineHeight: 2,
    },
    barButtonLabel: {
      fontSize: '.5rem',
    },
    progressColor: palette.primary1Color,
    progress: {
      borderRadius: 0,
    },
    assetContainer: {
      position: 'absolute',
      width: '100%',
      height: state.assetFileName ? '100%' : 0,
      boxSizing: 'border-box',
      overflow: 'hidden',
      zIndex: 2,
      transition: transitions.easeOut(),
    },
    scroller: {
      width: '100%',
      height: '100%',
      overflowX: 'auto',
      overflowY: 'scroll',
      display: 'flex',
      flexWrap: 'wrap',
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      backgroundColor: fade(emphasize(palette.canvasColor, 0.75), 0.25),
    },
    closeAsset: {
      position: 'absolute',
      right: 10,
      bottom: 10,
    },
  };
};

export default class SourceEditor extends PureComponent {

  static propTypes = {
    file: PropTypes.object.isRequired,
    getFiles: PropTypes.func.isRequired,
    setLocation: PropTypes.func.isRequired,
    href: PropTypes.string.isRequired,
    getConfig: PropTypes.func.isRequired,
    findFile: PropTypes.func.isRequired,
    reboot: PropTypes.bool.isRequired,
    localization: PropTypes.object.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,
    closeSelectedTab: PropTypes.func.isRequired,
    selectTabFromFile: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    showHint: !this.props.file.is('json'),
    hasHistory: false,
    hasChanged: false,
    loading: false,
    snippets: [],

    assetFileName: null,
    assetLineNumber: 0,
    appendToHead: true,
    classNameStyles: [],
  };

  _widgets = new Map();

  componentWillMount() {
    this.setState({
      snippets: this.props.getConfig('snippets')(this.props.file),
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      snippets: nextProps.getConfig('snippets')(nextProps.file),
    });
  }

  componentDidMount() {
    if (this.codemirror) {
      this.codemirror.on('beforeChange', this.handleIndexReplacement);
      this.codemirror.on('change', this.handleIndentLine);
      this.codemirror.on('change', (cm) => this.setState({
        hasHistory: cm.historySize().undo > 0,
        hasChanged: cm.getValue('\n') !== this.props.file.text,
      }));
      this.codemirror.on('change', this.handleUpdateWidget);
      this.codemirror.on('update', this.handleRenderWidget);

      this.codemirror.clearHistory();
      this.handleUpdateWidget(this.codemirror);
    }
  }

  get assets() {
    if (this.state.assetFileName) {
      const file = this.props.findFile(this.state.assetFileName);
      if (file) {
        try {
          return JSON.parse(file.text);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [];
  }

  handleSave = async () => {
    if (!this.codemirror) {
      return;
    }
    const text = this.codemirror.getValue('\n');
    const babelrc = this.props.getConfig('babelrc');

    if (text === this.props.file.text) {
      return;
    }

    this.setState({
      hasChanged: false,
      loading: true,
    });

    const file = await this.props.putFile(
      this.props.file,
      this.props.file.set({ text })
    );

    // Like a watching
    file.babel(babelrc)
      .catch((err) => {
        this.props.selectTabFromFile(file);
        throw e;
      });

    this.setState({
      loading: false,
    });
  };

  handleUndo = () => {
    if (!this.codemirror) {
      return;
    }

    this.codemirror.undo();
  };

  handleUpdateWidget = (cm, change) => {
    const {
      paper,
      palette,
    } = this.context.muiTheme;

    this._widgets.clear();
    for (const [line, text] of cm.getValue('\n').split('\n').entries()) {
      this.updateWidget(cm, line, text);
    }
  };

  updateWidget = (cm, line, text) => {
    // Syntax: ____/ assets/sample.json \____
    const begin = /\_{4,}\/(.*)\\\_{4,}/.exec(text);
    // Syntax: \____ assets/sample.json ____/
    const end = /\\\_{4,}(.*)\_{4,}\//.exec(text);

    if (begin || end) {
      const element = document.createElement('span');
      element.textContent = text.replace(/\t/g, '    ');
      element.classList.add(`Feeles-asset-opener-${begin ? 'begin' : 'end'}`);
      element.onclick = () => {
        this.setState({
          assetFileName: (begin || end)[1].trim(),
          assetLineNumber: line + (begin ? 1 : 0),
          appendToHead: !!begin,
        });
      };
      this._widgets.set(line, element);
    }
  };

  handleRenderWidget = (cm) => {
    // remove old widgets
    for (const widget of [...document.querySelectorAll('.Feeles-asset-opener-begin,.Feeles-asset-opener-end')]) {
      if (widget.parentNode) {
        widget.parentNode.removeChild(widget);
      }
    }
    // render new widgets
    for (const [i, element] of this._widgets.entries()) {
      cm.addWidget(new Pos(i, 0), element);
    }
  };

  handleIndexReplacement = (cm, change) => {
    if (!['asset', 'paste'].includes(change.origin)) return;
    // item{N} のような変数を探す. e.g. From "const item1 = 'hello';", into [1]
    // 戻り値は Array<Number>
    const sourceIndexes = searchItemIndexes(change.text.join('\n'));
    if (sourceIndexes.length < 1) return;

    // すでに使われている変数と, 被っていないか調べる
    const usedIndexes = searchItemIndexes(cm.getValue('\n'));
    const duplicatedIndexes = sourceIndexes.filter(i => usedIndexes.includes(i));

    if (duplicatedIndexes.length > 0) {
      let _next = 0; // 使えるインデックスを探すカーソル. 効率化のために残す
      let _replaced = change.text.join('\n'); // ひとつずつ置換していくためのバッファ
      for (const i of duplicatedIndexes) {
        // update next
        for (_next++; usedIndexes.includes(_next) && _next < 10000; _next++);
        const from = new RegExp(`item${i}`, 'g');
        const to = `item${_next}`;
        _replaced = _replaced.replace(from, to);
      }
      change.update(change.from, change.to, _replaced.split('\n'));
    }
  };

  handleAssetClose = () => {
    this.setState({assetFileName: null});
  };

  setLocation = async (href) => {

    await this.handleSave();

    return this.props.setLocation(href);

  };

  handleCodemirror = (ref) => {
    if (!ref) {
      return;
    }
    this.codemirror = ref;
  };

  handleAssetInsert = ({code, description}) => {
    const {assetLineNumber} = this.state;
    const pos = new Pos(assetLineNumber, 0);
    const end = new Pos(pos.line + code.split('\n').length, 0);
    code = this.state.appendToHead ? '\n' + code : code + '\n';
    this.codemirror.replaceRange(code, pos, pos, 'asset');
    // トランジション（フェードイン）
    const fadeInMarker = this.codemirror.markText(pos, end, {
      className: `emphasize-${Date.now()}`,
      clearOnEnter: true,
    });
    this.emphasizeTextMarker(fadeInMarker);

    this.handleAssetClose();
  };

  emphasizeTextMarker = async (textMarker) => {
    const begin = {
      className: textMarker.className,
      style: `opacity: 0; background-color: rgba(0,0,0,1)`
    };
    const end = {
      className: textMarker.className,
      style: `opacity: 1; background-color: rgba(0,0,0,0.1); transition: ${transitions.easeOut()}`
    };
    textMarker.on('clear', () => {
      this.setState(prevState => ({
        classNameStyles: prevState.classNameStyles.filter(item => begin !== item && end !== item),
      }));
    });

    this.setState(prevState => ({
      classNameStyles: prevState.classNameStyles.concat(begin),
    }));
    await wait(500);
    this.setState(prevState => ({
      classNameStyles: prevState.classNameStyles.map(item => item === begin ? end : item),
    }));
  };

  handleIndentLine = (cm, change) => {
    if (!['asset', 'paste'].includes(change.origin)) return;
    const {from} = change;
    const to = new Pos(from.line + change.text.length, 0);
    // インデント
    for (let line = from.line; line < to.line; line++) {
      cm.indentLine(line, 'prev');
    }
  };

  render() {
    const {
      file,
      getConfig,
      findFile,
      localization,
      href,

      connectDropTarget,
    } = this.props;
    const {
      showHint,
    } = this.state;

    const styles = getStyle(this.props, this.state, this.context);

    const snippets = getConfig('snippets')(file);

    const props = Object.assign({}, this.props, {
      codemirrorRef: this.handleCodemirror,
      onChange: undefined,
      handleRun: () => this.props.setLocation(),
      showHint,
    });

    return (
      <div style={styles.root}>
        <style>
        {this.state.classNameStyles.map(item =>
          `.${item.className} { ${item.style} } `)}
        </style>
      {file.error ? (
        <pre style={styles.error}>{file.error.message}</pre>
      ) : null}
        <div style={styles.menuBar}>
          <FlatButton
            label={localization.editorCard.undo}
            disabled={!this.state.hasHistory}
            style={styles.barButton}
            labelStyle={styles.barButtonLabel}
            icon={<HardwareKeyboardBackspace />}
            onTouchTap={this.handleUndo}
          />
          <FlatButton
            label={localization.editorCard.save}
            disabled={!this.state.hasChanged}
            style={styles.barButton}
            labelStyle={styles.barButtonLabel}
            icon={<ContentSave />}
            onTouchTap={this.handleSave}
          />
          <div style={{ flex: '1 1 auto' }}></div>
          <PlayMenu
            getFiles={this.props.getFiles}
            setLocation={this.setLocation}
            href={this.props.href}
            localization={this.props.localization}
          />
        </div>
      {this.state.loading ? (
        <LinearProgress
          color={styles.progressColor}
          style={styles.progress}
        />
      ) : null}
        <div style={styles.editorContainer}>
          <div style={styles.assetContainer}>
            <div style={styles.scroller}>
              {this.assets.map((item, i) => (
                <AssetButton
                  {...item}
                  key={i}
                  onTouchTap={this.handleAssetInsert}
                  findFile={this.props.findFile}
                  localization={this.props.localization}
                />
              ))}
            </div>
            <FloatingActionButton secondary style={styles.closeAsset} onTouchTap={this.handleAssetClose}>
              <NavigationExpandLess />
            </FloatingActionButton>
          </div>
          <Editor
            {...props}
            snippets={this.state.snippets}
          />
        </div>
        <CreditBar
          file={file}
          openFileDialog={this.props.openFileDialog}
          putFile={this.props.putFile}
          localization={localization}
          getFiles={this.props.getFiles}
        />
      </div>
    );
  }
}

function wait(millisec) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, millisec);
  });
}

function searchItemIndexes(text, limit = 1000) {
  let regExp = /(const|let)\sitem(\d+)\s/g;
  text = beautify(text);

  const indexes = [];
  for (let i = 0, result = null; (result = regExp.exec(text)) && i < limit; i++) {
    indexes.push(+result[2]);
  }
  return indexes;
}
