import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Card from '../CardWindow';
import { CardMedia } from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import NavigationRefresh from 'material-ui/svg-icons/navigation/refresh';
import NavigationFullscreen from 'material-ui/svg-icons/navigation/fullscreen';
import ActionSettings from 'material-ui/svg-icons/action/settings';
import OpenInBrowser from 'material-ui/svg-icons/action/open-in-browser';
import DeviceDevices from 'material-ui/svg-icons/device/devices';
import ImagePhotoCamera from 'material-ui/svg-icons/image/photo-camera';

import Monitor from './Monitor';
import ResolveProgress from './ResolveProgress';

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
];

const by = 'x';

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
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  state = {
    frameWidth: 300,
    frameHeight: 150,
    processing: false
  };

  componentDidMount() {
    try {
      const { frame } = this.props.cardProps.MonitorCard;
      if (frame && Array.isArray(frame.size)) {
        const [frameWidth, frameHeight] = frame.size;
        this.setState({ frameWidth, frameHeight });
      }
    } catch (e) {
      // continue regardless of error
    }
  }

  get height() {
    return ((this.state.frameHeight / this.state.frameWidth) * 100) >> 0;
  }

  changeSize(frameWidth, frameHeight) {
    this.setState({ frameWidth, frameHeight });
  }

  renderMenuItem([w, h]) {
    const value = w + by + h;
    return (
      <MenuItem
        key={value}
        primaryText={value}
        onClick={() => this.changeSize(w, h)}
      />
    );
  }

  handleScreenShot = async () => {
    if (this.state.processing) return;
    this.setState({ processing: true });
    // Monitor にスクリーンショットを撮るようリクエスト
    const request = {
      query: 'capture',
      type: 'image/jpeg',
      requestedBy: 'user-action' // ユーザーがリクエストしたことを表す
    };
    await this.props.globalEvent.emitAsync('postMessage', request);
    // capture がおわったら, processing state を元に戻す
    this.setState({ processing: false });
  };

  render() {
    const styles = {
      flexible: {
        position: 'relative',
        width: '100%'
      },
      parent: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0
      }
    };
    if (this.props.isPopout) {
      styles.flexible.height = 8;
    } else {
      styles.flexible.paddingTop = this.height + '%';
    }

    const sizeValue = this.state.frameWidth + by + this.state.frameHeight;
    const { localization, showAll, loadConfig } = this.props;
    const feelesrc = loadConfig('feelesrc');

    const actions = [
      <IconButton key="progress" disabled>
        <ResolveProgress size={24} globalEvent={this.props.globalEvent} />
      </IconButton>,
      <IconButton
        key="refresh"
        disabled={feelesrc.disableReloadButton}
        onClick={() => this.props.setLocation()}
      >
        <NavigationRefresh
          color={this.context.muiTheme.palette.primary1Color}
        />
      </IconButton>,
      <IconButton
        key="fullscreen"
        disabled={feelesrc.disableFullScreenButton}
        onClick={() => this.props.toggleFullScreen()}
      >
        <NavigationFullscreen />
      </IconButton>
    ];
    if (showAll) {
      actions.push(
        <IconButton
          key="screenshot"
          disabled={this.state.processing}
          onClick={this.handleScreenShot}
        >
          <ImagePhotoCamera />
        </IconButton>,
        <IconMenu
          key="settings"
          iconButtonElement={
            <IconButton>
              <ActionSettings />
            </IconButton>
          }
        >
          <MenuItem
            primaryText={sizeValue}
            leftIcon={<DeviceDevices />}
            menuItems={frameSizes.map(this.renderMenuItem, this)}
          />
          <MenuItem
            primaryText={localization.monitorCard.popout}
            leftIcon={<OpenInBrowser />}
            onClick={() => this.props.togglePopout()}
          />
        </IconMenu>
      );
    }

    return (
      <Card
        icon={this.props.localization.monitorCard.title}
        {...this.props.cardPropsBag}
        actions={actions}
      >
        <CardMedia style={styles.flexible}>
          <div style={styles.parent}>
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
      </Card>
    );
  }
}
