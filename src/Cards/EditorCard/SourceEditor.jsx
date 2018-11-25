import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { style, classes } from 'typestyle';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Pos } from 'codemirror';
import beautify from 'js-beautify';
import includes from 'lodash/includes';

import LineWidget from './LineWidget';
import Editor from './Editor';
import MenuBar from './MenuBar';
import AssetPane from './AssetPane';
import ErrorPane from './ErrorPane';
import zenkakuToHankaku from './zenkakuToHankaku';
import foldAsset from './foldAsset';
import { withTheme } from '@material-ui/core';
import replaceExistConsts from '../../utils/replaceExistConsts';
import preserveTrailingSpaceBeautify from '../../utils/preserveTrailingSpaceBeautify';

import { assetRegExp } from '../../utils/keywords';

const cn = {
  root: style({
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch'
  }),
  editorContainer: style({
    flex: '1 1 auto',
    position: 'relative'
  }),
  barButton: style({
    padding: 0,
    lineHeight: 2
  }),
  barButtonLabel: style({
    fontSize: '.5rem'
  }),
  progress: style({
    borderRadius: 0
  }),
  blank: style({
    flex: '1 1 auto'
  }),
  assetPane: style({
    position: 'fixed',
    width: '100%',
    height: '50vh',
    zIndex: 2900,
    left: 0,
    transition: 'top 300ms'
  }),
  assetPaneIn: style({
    top: '50vh'
  }),
  assetPaneOut: style({
    top: '100vh'
  })
};

// file -> prevFile を参照する
const prevFiles = new WeakMap();

@withTheme()
export default class SourceEditor extends PureComponent {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    fileView: PropTypes.object.isRequired,
    filePath: PropTypes.string.isRequired,
    files: PropTypes.array.isRequired,
    getFiles: PropTypes.func.isRequired,
    setLocation: PropTypes.func.isRequired,
    href: PropTypes.string.isRequired,
    getConfig: PropTypes.func.isRequired,
    loadConfig: PropTypes.func.isRequired,
    findFile: PropTypes.func.isRequired,
    reboot: PropTypes.bool.isRequired,
    localization: PropTypes.object.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,
    tabs: PropTypes.array.isRequired,
    globalEvent: PropTypes.object.isRequired
  };

  state = {
    file: null,
    babelError: null,

    showHint: false,
    hasHistory: false,
    hasChanged: false,
    loading: false,
    snippets: [],
    showLineWidget: true,

    assetLineNumber: 0,
    assetScope: null,
    appendToHead: true,
    classNameStyles: []
  };

  _widgets = new Map();

  componentDidUpdate(prevProps) {
    if (prevProps.fileView !== this.props.fileView && this.state.file) {
      this.setState({
        snippets: this.props.getConfig('snippets')(this.state.file)
      });
    }

    if (this.props.filePath && this.props.filePath !== prevProps.filePath) {
      this.handleUpdateFile();
    }
  }

  componentDidMount() {
    if (this.props.filePath) {
      this.handleUpdateFile();
    }
  }

  handleCodemirror = codemirror => {
    this.codemirror = codemirror;
    this.codemirror.on('beforeChange', zenkakuToHankaku);
    this.codemirror.on('beforeChange', this.handleIndexReplacement);
    this.codemirror.on('change', this.handleIndentLine);
    const onChange = cm => {
      this.setState({
        hasHistory: cm.historySize().undo > 0,
        hasChanged: cm.getValue('\n') !== this.state.file.text
      });
    };
    this.codemirror.on('change', onChange);
    this.codemirror.on('swapDoc', onChange);
    this.codemirror.on('change', this.handleUpdateWidget);
    this.codemirror.on('swapDoc', this.handleUpdateWidget);
    this.codemirror.on('update', this.handleRenderWidget);

    this.handleUpdateWidget(this.codemirror);
    this.handleRenderWidget(this.codemirror);
    this.forceUpdate();
  };

  handleUpdateFile() {
    const { filePath, findFile } = this.props;
    const file = findFile(filePath);

    if (file && file !== this.state.file) {
      this.setFile(file);
    }
  }

  setFile(file) {
    this.setState({
      file,
      showHint: !file.is('json'),
      snippets: this.props.getConfig('snippets')(file)
    });
  }

  runApp = async href => {
    const { file } = this.state;
    if (!this.codemirror || !file) return;

    this.beautify(this.codemirror); // Auto beautify
    const text = this.codemirror.getValue();
    if (text === file.text) {
      // No change
      return;
    }

    this.setState({ hasChanged: false, loading: true, babelError: null });

    // Like a watching
    try {
      const nextFile = file.set({ text });
      await nextFile.babel();
      await this.props.putFile(file, nextFile);

      // 再読み込み
      this.props.setLocation(href);
    } catch (error) {
      this.props.globalEvent.emit('message.editor', {
        data: { value: file.name }
      }); // もう一度ファイルを開かせる

      this.setState({
        babelError: error
      });
      console.info(error);
    }

    this.setState({ loading: false });
  };

  handleUndo = () => {
    this.codemirror.undo();
  };

  handleUpdateWidget = cm => {
    this._widgets.clear();
    for (const [line, text] of cm
      .getValue('\n')
      .split('\n')
      .entries()) {
      this.updateWidget(cm, line, text);
    }
  };

  updateWidget = (cm, line, text) => {
    // Syntax: /*+ モンスター アイテム */
    const asset = assetRegExp.exec(text);
    if (asset) {
      const [, _prefix, _left, _label, _right] = asset.map(t =>
        t.replace(/\t/g, '    ')
      );
      const prefix = document.createElement('span');
      prefix.textContent = _prefix;
      prefix.classList.add('Feeles-asset-blank');
      const left = document.createElement('span');
      left.textContent = _left;
      left.classList.add('Feeles-asset-blank');
      const label = document.createElement('span');
      label.textContent = _label;
      const right = document.createElement('span');
      right.textContent = _right;
      right.classList.add('Feeles-asset-blank');
      const button = document.createElement('span');
      button.classList.add('Feeles-asset-button');
      button.onclick = () => {
        this.setState({
          assetScope: _label.substr(1).trim(),
          assetLineNumber: line,
          appendToHead: false
        });
      };
      button.appendChild(left);
      button.appendChild(label);
      button.appendChild(right);
      const parent = document.createElement('div');
      parent.classList.add('Feeles-widget', 'Feeles-asset');
      parent.appendChild(prefix);
      parent.appendChild(button);
      this._widgets.set(line, parent);
    }
  };

  handleValueClick = event => {
    // Put cursor into editor
    if (this.codemirror) {
      const locate = { left: event.x, top: event.y };
      const pos = this.codemirror.coordsChar(locate);
      this.codemirror.focus();
      this.codemirror.setCursor(pos);
    }
  };

  handleRenderWidget = cm => {
    // remove old widgets
    for (const widget of [...document.querySelectorAll('.Feeles-asset')]) {
      if (widget.parentNode) {
        widget.parentNode.removeChild(widget);
      }
    }
    // render new widgets
    for (const [i, element] of this._widgets.entries()) {
      // fold されていないかを確認
      const lineHandle = cm.getLineHandle(i);
      if (lineHandle.height > 0) {
        cm.addWidget(new Pos(i, 0), element);
      }
    }
  };

  handleIndexReplacement = (cm, change) => {
    if (!includes(['asset', 'paste'], change.origin)) return;

    const code = cm.getValue('\n');
    const sourceText = change.text.join('\n');
    const replacedText = replaceExistConsts(code, sourceText);
    if (sourceText !== replacedText) {
      change.update(change.from, change.to, replacedText.split('\n'));
    }
  };

  handleAssetClose = () => {
    this.setState({
      assetScope: null
    });
  };

  handleAssetInsert = ({ code }) => {
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
    setTimeout(this.runApp, 1000);
  };

  emphasizeTextMarker = async textMarker => {
    const { transitions } = this.props.theme;

    const begin = {
      className: textMarker.className,
      style: 'opacity: 0; background-color: rgba(0,0,0,1)'
    };
    const end = {
      className: textMarker.className,
      style: `opacity: 1; background-color: rgba(0,0,0,0.1); transition: ${transitions.create()}`
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
      classNameStyles: prevState.classNameStyles.map(item =>
        item === begin ? end : item
      )
    }));
  };

  handleIndentLine = (cm, change) => {
    if (!includes(['asset', 'paste'], change.origin)) return;
    const { from } = change;
    const to = new Pos(from.line + change.text.length, 0);
    // インデント
    for (let line = from.line; line < to.line; line++) {
      cm.indentLine(line);
    }
  };

  handleRestore = () => {
    // 保存する前の状態に戻す
    const prevFile = prevFiles.get(this.state.file);
    if (prevFile) {
      this.setValue(prevFile.text);
      this.runApp();
    }
  };

  beautify = () => {
    const { fileView } = this.props;
    const { file } = this.state;
    const prevValue = this.codemirror.getValue();
    const setValueWithoutHistory = replacement => {
      // undo => beautify => setValue することで history を 1 つに
      const { left, top } = this.codemirror.getScrollInfo();
      this.codemirror.undo();
      this.codemirror.setValue(replacement);
      this.codemirror.scrollTo(left, top);
    };

    // import .jsbeautifyrc
    let configs = {};
    try {
      const runCommand = fileView.getFileByFullPath('.jsbeautifyrc');
      if (runCommand) {
        configs = JSON.parse(runCommand.text);
      }
    } catch (error) {
      console.info(error);
    }

    if (file.is('javascript') || file.is('json')) {
      setValueWithoutHistory(
        preserveTrailingSpaceBeautify(prevValue, configs.js || {})
      );
    } else if (file.is('html')) {
      setValueWithoutHistory(beautify.html(prevValue, configs.html || {}));
    } else if (file.is('css')) {
      setValueWithoutHistory(beautify.css(prevValue, configs.css || {}));
    }
  };

  setValue(value) {
    const { left, top } = this.codemirror.getScrollInfo();
    this.codemirror.setValue(value);
    this.codemirror.scrollTo(left, top);
  }

  setShowLineWidget = showLineWidget => {
    this.setState({
      showLineWidget
    });
  };

  render() {
    const { localization } = this.props;
    const { file, showHint } = this.state;

    if (!file) {
      return null;
    }

    // const snippets = this.props.getConfig('snippets')(file);

    const extraKeys = {
      'Ctrl-Enter': () => {
        // Key Binding された操作の直後にカーソルが先頭に戻ってしまう(?)ため,
        // それをやり過ごしてから実行する
        window.setTimeout(this.runApp, 10);
      },
      'Ctrl-Alt-B': () => {
        // Key Binding された操作の直後にカーソルが先頭に戻ってしまう(?)ため,
        // それをやり過ごしてから実行する
        window.setTimeout(this.beautify, 10);
      }
    };
    const foldOptions = {
      widget: ' ... ',
      minFoldSize: 1,
      scanUp: false
    };
    if (file.is('javascript')) {
      foldOptions.rangeFinder = foldAsset;
    }

    return (
      <div className={cn.root}>
        <style>
          {this.state.classNameStyles.map(
            item => `.${item.className} { ${item.style} } `
          )}
        </style>
        <MenuBar
          localization={localization}
          getFiles={this.props.getFiles}
          href={this.props.href}
          handleUndo={this.handleUndo}
          runApp={this.runApp}
          hasHistory={this.state.hasHistory}
          hasChanged={this.state.hasChanged}
          filePath={this.props.filePath}
          tabs={this.props.tabs}
          showLineWidget={this.state.showLineWidget}
          setShowLineWidget={this.setShowLineWidget}
          globalEvent={this.props.globalEvent}
        />
        {this.state.loading ? (
          <LinearProgress color="primary" className={cn.progress} />
        ) : null}
        <div className={cn.editorContainer}>
          <Editor
            file={file}
            getFiles={this.props.getFiles}
            getConfig={this.props.getConfig}
            findFile={this.props.findFile}
            loadConfig={this.props.loadConfig}
            fileView={this.props.fileView}
            showHint={showHint}
            snippets={this.state.snippets}
            codemirrorRef={this.handleCodemirror}
            extraKeys={extraKeys}
            foldOptions={foldOptions}
          />
        </div>
        <ErrorPane
          error={this.state.babelError}
          localization={localization}
          onRestore={this.handleRestore}
          canRestore={prevFiles.has(file)}
        />
        <AssetPane
          className={classes(
            cn.assetPane,
            this.state.assetScope ? cn.assetPaneIn : cn.assetPaneOut
          )}
          fileView={this.props.fileView}
          scope={this.state.assetScope}
          loadConfig={this.props.loadConfig}
          findFile={this.props.findFile}
          handleClose={this.handleAssetClose}
          handleAssetInsert={this.handleAssetInsert}
          localization={localization}
        />
        {this.codemirror && (
          <LineWidget
            show={this.state.showLineWidget}
            codemirror={this.codemirror}
            localization={localization}
          />
        )}
      </div>
    );
  }
}

function wait(millisec) {
  return new Promise(resolve => {
    setTimeout(resolve, millisec);
  });
}
