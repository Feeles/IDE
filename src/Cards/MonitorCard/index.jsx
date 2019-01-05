import React, { PureComponent } from 'react'
import { style, classes } from 'typestyle'
import { percent } from 'csx'
import PropTypes from 'prop-types'
import Card from '../CardWindow'
import CardMedia from '@material-ui/core/CardMedia'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import NavigationRefresh from '@material-ui/icons/Refresh'
import NavigationFullscreen from '@material-ui/icons/Fullscreen'
import ActionSettings from '@material-ui/icons/Settings'
import OpenInBrowser from '@material-ui/icons/OpenInBrowser'
import DeviceDevices from '@material-ui/icons/Devices'
import ImagePhotoCamera from '@material-ui/icons/PhotoCamera'

import CardFloatingBar from '../CardFloatingBar'
import Monitor from './Monitor'
import ResolveProgress from './ResolveProgress'

const frameSizes = [
  [480, 320],
  [640, 480],
  [720, 480],
  [800, 600],
  [1024, 768],
  [1136, 640],
  [1280, 720],
  [1280, 800],
  [1920, 1080]
]

const by = 'x'
const getContainerStyle = (frameWidth, frameHeight) => ({
  paddingTop: percent((frameHeight / frameWidth) * 100)
})

const cn = {
  flexible: style({
    position: 'relative',
    width: '100%'
  }),
  popout: style({
    height: 8
  }),
  fullScreen: style({
    zIndex: 2000 // フルスクリーン時, CardFloatingBar より手前に来るように
  }),
  parent: style({
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0
  }),
  blank: style({
    flex: 1
  })
}

export default class MonitorCard extends PureComponent {
  static propTypes = {
    cardPropsBag: PropTypes.object.isRequired,
    setLocation: PropTypes.func.isRequired,
    isPopout: PropTypes.bool.isRequired,
    togglePopout: PropTypes.func.isRequired,
    toggleFullScreen: PropTypes.func.isRequired,
    files: PropTypes.array.isRequired,
    cardProps: PropTypes.object.isRequired,
    isFullScreen: PropTypes.bool.isRequired,
    reboot: PropTypes.bool.isRequired,
    href: PropTypes.string.isRequired,
    showAll: PropTypes.bool.isRequired,
    localization: PropTypes.object.isRequired,
    getConfig: PropTypes.func.isRequired,
    loadConfig: PropTypes.func.isRequired,
    addFile: PropTypes.func.isRequired,
    findFile: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,
    saveAs: PropTypes.func.isRequired,
    globalEvent: PropTypes.object.isRequired
  }

  state = {
    frameWidth: 300,
    frameHeight: 150,
    containerStyle: getContainerStyle(300, 150),
    processing: false,
    statusLabel: null,
    anchorEl: null
  }

  componentDidMount() {
    try {
      const { frame } = this.props.cardProps.MonitorCard
      if (frame && Array.isArray(frame.size)) {
        const [frameWidth, frameHeight] = frame.size
        this.changeSize(frameWidth, frameHeight)
      }
    } catch (e) {
      // continue regardless of error
    }
    this.props.globalEvent.on('message.statusLabel', this.setStatusLabel)
  }

  setStatusLabel = ({ data }) => {
    const { value } = data
    if (typeof value !== 'string')
      throw new TypeError(`Cannot make statusLabel ${value}`)
    this.setState({
      statusLabel: value
    })
  }

  changeSize(frameWidth, frameHeight) {
    this.setState({
      frameWidth,
      frameHeight,
      containerStyle: getContainerStyle(frameWidth, frameHeight)
    })
  }

  renderMenuItem([w, h]) {
    const value = w + by + h
    return (
      <MenuItem key={value} onClick={() => this.changeSize(w, h)}>
        {value}
      </MenuItem>
    )
  }

  handleScreenShot = async () => {
    if (this.state.processing) return
    this.setState({ processing: true })
    // Monitor にスクリーンショットを撮るようリクエスト
    const request = {
      query: 'capture',
      type: 'image/jpeg',
      requestedBy: 'user-action' // ユーザーがリクエストしたことを表す
    }
    await this.props.globalEvent.emitAsync('postMessage', request)
    // capture がおわったら, processing state を元に戻す
    this.setState({ processing: false })
  }

  handleSettings = event => {
    this.setState({
      anchorEl: event.currentTarget
    })
  }

  handleClose = () => {
    this.setState({ anchorEl: null })
  }

  render() {
    const sizeValue = this.state.frameWidth + by + this.state.frameHeight
    const { localization, showAll, loadConfig } = this.props
    const feelesrc = loadConfig('feelesrc')

    return (
      <Card {...this.props.cardPropsBag}>
        <CardFloatingBar>
          <span>{this.props.localization.monitorCard.title}</span>
          <div className={cn.blank} />
          <span>{this.state.statusLabel}</span>
          <IconButton disabled>
            <ResolveProgress size={24} globalEvent={this.props.globalEvent} />
          </IconButton>
          <IconButton
            color="primary"
            disabled={feelesrc.disableReloadButton}
            onClick={() => this.props.setLocation()}
          >
            <NavigationRefresh />
          </IconButton>
          <IconButton
            disabled={feelesrc.disableFullScreenButton}
            onClick={() => this.props.toggleFullScreen()}
          >
            <NavigationFullscreen />
          </IconButton>
          {showAll ? (
            <IconButton
              tooltip="screenshot"
              disabled={this.state.processing}
              onClick={this.handleScreenShot}
            >
              <ImagePhotoCamera />
            </IconButton>
          ) : null}
          {showAll ? (
            <IconButton tooltip="settings" onClick={this.handleSettings}>
              <ActionSettings />
            </IconButton>
          ) : null}
        </CardFloatingBar>
        <CardMedia
          className={classes(
            cn.flexible,
            this.props.isPopout && cn.popout,
            this.props.isFullScreen && cn.fullScreen
          )}
          style={this.props.isPopout ? undefined : this.state.containerStyle}
        >
          <div className={cn.parent}>
            <Monitor
              files={this.props.files}
              isPopout={this.props.isPopout}
              isFullScreen={this.props.isFullScreen}
              reboot={this.props.reboot}
              href={this.props.href}
              togglePopout={this.props.togglePopout}
              toggleFullScreen={this.props.toggleFullScreen}
              localization={this.props.localization}
              getConfig={this.props.getConfig}
              addFile={this.props.addFile}
              findFile={this.props.findFile}
              putFile={this.props.putFile}
              saveAs={this.props.saveAs}
              setLocation={this.props.setLocation}
              frameWidth={this.state.frameWidth}
              frameHeight={this.state.frameHeight}
              globalEvent={this.props.globalEvent}
            />
          </div>
        </CardMedia>
        <Menu
          anchorEl={this.state.anchorEl}
          open={!!this.state.anchorEl}
          onClose={this.handleClose}
        >
          <MenuItem
            leftIcon={<DeviceDevices />}
            menuItems={frameSizes.map(this.renderMenuItem, this)}
          >
            {sizeValue}
          </MenuItem>
          <MenuItem
            leftIcon={<OpenInBrowser />}
            onClick={() => this.props.togglePopout()}
          >
            {localization.monitorCard.popout}
          </MenuItem>
        </Menu>
      </Card>
    )
  }
}
