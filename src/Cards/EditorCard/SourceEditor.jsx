import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Pos } from 'codemirror';
import beautify from 'js-beautify';
import includes from 'lodash/includes';
import Slide from '@material-ui/core/Slide';

import Editor from './Editor';
import MenuBar from './MenuBar';
import AssetPane from './AssetPane';
import ErrorPane from './ErrorPane';
import zenkakuToHankaku from './zenkakuToHankaku';
import foldAsset from './foldAsset';
import FileTabs from './FileTabs';
import { withTheme } from '@material-ui/core';
import replaceExistConsts from '../../utils/replaceExistConsts';
import preserveTrailingSpaceBeautify from '../../utils/preserveTrailingSpaceBeautify';

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
  })
};

// file -> prevFile を参照する
const prevFiles = new WeakMap();

@withTheme()
export default class SourceEditor extends PureComponent {
  static propTypes = {
    fileView: PropTypes.object.isRequired,
    file: PropTypes.object.isRequired,
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
    closeSelectedTab: PropTypes.func.isRequired,
    selectTabFromFile: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired,
    closeTab: PropTypes.func.isRequired,
    tabs: PropTypes.array.isRequired
  };

  state = {
    showHint: !this.props.file.is('json'),
    hasHistory: false,
    hasChanged: false,
    loading: false,
    snippets: [],

    assetFileName: null,
    assetLineNumber: 0,
    assetScope: null,
    appendToHead: true,
    classNameStyles: [],

    // { [Tab.file.key]: Doc }
    currentDoc: {}
  };

  _widgets = new Map();

  componentDidUpdate(prevProps) {
    if (prevProps.fileView !== this.props.fileView) {
      this.setState({
        snippets: this.props.getConfig('snippets')(this.props.file)
      });
    }
  }

  componentDidMount() {
    this.setState({
      snippets: this.props.getConfig('snippets')(this.props.file)
    });
    if (this.codemirror) {
      this.codemirror.on('beforeChange', zenkakuToHankaku);
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
      this.handleRenderWidget(this.codemirror);
    }
  }

  handleSave = async () => {
    if (!this.codemirror) return;

    this.beautify(this.codemirror); // Auto beautify
    const text = this.codemirror.getValue();
    if (text === this.props.file.text) {
      // No change
      return;
    }

    this.setState({ hasChanged: false, loading: true });

    const prevFile = this.props.file;
    const file = await this.props.putFile(
      this.props.file,
      this.props.file.set({ text })
    );
    prevFiles.set(file, prevFile);

    // Like a watching
    const babelrc = this.props.getConfig('babelrc');
    file.babel(babelrc, e => {
      this.props.selectTabFromFile(file);
      // あらたな Babel Error が発生したときを検知して,
      // ダイアログを表示させる (エラーの詳細は file.error を参照する)
      this.forceUpdate(); // 再描画
      console.info(e);
    });

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
    const asset = /^(.*)(\/\*)(\+[^*]+)(\*\/)/.exec(text);
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
      cm.addWidget(new Pos(i, 0), element);
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
      assetFileName: null,
      assetScope: null
    });
  };

  setLocation = async href => {
    await this.handleSave();
    return this.props.setLocation(href);
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
    setTimeout(this.setLocation, 1000);
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
    const prevFile = prevFiles.get(this.props.file);
    if (prevFile) {
      this.setValue(prevFile.text);
      this.setLocation();
    }
  };

  beautify = () => {
    const { file, fileView } = this.props;
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

  handleDocChanged = next => {
    if (next) {
      this.setState({ currentDoc: { [next.id]: next.doc } });
    } else {
      this.setState({ currentDoc: {} });
    }
  };

  render() {
    const { file, localization } = this.props;
    const { showHint } = this.state;

    // const snippets = this.props.getConfig('snippets')(file);

    const extraKeys = {
      'Ctrl-Enter': () => {
        // Key Binding された操作の直後にカーソルが先頭に戻ってしまう(?)ため,
        // それをやり過ごしてから実行する
        window.setTimeout(this.handleSaveAndRun, 10);
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
          setLocation={this.setLocation}
          hasHistory={this.state.hasHistory}
          hasChanged={this.state.hasChanged}
        />
        <FileTabs
          localization={this.props.localization}
          selectTab={this.props.selectTab}
          closeTab={this.props.closeTab}
          currentDoc={this.state.currentDoc}
          tabs={this.props.tabs}
        />
        {this.state.loading ? (
          <LinearProgress color="primary" className={cn.progress} />
        ) : null}
        <div className={cn.editorContainer}>
          <Editor
            {...this.props}
            showHint={showHint}
            snippets={this.state.snippets}
            codemirrorRef={ref => (this.codemirror = ref)}
            onDocChanged={this.handleDocChanged}
            extraKeys={extraKeys}
            foldOptions={foldOptions}
            loadConfig={this.props.loadConfig}
            fileView={this.props.fileView}
          />
        </div>
        <ErrorPane
          error={file.error}
          localization={localization}
          onRestore={this.handleRestore}
          canRestore={prevFiles.has(file)}
        />
        <Slide direction="up" in={!!this.state.assetScope} hideBackdrop>
          <AssetPane
            fileView={this.props.fileView}
            scope={this.state.assetScope}
            loadConfig={this.props.loadConfig}
            findFile={this.props.findFile}
            handleClose={this.handleAssetClose}
            handleAssetInsert={this.handleAssetInsert}
            localization={localization}
          />
        </Slide>
      </div>
    );
  }
}

function wait(millisec) {
  return new Promise(resolve => {
    setTimeout(resolve, millisec);
  });
}
