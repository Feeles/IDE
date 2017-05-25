import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import CodeMirror from 'codemirror';
import deepEqual from 'deep-equal';

export default class CodeMirrorComponent extends PureComponent {
  static propTypes = {
    id: PropTypes.string.isRequired,
    docsRef: PropTypes.func,
    // CodeMirror options
    value: PropTypes.string.isRequired,
    mode: PropTypes.string,
    lineNumbers: PropTypes.bool.isRequired,
    indentUnit: PropTypes.number.isRequired,
    indentWithTabs: PropTypes.bool.isRequired,
    matchBrackets: PropTypes.bool.isRequired,
    autoCloseBrackets: PropTypes.bool.isRequired,
    keyMap: PropTypes.string.isRequired,
    foldGutter: PropTypes.bool.isRequired,
    foldOptions: PropTypes.object.isRequired,
    dragDrop: PropTypes.bool.isRequired,
    extraKeys: PropTypes.object.isRequired,
    readOnly: PropTypes.bool.isRequired
  };

  static defaultProps = {
    mode: null,
    lineNumbers: true,
    indentUnit: 4,
    indentWithTabs: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    keyMap: 'default',
    foldGutter: true,
    foldOptions: {},
    dragDrop: false,
    extraKeys: {},
    readOnly: false
  };

  state = {
    // File ごとに存在する CodeMirror.Doc インスタンスのキャッシュ
    docs: new Map()
  };

  get options() {
    const gutters = [];
    if (this.props.lineNumbers) {
      gutters.push('CodeMirror-linenumbers');
    }
    if (this.props.foldGutter) {
      gutters.push('CodeMirror-foldgutter');
    }
    if (this.props.lint) {
      gutters.push('CodeMirror-lint-markers');
    }
    return {
      ...this.props,
      gutters
    };
  }

  componentDidMount() {
    // initialize CodeMirror
    this.codeMirror = CodeMirror.fromTextArea(this.ref, this.props);

    const doc = this.codeMirror.getDoc();
    doc.setValue(this.props.value); // set default value
    doc.clearHistory();
    this.state.docs.set(this.props.id, doc);
    if (this.props.docsRef) {
      this.props.docsRef(this.state.docs);
    }
  }

  componentWillUnount() {
    this.state.docs.clear();
    if (this.props.docsRef) {
      this.props.docsRef(null);
    }
    this.codeMirror.toTextArea();
    this.codeMirror = null; // GC??
  }

  componentWillReceiveProps(nextProps) {
    // タブ, value の更新
    if (this.props.id !== nextProps.id) {
      // 別のタブ(ファイル)に切り替わった
      if (this.state.docs.has(nextProps.id)) {
        // キャッシュを利用する
        const doc = this.state.docs.get(nextProps.id);
        this.codeMirror.swapDoc(doc);
      } else {
        // copy をもとに新しい Doc を作り、 value を更新
        const doc = this.codeMirror.getDoc().copy(false);
        doc.setValue(nextProps.value); // value の更新
        doc.clearHistory();
        this.codeMirror.swapDoc(doc);
        this.state.docs.set(nextProps.id, doc);
      }
    } else {
      // 同じタブ(ファイル)
      this.setValueIfDifferent(nextProps.value); // value の更新
    }
    // options の更新
    const ignoreKeys = ['id', 'value'];
    for (const [key, nextValue] of Object.entries(nextProps)) {
      if (ignoreKeys.includes(key)) continue;
      if (!deepEqual(this.props[key], nextProps[key])) {
        // options の変更を CodeMirror に伝える
        this.codeMirror.setOption(key, nextValue);
      }
    }
  }

  getCodeMirror() {
    return this.codeMirror;
  }

  setValueIfDifferent(nextValue) {
    // 現在エディタに表示されている文章と比較し、違ったら setValue する
    const value = this.codeMirror.getValue();
    if (value !== nextValue) {
      // スクロール位置を保持する
      const { left, top } = this.codeMirror.getScrollInfo();
      this.codeMirror.setValue(value);
      this.codeMirror.scrollTo(left, top);
    }
  }

  render() {
    return <textarea ref={ref => (this.ref = ref)} />;
  }
}
