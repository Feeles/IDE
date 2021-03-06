import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { JSHINT } from 'jshint'
import deepEqual from 'deep-equal'
import reduce from 'lodash/reduce'
import includes from 'lodash/includes'
import CodeMirror from 'codemirror'
import 'codemirror/mode/meta'
import 'codemirror/mode/htmlmixed/htmlmixed'
import 'codemirror/mode/css/css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/yaml/yaml'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/hint/html-hint'
import 'codemirror/addon/hint/css-hint'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/addon/edit/matchbrackets'
import 'codemirror/addon/comment/comment'
import 'codemirror/addon/dialog/dialog'
import 'codemirror/addon/search/search'
import 'codemirror/addon/search/searchcursor'
// import 'codemirror/addon/scroll/simplescrollbars';
import 'codemirror/addon/fold/foldcode'
import 'codemirror/addon/fold/foldgutter'
import 'codemirror/addon/fold/brace-fold'
import 'codemirror/keymap/sublime'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/dialog/dialog.css'
// import 'codemirror/addon/scroll/simplescrollbars.css';
import 'codemirror/addon/fold/foldgutter.css'
import glslMode from 'glsl-editor/glsl'

import './codemirror-hint-extension'
import CodeMirrorComponent from '../../utils/CodeMirrorComponent'

glslMode(CodeMirror)
CodeMirror.modeInfo.push({
  name: 'glsl',
  mime: 'text/x-glsl',
  mode: 'glsl'
})

// YAML のエイリアス (.yml) (text/yaml)
CodeMirror.modeInfo.push({
  name: 'YAML',
  mimes: ['text/yaml', 'text/x-yaml'],
  mode: 'yaml',
  ext: ['yml', 'yaml'],
  alias: ['yml']
})

// segments の参照と現在の line との関係を一旦保持するマップ
const segmentsLineMap = new WeakMap()

export default class Editor extends Component {
  static propTypes = {
    file: PropTypes.object.isRequired,
    getFiles: PropTypes.func.isRequired,
    getConfig: PropTypes.func.isRequired,
    codemirrorRef: PropTypes.func.isRequired,
    snippets: PropTypes.array.isRequired,
    showHint: PropTypes.bool.isRequired,
    extraKeys: PropTypes.object.isRequired,
    foldOptions: PropTypes.object,
    lineNumbers: PropTypes.bool.isRequired,
    findFile: PropTypes.func.isRequired,
    loadConfig: PropTypes.func.isRequired,
    fileView: PropTypes.object.isRequired,
    handleSetLinkObjects: PropTypes.func
  }

  static defaultProps = {
    getFiles: () => [],
    codemirrorRef: () => {},
    snippets: [],
    showHint: true,
    extraKeys: {},
    lineNumbers: true,
    foldOptions: {}
  }

  state = {
    jshintrc: null,
    dropdowns: [],
    dropdownLineWidgets: [],
    links: [],
    linkLineWidgets: []
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.file === nextProps.file) {
      return false
    }
    return true
  }

  componentDidMount() {
    const jshintrc = this.props.findFile('.jshintrc')
    if (jshintrc) {
      // .jshintrc があれば JSHint でチェック
      window.JSHINT = JSHINT
      try {
        this.setState({
          jshintrc: JSON.parse(jshintrc.text)
        })
      } catch (e) {
        // continue regardless of error
      }
    }
    this.setState({
      dropdownConfig: this.props.loadConfig('dropdown')
    })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.fileView !== this.props.fileView) {
      this.setState({
        dropdownConfig: this.props.loadConfig('dropdown')
      })
    }
  }

  handleCodemirror = ref => {
    if (!ref) return
    const cm = ref.getCodeMirror()
    if (cm) {
      this.showHint(cm)
      this.props.codemirrorRef(cm)
      // ドロップダウンウィジェット
      cm.on('changes', this.handleUpdateDropdown)
      cm.on('changes', this.handleUpdateLink)
      cm.on('swapDoc', () => {
        this.clearAllWidgets()
        this.handleUpdateDropdown(cm, [])
        this.handleUpdateLink(cm, [])
      })
      this.handleUpdateDropdown(cm, [])
      this.handleUpdateLink(cm, [])
      cm.on('unfold', cm => {
        this.clearAllWidgets()
        this.handleUpdateDropdown(cm, [])
        this.handleUpdateLink(cm, [])
      })
    }
  }

  handleValueClick = event => {
    // Put cursor into editor
    if (this.codemirror) {
      const locate = { left: event.x, top: event.y }
      const pos = this.codemirror.coordsChar(locate)
      this.codemirror.focus()
      this.codemirror.setCursor(pos)
    }
  }

  handleUpdateDropdown = (cm, batch) => {
    const origin = batch[0] && batch[0].origin // e.g. '+input'
    const dropdowns = reduce(
      cm.getValue('\n').split('\n'),
      (prev, text, line) => {
        // Syntax: ('▼ スキン', _kきし)
        const segments = /^(.*\(['"])(▼[^'"]*)(['"],\s*)([^)]*)\)/.exec(text)
        if (segments) {
          // line は独立して保持（異なる行でも移動しただけなら問題ない）
          segmentsLineMap.set(segments, line)
          // 新しいデータを格納
          prev = prev.concat([segments])
        }
        return prev
      },
      []
    )
    // 中身が変わっていたら更新
    if (
      includes(['setValue', 'undo'], origin) ||
      !deepEqual(dropdowns, this.state.dropdowns)
    ) {
      // 前回の LineWidget を消去
      for (const item of this.state.dropdownLineWidgets) {
        item.clear() // remove element
      }
      // 今回の LineWidget を追加
      const dropdownLineWidgets = dropdowns.map(segments => {
        const line = segmentsLineMap.get(segments) // さっき保持した line
        return this.renderDropdown(cm, segments, line)
      })
      this.setState({
        dropdowns,
        dropdownLineWidgets
      })
    }
  }

  clearAllWidgets = () => {
    // 全ての LineWidget を消去
    for (const item of this.state.dropdownLineWidgets) {
      item.clear() // remove element
    }
    for (const item of this.state.linkLineWidgets) {
      item.clear() // remove element
    }
    this.setState({
      dropdowns: [],
      dropdownLineWidgets: [],
      links: [],
      linkLineWidgets: []
    })
  }

  renderDropdown = (cm, segments, line) => {
    const [, _prefix, _label, _right, _value] = segments

    const label = document.createElement('span')
    label.textContent = _label
    label.classList.add('Feeles-dropdown-label')
    const right = document.createElement('span')
    right.textContent = _right
    right.classList.add('Feeles-dropdown-blank')
    const value = document.createElement('span')
    value.textContent = _value
    value.classList.add('Feeles-dropdown-value')
    value.addEventListener('click', this.handleValueClick)
    const button = document.createElement('span')
    button.appendChild(label) // "▼ スキン"
    button.appendChild(right) // "', "
    button.appendChild(value) // _kきし
    button.classList.add('Feeles-dropdown-button')
    const allOfLeft = _prefix + _label + _right // value より左の全て
    const ch = allOfLeft.length

    const shadow = document.createElement('span')
    shadow.appendChild(button)
    shadow.classList.add('Feeles-dropdown-shadow')
    const parent = document.createElement('div')
    parent.classList.add('Feeles-widget', 'Feeles-dropdown')
    parent.appendChild(shadow)

    const pos = { line, ch: _prefix.length }
    const { left } = cm.charCoords(pos, 'local')
    parent.style.transform = `translate(${left}px, -1.3rem)`
    // ウィジェット追加
    const widget = cm.addLineWidget(line, parent, {
      insertAt: 0
    })
    // クリックイベント追加
    button.addEventListener(
      'click',
      () => {
        const { dropdownConfig } = this.state
        if (!dropdownConfig) return
        const line = cm.doc.getLineNumber(widget.line)
        // Open dropdown menu
        const listName = _label.substr(1).trim()
        const list = dropdownConfig[listName]
        if (list) {
          const hint = {
            from: { line, ch },
            to: { line, ch: ch + _value.length },
            list: list.map(item => ({
              text: item.body,
              displayText: `${item.body} ${item.label || ''}`
            }))
          }
          // CodeMirror.on(hint, 'pick', this.handleSaveAndRun);
          cm.showHint({
            completeSingle: false,
            hint: () => hint
          })
          cm.focus()
        }
      },
      true
    )
    return widget
  }

  handleUpdateLink = (cm, batch) => {
    const origin = batch[0] && batch[0].origin // e.g. '+input'
    const eachLines = cm.getValue('\n').split('\n')
    const links = []
    eachLines.map((currentLine, line) => {
      // Syntax: // [で囲むと[リンク]になります
      // Syntax: // `[これ]`はリンクにはなりません. `[これ]はなります
      const commentStart = currentLine.indexOf('//')
      let outerPrefix = currentLine.substr(0, commentStart)
      const commentLine = currentLine.substr(commentStart)
      if (commentStart > -1) {
        commentLine.split('`').map((text, index, array) => {
          let innerPrefix = ''
          if (index % 2 === 0 || index === array.length - 1) {
            let isFirst = true
            for (const linkAndMore of text.split('[')) {
              if (!isFirst && includes(linkAndMore, ']')) {
                const linkText = linkAndMore.split(']')[0]
                const segments = {
                  prefix: outerPrefix + innerPrefix,
                  linkText
                }
                // line は独立して保持（異なる行でも移動しただけなら問題ない）
                segmentsLineMap.set(segments, line)
                // 新しいデータを格納
                links.push(segments)
              }
              isFirst = false
              innerPrefix += `${linkAndMore}[`
            }
          }
          outerPrefix += text + '`'
        })
      }
    })
    // 中身が変わっていたら更新
    if (
      includes(['setValue', 'undo'], origin) ||
      !deepEqual(links, this.state.links)
    ) {
      // 前回の LineWidget を消去
      for (const item of this.state.linkLineWidgets) {
        item.clear() // remove element
      }
      // 今回の LineWidget を追加
      const linkLineWidgets = links.map(segments => {
        const line = segmentsLineMap.get(segments) // さっき保持した line
        return this.renderlink(cm, segments, line)
      })
      this.setState({
        links,
        linkLineWidgets
      })
      // ShotCard に Scrapbox 風のリンクを表示するために
      // link object を ShotCard に渡す
      if (this.props.handleSetLinkObjects) {
        this.props.handleSetLinkObjects(links)
      }
    }
  }

  renderlink(cm, segments, line) {
    const { prefix, linkText } = segments
    const linkElement = document.createElement('a')
    linkElement.href = `https://scrapbox.io/hackforplay/${encodeURIComponent(
      linkText
    )}`
    linkElement.target = '_blank'
    linkElement.textContent = linkText
    linkElement.classList.add('Feeles-link')

    const pos = { line, ch: prefix.length }
    const { left } = cm.charCoords(pos, 'local')
    linkElement.style.transform = `translate(${left}px, -1.2rem)`
    // ウィジェット追加
    const widget = cm.addLineWidget(line, linkElement)
    return widget
  }

  showHint(cm) {
    if (!this.props.showHint) {
      return
    }
    const { getFiles } = this.props

    cm.on('change', (_cm, change) => {
      if (change.origin === 'setValue' || change.origin === 'complete') return
      const cursor = cm.getCursor()
      cm.scrollIntoView(cursor)
      cm.showHint({
        completeSingle: false,
        files: getFiles(),
        snippets: this.props.snippets
      })
    })
  }

  render() {
    const { file, lineNumbers } = this.props

    const meta = CodeMirror.findModeByMIME(file.type)
    const mode = meta && meta.mode

    return (
      <CodeMirrorComponent
        id={file.key}
        value={file.text}
        mode={mode}
        lineNumbers={lineNumbers}
        keyMap="sublime"
        foldGutter
        foldOptions={this.props.foldOptions}
        extraKeys={this.props.extraKeys}
        ref={this.handleCodemirror}
      />
    )
  }
}
