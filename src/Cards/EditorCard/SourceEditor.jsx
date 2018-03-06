import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import CodeMirror from 'codemirror';
import FlatButton from 'material-ui/FlatButton';
import LinearProgress from 'material-ui/LinearProgress';
import HardwareKeyboardBackspace from 'material-ui/svg-icons/hardware/keyboard-backspace';
import ContentSave from 'material-ui/svg-icons/content/save';
import { Pos } from 'codemirror';
import beautify from 'js-beautify';
import Editor from './Editor';
import CreditBar from './CreditBar';
import PlayMenu from './PlayMenu';
import AssetPane from './AssetPane';
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
    }
  };
};

// file -> prevFile を参照する
const prevFiles = new WeakMap();

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
    onDocChanged: PropTypes.func.isRequired
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
    dropdowns: {},

    assetFileName: null,
    assetLineNumber: 0,
    assetScope: null,
    appendToHead: true,
    classNameStyles: []
  };

  _widgets = new Map();

  componentWillMount() {
    this.setState({
      snippets: this.props.getConfig('snippets')(this.props.file),
      dropdowns: this.props.loadConfig('dropdown')
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.fileView !== nextProps.fileView) {
      this.setState({
        snippets: nextProps.getConfig('snippets')(nextProps.file),
        dropdowns: this.props.loadConfig('dropdown')
      });
    }
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

    // Syntax: ('▼ スキン', _kきし)
    const dropdown = /^(.*\(['"])(▼[^'"]*)(['"],\s*)([^)]*)\)/.exec(
      text
    );
    if (dropdown) {
      const [, _prefix, _label, _right, _value] = dropdown;
      const label = document.createElement('span');
      label.textContent = _label;
      label.classList.add('Feeles-dropdown-label');
      const right = document.createElement('span');
      right.textContent = _right;
      right.classList.add('Feeles-dropdown-blank');
      const value = document.createElement('span');
      value.textContent = _value;
      value.classList.add('Feeles-dropdown-value');
      value.addEventListener('click', this.handleValueClick);
      const button = document.createElement('span');
      button.appendChild(label); // "▼ スキン"
      button.appendChild(right); // "', "
      button.appendChild(value); // _kきし
      button.classList.add('Feeles-dropdown-button');
      button.setAttribute('data-label', _label.substr(1).trim());
      button.setAttribute('data-value', _value);
      button.setAttribute('data-from-line', line);
      const allOfLeft = _prefix + _label + _right; // value より左の全て
      button.setAttribute('data-from-ch', allOfLeft.length);
      button.addEventListener('click', this.handleDropdownClick, true);
      const shadow = document.createElement('span');
      shadow.appendChild(button);
      shadow.classList.add('Feeles-dropdown-shadow');
      const parent = document.createElement('div');
      parent.classList.add('Feeles-widget', 'Feeles-dropdown');
      parent.appendChild(shadow);

      const pos = { line, ch: _prefix.length };
      const { left } = this.codemirror.charCoords(pos, 'local');
      parent.style.transform = `translate(${left - 4}px, -1.5rem)`;

      this._widgets.set(line, parent);
    }
  };

  handleDropdownClick = event => {
    // Open dropdown menu
    const label = event.target.getAttribute('data-label');
    const value = event.target.getAttribute('data-value');
    const line = event.target.getAttribute('data-from-line') >> 0;
    const ch = event.target.getAttribute('data-from-ch') >> 0;
    const list = this.state.dropdowns[label];
    if (label && list && value && line && ch && this.codemirror) {
      const hint = {
        from: { line, ch },
        to: { line, ch: ch + value.length },
        list: list.map(item => ({
          text: item.body,
          displayText: `${item.body} ${item.label || ''}`
        }))
      };
      this.codemirror.showHint({
        completeSingle: false,
        hint: () => hint
      });
      this.codemirror.focus();
      // reload when completed
      CodeMirror.on(hint, 'pick', this.handleRun);
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
    for (const widget of [...document.querySelectorAll('.Feeles-widget')]) {
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
    const { transitions } = this.context.muiTheme;

    const begin = {
      className: textMarker.className,
      style: 'opacity: 0; background-color: rgba(0,0,0,1)'
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
    // 保存する前の状態に戻す
    const prevFile = prevFiles.get(this.props.file);
    if (prevFile) {
      this.setValue(prevFile.text);
      this.setLocation();
    }
  };

  handleRun = () => {
    this.setLocation();
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
      setValueWithoutHistory(beautify(prevValue, configs.js || {}));
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

  render() {
    const { file, localization } = this.props;
    const { showHint } = this.state;

    const styles = getStyle(this.props, this.state, this.context);

    // const snippets = this.props.getConfig('snippets')(file);

    const extraKeys = {
      'Ctrl-Enter': this.handleRun,
      'Ctrl-Alt-B': this.beautify
    };
    const foldOptions = {
      widget: ' 📦 ',
      minFoldSize: 1,
      scanUp: false
    };

    return (
      <div style={styles.root}>
        <style>
          {this.state.classNameStyles.map(
            item => `.${item.className} { ${item.style} } `
          )}
        </style>
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
        {this.state.loading ? (
          <LinearProgress
            color={styles.progressColor}
            style={styles.progress}
          />
        ) : null}
        <div style={styles.editorContainer}>
          <AssetPane
            fileView={this.props.fileView}
            open={!!this.state.assetScope}
            scope={this.state.assetScope}
            loadConfig={this.props.loadConfig}
            findFile={this.props.findFile}
            handleClose={this.handleAssetClose}
            handleAssetInsert={this.handleAssetInsert}
            localization={this.props.localization}
          />
          <Editor
            {...this.props}
            showHint={showHint}
            snippets={this.state.snippets}
            codemirrorRef={ref => (this.codemirror = ref)}
            onDocChanged={this.props.onDocChanged}
            extraKeys={extraKeys}
            foldOptions={foldOptions}
          />
        </div>
        <ErrorPane
          error={file.error}
          localization={localization}
          onRestore={this.handleRestore}
          canRestore={prevFiles.has(file)}
        />
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
  return new Promise((resolve) => {
    setTimeout(resolve, millisec);
  });
}

function searchItemIndexes(text, keyword, limit = 1000) {
  const regExp = new RegExp(
    String.raw`(const|let|var)\s${keyword}(\d+)\s`,
    'g'
  );
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
