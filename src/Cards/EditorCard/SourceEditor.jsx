import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import LinearProgress from 'material-ui/LinearProgress';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import transitions from 'material-ui/styles/transitions';
import { fade } from 'material-ui/utils/colorManipulator';
import HardwareKeyboardBackspace
  from 'material-ui/svg-icons/hardware/keyboard-backspace';
import ContentSave from 'material-ui/svg-icons/content/save';
import NavigationExpandLess from 'material-ui/svg-icons/navigation/expand-less';
import { emphasize } from 'material-ui/utils/colorManipulator';
import { Pos } from 'codemirror';
import beautify from 'js-beautify';

import ga from 'utils/google-analytics';
import Editor from './Editor';
import CreditBar from './CreditBar';
import PlayMenu from './PlayMenu';
import AssetButton from './AssetButton';
import ErrorPane from './ErrorPane';

const getStyle = (props, state, context) => {
  const { palette } = context.muiTheme;

  return {
    root: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch'
    },
    editorContainer: {
      flex: '1 1 auto',
      position: 'relative'
    },
    menuBar: {
      display: 'flex',
      backgroundColor: palette.canvasColor,
      borderBottom: `1px solid ${palette.primary1Color}`,
      zIndex: 3
    },
    barButton: {
      padding: 0,
      lineHeight: 2
    },
    barButtonLabel: {
      fontSize: '.5rem'
    },
    progressColor: palette.primary1Color,
    progress: {
      borderRadius: 0
    },
    assetContainer: {
      position: 'absolute',
      width: '100%',
      height: state.assetFileName ? '100%' : 0,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 10,
      transition: transitions.easeOut()
    },
    scroller: {
      flex: 1,
      overflowX: 'auto',
      overflowY: 'scroll',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      boxSizing: 'border-box',
      paddingTop: 20,
      paddingBottom: 60,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      backgroundColor: fade(emphasize(palette.canvasColor, 0.75), 0.25)
    },
    closeAsset: {
      marginBottom: 10,
      textAlign: 'center',
      backgroundColor: palette.primary1Color,
      borderTopRightRadius: 0,
      borderTopLeftRadius: 0,
      cursor: 'pointer'
    }
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
    docsRef: PropTypes.func
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
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
    classNameStyles: []
  };

  _widgets = new Map();

  componentWillMount() {
    this.setState({
      snippets: this.props.getConfig('snippets')(this.props.file)
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      snippets: nextProps.getConfig('snippets')(nextProps.file)
    });
  }

  componentDidMount() {
    if (this.codemirror) {
      this.codemirror.on('beforeChange', this.handleIndexReplacement);
      this.codemirror.on('change', this.handleIndentLine);
      const onChange = cm => {
        this.setState({
          hasHistory: cm.historySize().undo > 0,
          hasChanged: cm.getValue('\n') !== this.props.file.text
        });
      };
      this.codemirror.on('change', onChange);
      this.codemirror.on('swapDoc', onChange);
      this.codemirror.on('change', this.handleUpdateWidget);
      this.codemirror.on('swapDoc', this.handleUpdateWidget);
      this.codemirror.on('update', this.handleRenderWidget);

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

    this.setState({ hasChanged: false, loading: true });

    const file = await this.props.putFile(
      this.props.file,
      this.props.file.set({ text })
    );

    // Like a watching
    file.babel(babelrc).catch(e => {
      this.props.selectTabFromFile(file);
    });

    this.setState({ loading: false });

    ga('send', 'event', 'Code', 'save', this.props.file.name);
  };

  handleUndo = () => {
    if (!this.codemirror) {
      return;
    }

    this.codemirror.undo();
  };

  handleUpdateWidget = (cm, change) => {
    const { paper, palette } = this.context.muiTheme;

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
          appendToHead: !!begin
        });
      };
      this._widgets.set(line, element);
    }
  };

  handleRenderWidget = cm => {
    // remove old widgets
    for (const widget of [
      ...document.querySelectorAll(
        '.Feeles-asset-opener-begin,.Feeles-asset-opener-end'
      )
    ]) {
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

    for (const keyword of ['item', 'map']) {
      // すでに使われている item{N} のような変数を探す.
      // 戻り値は Array<Number>
      // e.g. From "const item1 = 'hello';", into [1]
      const usedIndexes = searchItemIndexes(cm.getValue('\n'), keyword);
      if (usedIndexes.length < 1) continue;

      const sourceText = change.text.join('\n');
      if (usedIndexes.some(i => sourceText.includes(keyword + i))) {
        // もし名前が競合していたら…
        const max = Math.max.apply(null, usedIndexes);
        const regExp = new RegExp(`${keyword}(\\d+)`, 'g');
        const text = sourceText.replace(regExp, (match, n) => {
          // item{n} => item{n+max}
          n = n >> 0;
          return keyword + (n + max);
        });
        change.update(change.from, change.to, text.split('\n'));
      }
    }
  };

  handleAssetClose = () => {
    this.setState({ assetFileName: null });
  };

  setLocation = async href => {
    await this.handleSave();
    return this.props.setLocation(href);
  };

  handleCodemirror = ref => {
    if (!ref) {
      return;
    }
    this.codemirror = ref;
  };

  handleAssetInsert = ({ code, description }) => {
    const { assetLineNumber } = this.state;
    const pos = new Pos(assetLineNumber, 0);
    const end = new Pos(pos.line + code.split('\n').length, 0);
    code = this.state.appendToHead ? '\n' + code : code + '\n';
    this.codemirror.replaceRange(code, pos, pos, 'asset');
    // トランジション（フェードイン）
    const fadeInMarker = this.codemirror.markText(pos, end, {
      className: `emphasize-${Date.now()}`,
      clearOnEnter: true
    });
    this.emphasizeTextMarker(fadeInMarker);
    // スクロール
    this.codemirror.scrollIntoView(
      {
        from: pos,
        to: end
      },
      10
    );
    // カーソル (挿入直後に undo したときスクロールが上に戻るのを防ぐ)
    this.codemirror.focus();
    this.codemirror.setCursor(end);
    // Pane をとじる
    this.handleAssetClose();
    // 実行 (UIが固まらないように時間をおいている)
    setTimeout(this.setLocation, 1000);
  };

  emphasizeTextMarker = async textMarker => {
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
        classNameStyles: prevState.classNameStyles.filter(
          item => begin !== item && end !== item
        )
      }));
    });

    this.setState(prevState => ({
      classNameStyles: prevState.classNameStyles.concat(begin)
    }));
    await wait(500);
    this.setState(prevState => ({
      classNameStyles: prevState.classNameStyles.map(
        item => (item === begin ? end : item)
      )
    }));
  };

  handleIndentLine = (cm, change) => {
    if (!['asset', 'paste'].includes(change.origin)) return;
    const { from } = change;
    const to = new Pos(from.line + change.text.length, 0);
    // インデント
    for (let line = from.line; line < to.line; line++) {
      cm.indentLine(line);
    }
  };

  handleRestore = () => {
    // ひとつ戻して再実行する
    this.handleUndo();
    this.setLocation();
  };

  render() {
    const {
      file,
      getConfig,
      findFile,
      localization,
      href,

      connectDropTarget
    } = this.props;
    const { showHint } = this.state;

    const styles = getStyle(this.props, this.state, this.context);

    const snippets = getConfig('snippets')(file);

    const props = Object.assign({}, this.props, {
      codemirrorRef: this.handleCodemirror,
      onChange: undefined,
      handleRun: () => this.setLocation(),
      showHint
    });

    return (
      <div style={styles.root}>
        <style>
          {this.state.classNameStyles.map(
            item => `.${item.className} { ${item.style} } `
          )}
        </style>
        <ErrorPane
          error={file.error}
          localization={localization}
          onRestore={this.handleRestore}
        />
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
          <div
            style={{
              flex: '1 1 auto'
            }}
          />
          <PlayMenu
            getFiles={this.props.getFiles}
            setLocation={this.setLocation}
            href={this.props.href}
            localization={this.props.localization}
          />
        </div>
        {this.state.loading
          ? <LinearProgress
              color={styles.progressColor}
              style={styles.progress}
            />
          : null}
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
            <Paper
              zDepth={2}
              style={styles.closeAsset}
              onTouchTap={this.handleAssetClose}
            >
              <NavigationExpandLess color="white" />
            </Paper>
          </div>
          <Editor
            {...props}
            snippets={this.state.snippets}
            docsRef={this.props.docsRef}
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

function searchItemIndexes(text, keyword, limit = 1000) {
  const regExp = new RegExp(String.raw`(const|let)\s${keyword}(\d+)\s`, 'g');
  text = beautify(text);

  const indexes = [];
  for (
    let i = 0, result = null;
    (result = regExp.exec(text)) && i < limit;
    i++
  ) {
    indexes.push(+result[2]);
  }
  return indexes;
}
