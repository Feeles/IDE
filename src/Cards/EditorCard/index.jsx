import React, { PureComponent } from 'react'
import { withTheme } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { style } from 'typestyle'
import Button from '@material-ui/core/Button'
import AVPlayCircleOutline from '@material-ui/icons/PlayCircleOutline'

import Card from '../CardWindow'
import SourceEditor from './SourceEditor'

const cn = {
  largeIcon: style({
    width: 40,
    height: 40
  }),
  large: style({
    width: 80,
    height: 80,
    padding: 20
  })
}
const getCn = props => ({
  noFileBg: style({
    flex: '1 1 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: props.theme.palette.primary.main
  })
})

export class Tab {
  constructor({ label, filePath, iconUrl, tabs }) {
    this.label = label
    this.iconUrl = iconUrl
    if (filePath) {
      this.filePath = filePath
    } else if (tabs) {
      this.tabs = tabs.map(props => new Tab(props))
    }
  }

  static find(tabs, filePath) {
    for (const tab of tabs) {
      if (tab.filePath === filePath) return tab
    }
    for (const tab of tabs) {
      if (Array.isArray(tab.tabs)) {
        const found = Tab.find(tab.tabs, filePath)
        if (found) return found
      }
    }
  }
}

@withTheme()
export default class EditorCard extends PureComponent {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    fileView: PropTypes.object.isRequired,
    cardPropsBag: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired,
    putFile: PropTypes.func.isRequired,
    setLocation: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    findFile: PropTypes.func.isRequired,
    getConfig: PropTypes.func.isRequired,
    setConfig: PropTypes.func.isRequired,
    loadConfig: PropTypes.func.isRequired,
    reboot: PropTypes.bool.isRequired,
    href: PropTypes.string.isRequired,
    scrollToCard: PropTypes.func.isRequired,
    cardProps: PropTypes.object.isRequired,
    setCardVisibility: PropTypes.func.isRequired,
    globalEvent: PropTypes.object.isRequired,
    asset: PropTypes.object
  }

  state = {
    filePath: '', // 現在開いているファイルの名前. 空文字の場合は何も開いていない
    tabs: [], // プルダウンメニューの中で表示するファイルのリスト
    label: '', // このファイルの呼び名（タブから取得する）
    filePathToBack: '' // 最初に表示するファイルのパス. ホーム
  }

  componentDidMount() {
    const { globalEvent } = this.props
    globalEvent.on('message.editor', this.handleEditor)
    // init.fileName があるとき Mount 後に開いておく
    try {
      const { init } = this.props.cardProps.EditorCard
      if (init) {
        new Promise(resolve => {
          if (Array.isArray(init.tabs)) {
            const tabs = init.tabs.map(seed => new Tab(seed))
            this.setState({ tabs }, resolve)
          } else {
            resolve()
          }
        }).then(() => {
          const filePath = init.filePath || init.fileName // 後方互換性
          this.setState({ filePathToBack: filePath }) // ホームに設定
          this.openFile(filePath)
        })
      }
    } catch (e) {
      // continue regardless of error
    }
  }

  openFile = (filePath, options = {}) => {
    if (!filePath || filePath === this.state.filePath) return

    const file = this.props.findFile(filePath) // file type を知るために探す
    if (!file) return // ファイルが見つからなかった
    if (file.is('text')) {
      // テキストの場合は EditorCard で open

      let tabs = this.state.tabs
      const existTab = Tab.find(tabs, filePath)
      if (!existTab) {
        // 開こうとしているファイルを tabs の先頭に追加
        const tab = new Tab({ filePath, label: file.plain + file.ext })
        tabs = [tab].concat(tabs)
      }
      this.setState({
        filePath,
        tabs,
        label: options.label
          ? options.label + ''
          : existTab
          ? existTab.label
          : file.plain
      })

      this.props.setCardVisibility('EditorCard', true)
      // タブの選択が変化したら EditorCard にスクロールする
      this.props.scrollToCard('EditorCard')
    } else {
      // BinaryFile の場合は別タブで開く
      try {
        window.open(file.blobURL, '_blank')
      } catch (e) {
        // continue regardless of error
      }
    }
  }

  setLocation = href => {
    this.props.setLocation(href)
    this.props.scrollToCard('MonitorCard')
  }

  handleEditor = event => {
    const { value, options } = event.data
    if (value) {
      // feeles.openEditor()
      this.openFile(value, options)
    } else {
      // feeles.closeEditor()
      this.props.setCardVisibility('EditorCard', false)
    }
  }

  renderBackground(className) {
    return (
      <div className={className}>
        <Button
          variant="contained"
          size="large"
          onClick={() => this.setLocation()}
        >
          Feeles
          <AVPlayCircleOutline className={cn.largeIcon} />
        </Button>
      </div>
    )
  }

  getFiles = () => this.props.files

  render() {
    const { filePath } = this.state

    const dcn = getCn(this.props)
    if (!filePath) {
      return (
        <Card {...this.props.cardPropsBag} fit>
          {this.renderBackground(dcn.noFileBg)}
        </Card>
      )
    }

    const {
      putFile,
      openFileDialog,
      localization,
      findFile,
      getConfig,
      reboot,
      cardPropsBag
    } = this.props

    return (
      <Card {...cardPropsBag} fit width={640}>
        <SourceEditor
          fileView={this.props.fileView}
          filePath={filePath}
          files={this.props.files}
          getFiles={this.getFiles}
          setLocation={this.setLocation}
          href={this.props.href}
          getConfig={getConfig}
          loadConfig={this.props.loadConfig}
          findFile={findFile}
          localization={localization}
          reboot={reboot}
          openFileDialog={openFileDialog}
          putFile={putFile}
          tabs={this.state.tabs}
          label={this.state.label}
          filePathToBack={this.state.filePathToBack}
          globalEvent={this.props.globalEvent}
          asset={this.props.asset}
        />
      </Card>
    )
  }
}

export { default as Preview } from './Preview'
export { default as SourceEditor } from './SourceEditor'
