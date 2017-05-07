import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Card from './CardWindow';
import { CardMedia } from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import NavigationRefresh from 'material-ui/svg-icons/navigation/refresh';
import NavigationFullscreen from 'material-ui/svg-icons/navigation/fullscreen';
import ActionSettings from 'material-ui/svg-icons/action/settings';
import OpenInBrowser from 'material-ui/svg-icons/action/open-in-browser';
import DeviceDevices from 'material-ui/svg-icons/device/devices';
import HardwareDesktopWindows
  from 'material-ui/svg-icons/hardware/desktop-windows';
import ImagePhotoCamera from 'material-ui/svg-icons/image/photo-camera';

import Monitor from '../Monitor/';

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
const getUniqueId = (i => () => `Capture-${++i}`)(0);

export default class MonitorCard extends PureComponent {
  static propTypes = {
    cardPropsBag: PropTypes.object.isRequired,
    monitorProps: PropTypes.object.isRequired,
    setLocation: PropTypes.func.isRequired,
    isPopout: PropTypes.bool.isRequired,
    togglePopout: PropTypes.func.isRequired,
    toggleFullScreen: PropTypes.func.isRequired,
    port: PropTypes.object
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  state = {
    frameWidth: 300,
    frameHeight: 150,
    processing: false
  };

  static icon() {
    return <HardwareDesktopWindows />;
  }

  componentWillMount() {
    const { size } = this.props.cardPropsBag.cards.MonitorCard.frame || {};
    if (Array.isArray(size)) {
      this.setState({
        frameWidth: size[0],
        frameHeight: size[1]
      });
    }
  }

  get height() {
    return (this.state.frameHeight / this.state.frameWidth * 100) >> 0;
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
        onTouchTap={() => this.changeSize(w, h)}
      />
    );
  }

  handleScreenShot = () => {
    const { port } = this.props;
    if (!port || this.state.processing) return;

    // Monitor にスクリーンショットを撮るようリクエスト
    const request = {
      query: 'capture',
      id: getUniqueId(),
      type: 'image/jpeg'
    };
    const task = async event => {
      if (event.data && event.data.id === request.id) {
        port.removeEventListener('message', task);
        this.setState({ processing: false });
      }
    };
    port.addEventListener('message', task);
    port.postMessage(request);
    this.setState({ processing: true });
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
    const { localization, showAll } = this.props.monitorProps;

    const actions = [
      <IconButton key="refresh" onTouchTap={() => this.props.setLocation()}>
        <NavigationRefresh
          color={this.context.muiTheme.palette.primary1Color}
        />
      </IconButton>,
      <IconButton
        key="fullscreen"
        onTouchTap={() => this.props.toggleFullScreen()}
      >
        <NavigationFullscreen />
      </IconButton>
    ];
    if (showAll) {
      actions.push(
        <IconButton
          key="screenshot"
          disabled={this.state.processing}
          onTouchTap={this.handleScreenShot}
        >
          <ImagePhotoCamera />
        </IconButton>,
        <IconMenu
          key="settings"
          iconButtonElement={<IconButton><ActionSettings /></IconButton>}
        >
          <MenuItem
            primaryText={sizeValue}
            leftIcon={<DeviceDevices />}
            menuItems={frameSizes.map(this.renderMenuItem, this)}
          />
          <MenuItem
            primaryText={localization.monitorCard.popout}
            leftIcon={<OpenInBrowser />}
            onTouchTap={() => this.props.togglePopout()}
          />
        </IconMenu>
      );
    }

    return (
      <Card
        icon={MonitorCard.icon()}
        {...this.props.cardPropsBag}
        actions={actions}
        icon={MonitorCard.icon()}
      >
        <CardMedia style={styles.flexible}>
          <div style={styles.parent}>
            <Monitor
              {...this.props.monitorProps}
              frameWidth={this.state.frameWidth}
              frameHeight={this.state.frameHeight}
            />
          </div>
        </CardMedia>
      </Card>
    );
  }
}
