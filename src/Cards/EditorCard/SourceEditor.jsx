import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import LinearProgress from '@material-ui/core/LinearProgress';
import beautify from 'js-beautify';
import { Pos } from 'codemirror';

import LineWidget from './LineWidget';
import Editor from './Editor';
import MenuBar from './MenuBar';
import AssetPane from './AssetPane';
import ErrorPane from './ErrorPane';
import zenkakuToHankaku from './zenkakuToHankaku';
import foldAsset from './foldAsset';
import { withTheme } from '@material-ui/core';
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
    label: PropTypes.string.isRequired,
    filePathToBack: PropTypes.string.isRequired,
    globalEvent: PropTypes.object.isRequired,
    asset: PropTypes.object
  };

  state = {
    file: null,
    babelError: null,

    showHint: false,
    hasHistory: false,
    hasChanged: false,
    loading: false,
    snippets: [],
    showLineWidget: true
  };

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
    const onChange = cm => {
      this.setState({
        hasHistory: cm.historySize().undo > 0,
        hasChanged: cm.getValue('\n') !== this.state.file.text
      });
    };
    this.codemirror.on('change', onChange);
    this.codemirror.on('swapDoc', onChange);
    this.codemirror.on('swapDoc', this.foldAll);
    this.foldAll(codemirror);
    this.forceUpdate();
  };

  foldAll = cm => {
    const opt = { rangeFinder: foldAsset };
    for (let line = cm.lineCount() - 1; line >= 0; line--) {
      cm.foldCode(new Pos(line, 0), opt, 'fold');
    }
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

    this.setState({ loading: true, babelError: null });

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


  handleRestore = () => {
    const { file } = this.state;
    const cm = this.codemirror;
    if (!file || !cm) return;
    const { left, top } = cm.getScrollInfo();
    this.codemirror.scrollTo(left, top);

    // 変更を加える前の状態(前回保存したところ)に戻す
    while (cm.historySize().undo > 0) {
      cm.undo(); // ひとつ前に戻す
      if (cm.getValue() === file.text) {
        // 前回の保存内容と同じになった
        break;
      }
    }

    if (cm.getValue() !== file.text) {
      // 履歴を遡っても同じにはならなかった(履歴が混在している)
      cm.clearHistory();
      cm.setValue(file.text);
    }
    this.codemirror.scrollTo(left, top);
    this.runApp();
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
          label={this.props.label}
          filePathToBack={this.props.filePathToBack}
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
          canRestore={this.state.hasHistory}
        />
        {this.codemirror && this.props.asset && (
          <AssetPane
            codemirror={this.codemirror}
            files={this.props.files}
            findFile={this.props.findFile}
            putFile={this.props.putFile}
            runApp={this.runApp}
            localization={localization}
            globalEvent={this.props.globalEvent}
            asset={this.props.asset}
          />
        )}
        {this.codemirror && (
          <LineWidget
            show={this.state.showLineWidget}
            codemirror={this.codemirror}
            runApp={this.runApp}
            localization={localization}
          />
        )}
      </div>
    );
  }
}
