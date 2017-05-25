import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import beautify from 'js-beautify';
import { JSHINT } from 'jshint';

import CodeMirror from 'codemirror';
import 'codemirror/mode/meta';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/css/css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/html-hint';
import 'codemirror/addon/hint/css-hint';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/search/search';
import 'codemirror/addon/search/searchcursor';
// import 'codemirror/addon/scroll/simplescrollbars';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/javascript-lint';
import 'codemirror/keymap/sublime';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/dialog/dialog.css';
// import 'codemirror/addon/scroll/simplescrollbars.css';
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/lint/lint.css';

import glslMode from 'glsl-editor/glsl';
glslMode(CodeMirror);
CodeMirror.modeInfo.push({
  name: 'glsl',
  mime: 'text/x-glsl',
  mode: 'glsl'
});

import './codemirror-hint-extension';

import excessiveCare from './excessiveCare';

const AlreadySetSymbol = Symbol('AlreadySetSymbol');

export const MimeTypes = {
  'text/javascript': '.js',
  'text/x-markdown': '.md',
  'application/json': '.json',
  'text/html': '.html',
  'text/css': '.css',
  'text/plain': '',
  'text/x-glsl': '.sort'
};

import CodemirrorComponent from 'utils/CodemirrorComponent';

export const FileEditorMap = new WeakMap();

export default class Editor extends PureComponent {
  static propTypes = {
    file: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    getFiles: PropTypes.func.isRequired,
    handleRun: PropTypes.func.isRequired,
    closeSelectedTab: PropTypes.func.isRequired,
    isCared: PropTypes.bool.isRequired,
    getConfig: PropTypes.func.isRequired,
    codemirrorRef: PropTypes.func.isRequired,
    snippets: PropTypes.array.isRequired,
    showHint: PropTypes.bool.isRequired,
    extraKeys: PropTypes.object.isRequired,
    lineNumbers: PropTypes.bool.isRequired,
    foldGutter: PropTypes.bool.isRequired,
    findFile: PropTypes.func.isRequired,
    docsRef: PropTypes.func
  };

  static defaultProps = {
    onChange: () => {},
    handleRun: () => {},
    getFiles: () => [],
    closeSelectedTab: () => {},
    isCared: false,
    codemirrorRef: () => {},
    snippets: [],
    showHint: true,
    extraKeys: {},
    lineNumbers: true,
    foldGutter: true,
    docsRef: () => {}
  };

  state = {
    jshintrc: null
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.file === nextProps.file) {
      return false;
    }
    return true;
  }

  componentWillMount() {
    const jshintrc = this.props.findFile('.jshintrc');
    if (jshintrc) {
      // .jshintrc があれば JSHint でチェック
      window.JSHINT = JSHINT;
      try {
        this.setState({
          jshintrc: JSON.parse(jshintrc.text)
        });
      } catch (e) {}
    }
  }

  componentDidUpdate(prevProps) {
    if (FileEditorMap.has(prevProps.file)) {
      const editor = FileEditorMap.get(prevProps.file);
      FileEditorMap.set(this.props.file, editor);
    }
  }

  handleCodemirror = ref => {
    if (!ref) return;
    if (!ref[AlreadySetSymbol]) {
      const cm = ref.getCodeMirror();
      this.props.codemirrorRef(cm);
      this.showHint(cm);
      ref[AlreadySetSymbol] = true;
      FileEditorMap.set(this.props.file, cm);
      cm.on('change', (doc, change) => {
        if (change.origin !== 'setValue') {
          this.props.onChange(doc.getValue(), change);
        }
      });
    }
    this.ref = ref;
  };

  showHint(cm) {
    if (!this.props.showHint) {
      return;
    }
    const { getFiles, isCared, getConfig } = this.props;

    cm.on('change', (_cm, change) => {
      if (change.origin === 'setValue' || change.origin === 'complete') return;
      const cursor = cm.getCursor();
      cm.scrollIntoView(cursor);
      cm.showHint({
        completeSingle: false,
        files: getFiles(),
        snippets: this.props.snippets
      });
    });

    if (isCared) {
      cm.on('beforeChange', excessiveCare);
    }
  }

  beautify = cm => {
    const { file } = this.props;
    if (file.is('javascript') || file.is('json')) {
      cm.setValue(
        beautify(cm.getValue(), {
          indent_with_tabs: true,
          end_with_newline: true
        })
      );
    } else if (file.is('html')) {
      cm.setValue(
        beautify.html(cm.getValue(), {
          indent_with_tabs: true,
          indent_inner_html: true,
          extra_liners: []
        })
      );
    } else if (file.is('css')) {
      cm.setValue(
        beautify.css(cm.getValue(), {
          indent_with_tabs: true
        })
      );
    }
  };

  render() {
    const {
      file,
      onChange,
      handleRun,
      closeSelectedTab,
      getConfig,
      lineNumbers,
      foldGutter
    } = this.props;

    const meta = CodeMirror.findModeByMIME(file.type);
    const mode = meta && meta.mode;

    const extraKeys = {
      'Ctrl-Enter': handleRun,
      'Cmd-Enter': handleRun,
      'Ctrl-W': closeSelectedTab,
      'Cmd-W': closeSelectedTab,
      'Ctrl-Alt-B': this.beautify,
      ...this.props.extraKeys
    };

    const foldOptions = {
      widget: ' 📦 ',
      minFoldSize: 1,
      scanUp: false
    };

    return (
      <CodemirrorComponent
        id={file.key}
        value={file.text}
        mode={mode}
        lineNumbers={lineNumbers}
        keyMap="sublime"
        foldGutter={foldGutter}
        foldOptions={foldOptions}
        extraKeys={extraKeys}
        lint={mode === 'javascript' ? this.state.lint : null}
        ref={this.handleCodemirror}
        docsRef={this.props.docsRef}
      />
    );
  }
}
