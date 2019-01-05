import React, { PureComponent } from 'react'
import { withTheme } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { style, classes } from 'typestyle'
import IconButton from '@material-ui/core/IconButton'
import Close from '@material-ui/icons/Close'
import { fade } from '@material-ui/core/styles/colorManipulator'
import { Pos } from 'codemirror'
import { includes, intersection, forEach } from 'lodash'

import { assetRegExp } from '../../utils/keywords'
import replaceExistConsts from '../../utils/replaceExistConsts'
import AssetButton from './AssetButton'
import SourceFile from '../../File/SourceFile'

const paneHeight = 80 // %
export const moduleDir = 'modules'
const autoloadFile = 'autoload.js'
const iconSize = 48

const cn = {
  in: style({
    top: `${100 - paneHeight}vh`
  }),
  out: style({
    top: '100vh'
  }),
  label: style({
    flex: '0 0 100%',
    color: 'white',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: 600
  }),
  wrapper: style({
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center'
  })
}
const getCn = ({ theme }) => ({
  root: style({
    position: 'fixed',
    width: '100%',
    height: `${paneHeight}vh`,
    padding: theme.spacing.unit,
    boxSizing: 'border-box',
    zIndex: theme.zIndex.modal - 1,
    left: 0,
    transition: theme.transitions.create('top'),
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: fade(theme.palette.text.primary, 0.75)
  }),
  scroller: style({
    flex: 1,
    overflowX: 'auto',
    overflowY: 'scroll',
    boxSizing: 'border-box',
    paddingBottom: 24,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0
  }),
  scopeWrapper: style({
    color: theme.palette.common.white,
    paddingLeft: theme.spacing.unit * 10,
    paddingRight: theme.spacing.unit * 10,
    paddingBottom: theme.spacing.unit * 4,
    fontWeight: 600
  }),
  scope: style({
    padding: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    color: theme.palette.getContrastText(theme.palette.primary.main),
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.shape.borderRadius
  }),
  closer: style({
    position: 'absolute',
    top: theme.spacing.unit,
    right: theme.spacing.unit,
    color: theme.palette.common.white
  }),
  categoryWrapper: style({
    display: 'flex',
    flexWrap: 'nowrap',
    paddingLeft: theme.spacing.unit * 10,
    paddingRight: theme.spacing.unit * 10,
    paddingBottom: theme.spacing.unit * 4,
    paddingTop: theme.spacing.unit * 4
  }),
  category: style({
    flex: 1,
    fontWeight: 600,
    cursor: 'pointer',
    color: theme.palette.grey[600],
    borderBottom: `4px solid ${theme.palette.grey[600]}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    $nest: {
      '&>img': {
        maxWidth: iconSize,
        height: iconSize
      }
    }
  }),
  active: style({
    color: theme.palette.common.white,
    borderBottomColor: theme.palette.common.white
  })
})

@withTheme()
export default class AssetPane extends PureComponent {
  static propTypes = {
    codemirror: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    runApp: PropTypes.func.isRequired,
    files: PropTypes.array.isRequired,
    findFile: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    globalEvent: PropTypes.object.isRequired,
    asset: PropTypes.object.isRequired
  }

  state = {
    show: false,
    assetLineNumber: 0,
    activeCategoryIndex: -1,
    scopeIndexes: [],
    // オートインストール
    installingFileName: null, // インストール中のモジュール名
    callback: {
      // インストール後の挙動
      type: '', // insertAsset | openFile | runApp
      payload: null // callback に必要な payload
    }
  }

  _widgets = new Map()

  componentDidMount() {
    const cm = this.props.codemirror
    cm.on('change', this.handleUpdateWidget)
    cm.on('swapDoc', this.handleUpdateWidget)
    cm.on('update', this.handleRenderWidget)
    cm.on('beforeChange', this.handleIndexReplacement)
    cm.on('change', this.handleIndentLine)

    this.handleUpdateWidget(cm)
    this.handleRenderWidget(cm)
    this.props.globalEvent.on('message.install', this.handleInstallMessage)
  }

  componentWillUnmount() {
    this.props.globalEvent.off('message.install', this.handleInstallMessage)
  }

  componentDidUpdate(prevProps) {
    const { files } = this.props
    const { installingFileName, callback } = this.state
    // オートインストールの完了待ち
    if (installingFileName && prevProps.files !== this.props.files) {
      if (files.some(file => file.name === installingFileName)) {
        // 発見したので待ち状態を初期化してコールバックを実行
        this.setState(
          {
            installingFileName: null,
            callback: { type: '', payload: null }
          },
          () => this.executeCallback(callback)
        )
      }
    }
  }

  insertAsset = ({ insertCode }) => {
    const cm = this.props.codemirror
    const { assetLineNumber } = this.state
    const pos = new Pos(assetLineNumber, 0)
    const end = new Pos(pos.line + insertCode.split('\n').length, 0)
    insertCode += '\n'
    cm.replaceRange(insertCode, pos, pos, 'asset')
    // スクロール
    cm.scrollIntoView(
      {
        from: pos,
        to: end
      },
      10
    )
    // カーソル (挿入直後に undo したときスクロールが上に戻るのを防ぐ)
    cm.focus()
    cm.setCursor(end)
    // Pane をとじる
    this.handleClose()
    // 実行 (UIが固まらないように時間をおいている)
    this.props.runApp()
  }

  handleUpdateWidget = cm => {
    this._widgets.clear()
    for (const [line, text] of cm
      .getValue('\n')
      .split('\n')
      .entries()) {
      this.updateWidget(cm, line, text)
    }
  }

  updateWidget = (cm, line, text) => {
    const { asset } = this.props
    // Syntax: /*+ モンスター アイテム */
    const tokens = assetRegExp.exec(text)
    if (tokens) {
      const [, _prefix, _left, _label, _right] = tokens.map(t =>
        t.replace(/\t/g, '    ')
      )
      const prefix = document.createElement('span')
      prefix.textContent = _prefix
      prefix.classList.add('Feeles-asset-blank')
      const left = document.createElement('span')
      left.textContent = _left
      left.classList.add('Feeles-asset-blank')
      const label = document.createElement('span')
      label.textContent = _label
      const right = document.createElement('span')
      right.textContent = _right
      right.classList.add('Feeles-asset-blank')
      const button = document.createElement('span')
      button.classList.add('Feeles-asset-button')
      button.onclick = event => {
        const scopeIndexes = []
        let activeCategoryIndex = -1
        // バーに書かれた文字列の中に scope.name があれば選択
        forEach(asset.scopes, (scope, index) => {
          if (includes(_label, scope.name)) {
            scopeIndexes.push(index)
            // 先頭のスコープで, 初期表示カテゴリを決める
            if (activeCategoryIndex < 0) {
              activeCategoryIndex = scope.defaultActiveCategory
            }
          }
        })
        this.setState({
          show: true,
          scopeIndexes,
          activeCategoryIndex,
          assetLineNumber: line
        })
        event.stopPropagation()
      }
      button.appendChild(left)
      button.appendChild(label)
      button.appendChild(right)
      const parent = document.createElement('div')
      parent.classList.add('Feeles-widget', 'Feeles-asset')
      parent.appendChild(prefix)
      parent.appendChild(button)
      this._widgets.set(line, parent)
    }
  }

  handleRenderWidget = cm => {
    // remove old widgets
    for (const widget of [...document.querySelectorAll('.Feeles-asset')]) {
      if (widget.parentNode) {
        widget.parentNode.removeChild(widget)
      }
    }
    // render new widgets
    for (const [i, element] of this._widgets.entries()) {
      // fold されていないかを確認
      const lineHandle = cm.getLineHandle(i)
      if (lineHandle.height > 0) {
        cm.addWidget(new Pos(i, 0), element)
      }
    }
  }

  handleIndexReplacement = (cm, change) => {
    if (!includes(['asset', 'paste'], change.origin)) return

    const code = cm.getValue('\n')
    const sourceText = change.text.join('\n')
    const replacedText = replaceExistConsts(code, sourceText)
    if (sourceText !== replacedText) {
      change.update(change.from, change.to, replacedText.split('\n'))
    }
  }

  handleIndentLine = (cm, change) => {
    if (!includes(['asset', 'paste'], change.origin)) return
    const { from } = change
    const to = new Pos(from.line + change.text.length, 0)
    // インデント
    for (let line = from.line; line < to.line; line++) {
      cm.indentLine(line)
    }
  }

  handleClose = () => {
    this.setState({
      show: false
    })
  }

  openFile = ({ filePath, label }) => {
    if (!filePath) return
    this.props.globalEvent.emit('message.editor', {
      data: {
        value: filePath,
        options: {
          showBackButton: true, // アセットのコードを閉じて以前のファイルに戻るボタンを表示する
          label // ↑そのボタンを、この名前で「${label}の改造をおわる」と表示
        }
      }
    })
    this.handleClose() // Pane をとじる
  }

  /**
   * アセットに含まれるモジュールをプロジェクトにコピーする
   */
  installModule = (moduleName, callback) => {
    if (this.state.installingFileName) return // すでに別のモジュールをインストール中
    const { asset, files } = this.props
    const localModuleName = `${moduleDir}/${moduleName}`
    const localFilePath = `${localModuleName}.js`
    const existFile = files.find(file => file.name === localFilePath)
    if (existFile) {
      // すでにインストールされている
      this.executeCallback(callback)
      return
    }
    const mod = asset.module[moduleName]
    if (!mod) return alert(`${moduleName} is not exist in module`) // TODO: 例外処理

    // まずコールバックを設定してからファイルをコピー
    this.setState({ installingFileName: localFilePath, callback }, () => {
      this.props.putFile(
        new SourceFile({
          type: 'text/javascript',
          name: localFilePath,
          text: mod.code
        })
      )
    })

    // autoload.js の更新
    const autoload = files.find(file => file.name === autoloadFile)
    if (autoload) {
      let text = autoload.text
      if (text && text.substr(-1) !== '\n') text += '\n'
      text += `import '${localModuleName}';\n`
      this.props.putFile(
        autoload,
        new SourceFile({
          type: autoload.type,
          name: autoload.name,
          text
        })
      )
    }
  }

  executeCallback = ({ type, payload }) => {
    switch (type) {
      case 'insertAsset':
        this.insertAsset(payload)
        break
      case 'openFile':
        this.openFile(payload)
        break
      case 'runApp':
        this.props.runApp()
        break
    }
  }

  handleInstallMessage = event => {
    const {
      data: { value: name }
    } = event
    const { asset } = this.props
    // module が存在するなら先に install
    const mod = asset.module[name]
    if (mod) {
      // インストール後に runApp
      this.installModule(name, {
        type: 'runApp'
      })
    } else {
      // そもそもアセットの名前を間違えているかも知れない
    }
  }

  handleInsertAsset = ({ name, insertCode }) => {
    const { asset } = this.props
    // module が存在するなら先に install
    const mod = asset.module[name]
    if (mod) {
      // インストール後に insertAsset
      this.installModule(name, {
        type: 'insertAsset',
        payload: { insertCode }
      })
    } else {
      this.insertAsset({ insertCode })
    }
  }

  handleOpenFile = ({ name, filePath }) => {
    const { asset } = this.props
    // module が存在するなら先に install
    const mod = asset.module[name]
    if (mod) {
      // インストール後に openFile
      this.installModule(name, {
        type: 'openFile',
        payload: { filePath, label: name }
      })
    } else {
      // 開けるかどうか試す
      this.openFile({ filePath, label: name })
    }
  }

  render() {
    const dcn = getCn(this.props)
    const {
      localization,
      asset: { scopes, categories, buttons }
    } = this.props
    const { show, activeCategoryIndex, scopeIndexes } = this.state

    const showingScopes = scopes.filter((_, i) => includes(scopeIndexes, i))

    const showingButtons = buttons
      .filter(
        b => b.scopes === null || intersection(b.scopes, scopeIndexes).length
      )
      .filter(b => b.category === activeCategoryIndex)

    return (
      <div className={classes(dcn.root, show ? cn.in : cn.out)}>
        {categories.length ? (
          <div className={dcn.categoryWrapper}>
            {categories.map((cat, i) => (
              <div
                key={i}
                className={classes(
                  dcn.category,
                  i === activeCategoryIndex && dcn.active
                )}
                onClick={() => this.setState({ activeCategoryIndex: i })}
              >
                <span>{cat.name}</span>
                <img src={cat.iconUrl} alt="" />
              </div>
            ))}
          </div>
        ) : null}
        <div className={dcn.scopeWrapper}>
          <span className={dcn.scope}>
            {'+ ' + showingScopes.map(scope => scope.name).join(' ')}
          </span>
          <span>{localization.editorCard.selectedScope}</span>
        </div>
        <IconButton
          aria-label="Close"
          className={dcn.closer}
          onClick={this.handleClose}
        >
          <Close fontSize="large" />
        </IconButton>
        <div className={dcn.scroller}>
          <div className={cn.wrapper}>
            {showingButtons.map((b, i) => (
              <AssetButton
                key={`${activeCategoryIndex}-${i}`} // 別ページでインスタンスを使い回すことはできない
                name={b.name}
                description={b.description}
                iconUrl={b.iconUrl}
                insertCode={b.insertCode}
                moduleCode={b.moduleCode}
                filePath={b.filePath}
                variations={b.variations}
                insertAsset={this.handleInsertAsset}
                openFile={this.handleOpenFile}
                findFile={this.props.findFile}
                localization={this.props.localization}
                globalEvent={this.props.globalEvent}
                asset={this.props.asset}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }
}
