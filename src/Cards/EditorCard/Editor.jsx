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

import CodemirrorComponent from 'utils/CodemirrorComponent';

export default class Editor extends PureComponent {
  static propTypes = {
    file: PropTypes.object.isRequired,
    getFiles: PropTypes.func.isRequired,
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
    getFiles: () => [],
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

  handleCodemirror = ref => {
    if (!ref) return;
    const cm = ref.getCodeMirror();
    if (cm) {
      this.showHint(cm);
      this.props.codemirrorRef(cm);
    }
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

  render() {
    const { file, getConfig, lineNumbers, foldGutter } = this.props;

    const meta = CodeMirror.findModeByMIME(file.type);
    const mode = meta && meta.mode;

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
        extraKeys={this.props.extraKeys}
        lint={mode === 'javascript' ? this.state.lint : null}
        ref={this.handleCodemirror}
        docsRef={this.props.docsRef}
      />
    );
  }
}
