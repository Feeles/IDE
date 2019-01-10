import React, { PureComponent, Fragment } from 'react'
import { withTheme } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { style, classes } from 'typestyle'
import { IconButton, Button, Collapse, Tooltip } from '@material-ui/core'
import { Close, MoreHoriz, Home } from '@material-ui/icons'
import { fade } from '@material-ui/core/styles/colorManipulator'
import { Pos } from 'codemirror'
import {
  includes,
  intersection,
  forEach,
  uniq,
  uniqBy,
  differenceWith,
  debounce,
  flatten,
  without
} from 'lodash'
import ReactResizeDetector from 'react-resize-detector'

import { assetRegExp } from '../../utils/keywords'
import replaceExistConsts from '../../utils/replaceExistConsts'
import AssetButton from './AssetButton'
import SourceFile from '../../File/SourceFile'
import extractAssetNames from './extractAssetNames'
import AssetLink, { assetLinkWidth } from './AssetLink'

const paneHeight = 80 // %
export const pathToInstall = 'modules' // 後方互換性のために変更しない (TODO: feelesrc で上書きできるように)
const pathToAutoload = 'autoload.js' // 後方互換性のために変更しない (TODO: feelesrc で上書きできるように)

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
  }),
  assetLinkContainerClasses: {
    wrapperInner: style({
      width: '100%',
      display: 'flex',
      paddingRight: 64
    })
  },
  assetLinkButton: style({
    margin: 4,
    marginRight: 0,
    width: assetLinkWidth,
    minWidth: assetLinkWidth // ButtonBase の minWidth を打ち消す
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
        maxWidth: 48,
        height: 48
      }
    }
  }),
  active: style({
    color: theme.palette.common.white,
    borderBottomColor: theme.palette.common.white
  }),
  previousLinkButton: style({
    borderColor: theme.palette.primary.main
  })
})

@withTheme()
export default class AssetPane extends PureComponent {
  static propTypes = {
    label: PropTypes.string.isRequired,
    codemirror: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    runApp: PropTypes.func.isRequired,
    files: PropTypes.array.isRequired,
    findFile: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    globalEvent: PropTypes.object.isRequired,
    asset: PropTypes.object.isRequired,
    filePath: PropTypes.string.isRequired,
    filePathToBack: PropTypes.string.isRequired,
    isExpandingEditorCard: PropTypes.bool.isRequired,
    saveFileIfNeeded: PropTypes.func.isRequired
  }

  state = {
    show: false,
    assetLineNumber: 0,
    activeCategoryIndex: -1,
    scopeIndexes: [],
    assetNamesOfLinks: [],
    linkOnly: false, // 全てのアセットを表示するモード.全ての色を一画面に表示.「中に入れる」ボタンはない
    previousLabel: '', // リンクで移動する前の label を保持する (Home='')
    // オートインストール
    installingFileNames: null, // インストール中のモジュール名
    callback: {
      // インストール後の挙動
      type: '', // insertAsset | openFile | runApp
      payload: null // callback に必要な payload
    }
  }

  _widgets = new Map()
  _pendingInstallModule = []

  componentDidMount() {
    const cm = this.props.codemirror
    cm.on('change', this.handleUpdateWidget)
    cm.on('swapDoc', this.handleUpdateWidget)
    cm.on('update', this.handleRenderWidget)
    cm.on('beforeChange', this.handleIndexReplacement)
    cm.on('change', this.handleIndentLine)
    cm.on('swapDoc', this.updateAssetLink)

    this.handleUpdateWidget(cm)
    this.handleRenderWidget(cm)
    this.updateAssetLink(cm)
    this.props.globalEvent.on('message.install', this.handleInstallMessage)
  }

  componentWillUnmount() {
    this.props.globalEvent.off('message.install', this.handleInstallMessage)
  }

  componentDidUpdate(prevProps) {
    const { files, label } = this.props
    const { installingFileNames, callback } = this.state
    // オートインストールの完了待ち
    if (installingFileNames && prevProps.files !== this.props.files) {
      const all = files.map(file => file.name)
      if (installingFileNames.every(filePath => includes(all, filePath))) {
        // 全てのファイルが含まれているので, 待ち状態を初期化してコールバックを実行
        this.setState(
          {
            installingFileNames: null,
            callback: { type: '', payload: null }
          },
          () => this.executeCallback(callback)
        )
      }
    }
    // previousLabel: ラベルが変わったとき, 前回の label を保持
    if (label !== prevProps.label) {
      const wasInHome = prevProps.filePath === prevProps.filePathToBack
      this.setState({
        previousLabel: wasInHome ? '' : prevProps.label
      })
    }
  }

  insertAsset = ({ insertCode }) => {
    const cm = this.props.codemirror
    const { assetLineNumber } = this.state
    // バーが常に上に来るよう, 下に挿入
    const pos = new Pos(assetLineNumber + 1, 0)
    const end = new Pos(pos.line + insertCode.split('\n').length, 0)
    insertCode = '\n' + insertCode
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
    cm.setCursor(new Pos(end.line - 1, 0))
    // Pane をとじる
    this.handleClose()
    // 新しいアセットが更新された可能性が高いので, アセットのリンクを更新
    this.updateAssetLink(cm)
    // 実行
    this.props.runApp()
  }

  updateAssetLink = cm => {
    // ソースコードに含まれるキーワードを抜き出して Scrapbox 風のリンクを表示する
    const { asset } = this.props
    const assetNamesOfLinks = extractAssetNames(cm.getValue()).filter(
      assetName => Boolean(asset.module[assetName])
    )
    this.setState({ assetNamesOfLinks })
  }

  handleUpdateWidget = cm => {
    this._widgets.clear()
    for (const [line, text] of cm
      .getValue()
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
      show: false,
      linkOnly: false
    })
  }

  openFile = async ({ filePath, label, iconUrl }) => {
    if (!filePath) return
    await this.props.saveFileIfNeeded() // リンクで移動する前に変更を保存する

    this.props.globalEvent.emit('message.editor', {
      data: {
        value: filePath,
        options: {
          showBackButton: Boolean(label), // アセットのコードを閉じて以前のファイルに戻るボタンを表示する
          label, // ↑そのボタンを、この名前で「${label}の改造をおわる」と表示
          iconUrl
        }
      }
    })
    this.handleClose() // Pane をとじる
  }

  /**
   * アセットに含まれるモジュールをプロジェクトにコピーする
   */
  installAssetModules = (assetNames, callback) => {
    if (this.state.installingFileNames) {
      // すでに別のモジュールをインストール中
      this._pendingInstallModule.push([assetNames, callback]) // 前回コールされた installModule の終了を待ってから実行する
      return
    }
    const { asset, files } = this.props

    // module が存在するかどうか
    for (const assetName of assetNames) {
      const mod = asset.module[assetName]
      if (!mod) throw new Error(`${assetName} is not exist in asset.module`) // TODO: 例外処理
    }

    const toPath = name => `${pathToInstall}/${name}.js`

    const notInstalled = differenceWith(
      assetNames,
      files,
      (assetName, file) => toPath(assetName) === file.name
    )
    if (notInstalled.length === 0) {
      // すでに全部インストールされている
      this.executeCallback(callback)
      return
    }

    // まずコールバックを設定してからファイルをコピー
    const installingFileNames = assetNames.map(toPath)
    this.setState({ installingFileNames, callback }, async () => {
      const autoload = this.props.files.find(
        file => file.name === pathToAutoload
      )
      if (!autoload) throw new Error(`${pathToAutoload} is not found`)

      // autoload.js の更新
      let text = autoload.text
      if (text && text.substr(-1) !== '\n') text += '\n'
      for (const assetName of notInstalled) {
        text += `import '${pathToInstall}/${assetName}'\n`
      }
      await this.props.putFile(
        autoload,
        new SourceFile({
          type: autoload.type,
          name: autoload.name,
          text
        })
      )
      // ファイルのコピー
      for (const assetName of assetNames) {
        const mod = asset.module[assetName]
        await this.props.putFile(
          new SourceFile({
            type: 'text/javascript',
            name: toPath(assetName),
            text: mod.code
          })
        )
      }
    })
  }

  /**
   * そのアセットを動作させるためにインストールする必要があるアセット(自分自身を含む)を列挙する
   * 重複を除くために, 同じ配列 _ignoreList に要素を追加していく (動的計画法, 深さ優先探索)
   */
  getDependencies = (name, _ignoreList = []) => {
    const mod = this.props.asset.module[name]
    if (!mod) return _ignoreList
    _ignoreList.push(name)
    for (const dependency of extractAssetNames(mod.code)) {
      if (!includes(_ignoreList, dependency)) {
        // 新しいアセットが見つかったら, 再帰的に依存アセットを探す
        this.getDependencies(dependency, _ignoreList)
      }
    }
    return _ignoreList
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
    // pending 状態のインストールを実行
    const next = this._pendingInstallModule.shift()
    if (next) {
      this.installAssetModules.apply(this, next)
    }
  }

  _pendingAssetsToInstall = []
  handleInstallMessage = event => {
    const {
      data: { value: name }
    } = event
    const { asset } = this.props
    // module が存在するなら先に install
    const mod = asset.module[name]
    if (mod) {
      this._pendingAssetsToInstall.push(name) // ここでは pending list に入れるだけ
      this.installAssetsFromMessage() // この関数でインストールする
    } else {
      // そもそもアセットの名前を間違えているかも知れない
    }
  }

  installAssetsFromMessage = debounce(
    (() => {
      // install message を一定時間 debounce して, 一度にインストール
      const { length } = this._pendingAssetsToInstall
      if (length <= 0) return // ない

      const assetNames = uniq(
        flatten(
          this._pendingAssetsToInstall
            .splice(0, length) // pending list から削除
            .map(assetName => this.getDependencies(assetName)) // 依存アセットもここで同時にインストール
        )
      )
      // インストール後に runApp
      this.installAssetModules(assetNames, {
        type: 'runApp'
      })
    }).bind(this),
    16
  )

  handleInsertAsset = ({ name, insertCode }) => {
    const { asset } = this.props
    // module が存在するなら先に install
    const mod = asset.module[name]
    if (mod) {
      // 依存アセットもここで同時にインストール
      const dependencies = this.getDependencies(name)
      // インストール後に insertAsset
      this.installAssetModules(dependencies, {
        type: 'insertAsset',
        payload: { insertCode }
      })
    } else {
      this.insertAsset({ insertCode })
    }
  }

  handleOpenFile = ({ name, filePath, iconUrl }) => {
    const { asset } = this.props
    // module が存在するなら先に install
    const mod = asset.module[name]
    if (mod) {
      // インストール後に openFile
      this.installAssetModules([name], {
        type: 'openFile',
        payload: { filePath, label: name, iconUrl }
      })
    } else {
      // 開けるかどうか試す
      this.openFile({ filePath, label: name, iconUrl })
    }
  }

  handleAssetLinkClick = ({ name, iconUrl }) => {
    // もしそのアセットがインストールされていなければ、インストールしてから開く
    this.handleOpenFile({
      name,
      filePath: `${pathToInstall}/${name}.js`,
      iconUrl
    })
  }

  handleBackButtonClick = () => {
    this.openFile({
      filePath: this.props.filePathToBack
    })
  }

  handleMoreButtonClick = () =>
    this.setState({
      show: true,
      linkOnly: true,
      activeCategoryIndex: 0
    })

  renderAssetButtons(assetButtons) {
    const { linkOnly } = this.state
    if (linkOnly) {
      // 全てのバリエーションを並べる
      return assetButtons.map(assetButton =>
        assetButton.variations ? (
          <Fragment key={assetButton.name + '-container'}>
            {this.renderAssetButtons(assetButton.variations)}
          </Fragment>
        ) : (
          <AssetButton
            key={assetButton.name}
            name={assetButton.name}
            description={assetButton.description}
            iconUrl={assetButton.iconUrl}
            insertCode={assetButton.insertCode}
            moduleCode={assetButton.moduleCode}
            filePath={assetButton.filePath}
            insertAsset={this.handleInsertAsset}
            openFile={this.handleOpenFile}
            findFile={this.props.findFile}
            localization={this.props.localization}
            globalEvent={this.props.globalEvent}
            asset={this.props.asset}
            linkOnly={linkOnly}
          />
        )
      )
    } else {
      // クリックでバリエーションを展開する
      return assetButtons.map(assetButton => (
        <AssetButton
          key={assetButton.name}
          name={assetButton.name}
          description={assetButton.description}
          iconUrl={assetButton.iconUrl}
          insertCode={assetButton.insertCode}
          moduleCode={assetButton.moduleCode}
          filePath={assetButton.filePath}
          variations={assetButton.variations}
          insertAsset={this.handleInsertAsset}
          openFile={this.handleOpenFile}
          findFile={this.props.findFile}
          localization={this.props.localization}
          globalEvent={this.props.globalEvent}
          asset={this.props.asset}
          linkOnly={linkOnly}
        />
      ))
    }
  }

  render() {
    const dcn = getCn(this.props)
    const {
      localization,
      asset: { scopes, categories, buttons },
      filePath,
      filePathToBack
    } = this.props
    const {
      show,
      activeCategoryIndex,
      scopeIndexes,
      assetNamesOfLinks,
      linkOnly,
      previousLabel
    } = this.state

    const showingScopes = scopes.filter((_, i) => includes(scopeIndexes, i))

    const _showingButtons = buttons.filter(
      b => b.category === activeCategoryIndex
    )
    const showingButtons = linkOnly
      ? uniqBy(_showingButtons, assetButton => assetButton.name).filter(
          assetButton => Boolean(this.props.asset.module[assetButton.name])
        ) // リンクのみ表示の場合, スコープを無視するが, 代わりにアセット名で一意にする
      : _showingButtons.filter(
          b => b.scopes === null || intersection(b.scopes, scopeIndexes).length
        ) // スコープが被っているものに絞る

    const showBackButton = filePath !== filePathToBack

    const showLinkAssets = assetNamesOfLinks.length > 0 || showBackButton // アセットがあれば表示 (=> 古いキットでは出てこない) || アセットがなくても, Home にいなければ表示 (=> もどるボタンは常に使える)

    // アセットリンクの表示限界個数を求める
    const calcMaxLength = width =>
      Math.floor(
        (width - 64) / assetLinkWidth - // slaask の分だけ引いた全体 width / リンク１個分の width
          (previousLabel ? 2 : 1) // 直前のアセットへのリンクと, Home or More リンクの分を引く
      )

    return (
      <>
        {/* Scrapbox 風のアセットのリンク */}
        <Collapse
          in={showLinkAssets}
          classes={cn.assetLinkContainerClasses}
          mountOnEnter
          unmountOnExit
        >
          {showBackButton ? (
            <Tooltip
              title={this.props.localization.editorCard.stopEditing(
                this.props.label
              )}
            >
              <Button
                variant="contained"
                color="primary"
                className={cn.assetLinkButton}
                onClick={this.handleBackButtonClick}
              >
                <Home fontSize="large" className={cn.assetLinkButtonIcon} />
              </Button>
            </Tooltip>
          ) : null}
          {previousLabel ? (
            <AssetLink
              key={previousLabel}
              name={previousLabel}
              asset={this.props.asset}
              className={classes(cn.assetLinkButton, dcn.previousLinkButton)}
              onClick={this.handleAssetLinkClick}
              localization={this.props.localization}
            />
          ) : null}
          <ReactResizeDetector
            handleWidth
            refreshMode="throttle"
            refreshRate={500}
          >
            {width => (
              <>
                {without(assetNamesOfLinks, previousLabel)
                  .slice(0, calcMaxLength(width)) // 表示限界を計算
                  .map(assetName => (
                    <AssetLink
                      key={assetName}
                      name={assetName}
                      asset={this.props.asset}
                      className={cn.assetLinkButton}
                      onClick={this.handleAssetLinkClick}
                      localization={this.props.localization}
                    />
                  ))}
              </>
            )}
          </ReactResizeDetector>
          {showBackButton ? null : (
            <Button
              variant="outlined"
              className={cn.assetLinkButton}
              onClick={this.handleMoreButtonClick}
            >
              <MoreHoriz fontSize="large" className={cn.assetLinkButtonIcon} />
            </Button>
          )}
        </Collapse>
        {/* 画面全体のアセット一覧 */}
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
          {linkOnly ? null : (
            <div className={dcn.scopeWrapper}>
              <span className={dcn.scope}>
                {'+ ' + showingScopes.map(scope => scope.name).join(' ')}
              </span>
              <span>{localization.editorCard.selectedScope}</span>
            </div>
          )}
          <IconButton
            aria-label="Close"
            className={dcn.closer}
            onClick={this.handleClose}
          >
            <Close fontSize="large" />
          </IconButton>
          <div className={dcn.scroller}>
            <div className={cn.wrapper}>
              {this.renderAssetButtons(showingButtons)}
            </div>
          </div>
        </div>
      </>
    )
  }
}
