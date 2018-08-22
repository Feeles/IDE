import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import CodeMirror from 'codemirror';
import deepEqual from 'deep-equal';
import includes from 'lodash/includes';

export default class CodeMirrorComponent extends PureComponent {
  static propTypes = {
    id: PropTypes.string.isRequired,
    onDocChanged: PropTypes.func.isRequired,
    // CodeMirror options
    value: PropTypes.string.isRequired,
    mode: PropTypes.string,
    lineNumbers: PropTypes.bool.isRequired,
    indentUnit: PropTypes.number.isRequired,
    indentWithTabs: PropTypes.bool.isRequired,
    matchBrackets: PropTypes.bool.isRequired,
    autoCloseBrackets: PropTypes.bool.isRequired,
    keyMap: PropTypes.string.isRequired,
    foldOptions: PropTypes.object,
    dragDrop: PropTypes.bool.isRequired,
    extraKeys: PropTypes.object.isRequired,
    readOnly: PropTypes.bool.isRequired,
    foldGutter: PropTypes.bool.isRequired
  };

  static defaultProps = {
    mode: null,
    lineNumbers: true,
    indentUnit: 4,
    indentWithTabs: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    keyMap: 'default',
    dragDrop: false,
    extraKeys: {},
    readOnly: false,
    foldGutter: false,
    onDocChanged: () => {}
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
    return {
      ...this.props,
      gutters
    };
  }

  componentDidMount() {
    // initialize CodeMirror
    this.codeMirror = CodeMirror.fromTextArea(this.ref, this.props);
    const { id } = this.props;

    const doc = this.codeMirror.getDoc();
    doc.setValue(this.props.value); // set default value
    doc.clearHistory();
    this.state.docs.set(id, doc);
    this.props.onDocChanged({ id, doc }, null);
  }

  componentWillUnmount() {
    const { id } = this.props;
    const doc = this.state.docs.get(id);
    if (doc) {
      this.props.onDocChanged(null, { id, doc });
    }
    this.state.docs.clear();
    this.codeMirror.toTextArea();
    this.codeMirror = null; // GC??
  }

  componentDidUpdate(prevProps) {
    // タブ, value の更新
    if (prevProps.id !== this.props.id) {
      // 前回のタブ
      const prev = this.state.docs.get(prevProps.id) || null;
      // 次のタブ (or undefined)
      let doc = this.state.docs.get(this.props.id);
      if (!doc) {
        // 新しく開かれたタブ（キャッシュに存在しない）
        // copy をもとに新しい Doc を作り、 value を更新
        doc = this.codeMirror.getDoc().copy(false);
        doc.setValue(this.props.value); // value の更新
        doc.clearHistory();
        this.state.docs.set(this.props.id, doc);
      }
      // 現在のタブと入れ替え
      this.codeMirror.swapDoc(doc);
      prevProps.onDocChanged(
        { id: this.props.id, doc },
        { id: prevProps.id, doc: prev }
      );
    } else {
      // 同じタブ(ファイル)
      this.setValueIfDifferent(this.props.value); // value の更新
    }
    // options の更新
    const ignoreKeys = ['id', 'value'];
    for (const [key, nextValue] of Object.entries(this.props)) {
      if (includes(ignoreKeys, key)) continue;
      if (!deepEqual(prevProps[key], this.props[key])) {
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
