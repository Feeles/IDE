import React, {PureComponent, PropTypes} from 'react';
import Card from './CardWindow';
import {CardMedia} from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import NavigationRefresh from 'material-ui/svg-icons/navigation/refresh';
import OpenInBrowser from 'material-ui/svg-icons/action/open-in-browser';

import Monitor from '../Monitor/';

export default class MonitorCard extends PureComponent {

  static propTypes = {
    cardPropsBag: PropTypes.object.isRequired,
    monitorProps: PropTypes.object.isRequired,
    setLocation: PropTypes.func.isRequired,
    togglePopout: PropTypes.func.isRequired,
  };

  state = {
    frameWidth: 800,
    frameHeight: 600,
  };

  get height() {
    return (this.state.frameHeight / this.state.frameWidth) * 100 >> 0;
  }

  render() {
    const styles = {
      flexible: {
        position: 'relative',
        width: '100%',
        paddingTop: `${this.height}%`,
      },
      parent: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
      }
    };

    return (
      <Card
        initiallyExpanded
        {...this.props.cardPropsBag}
        actions={[
          <IconButton key="popout" onTouchTap={() => this.props.togglePopout()}>
            <OpenInBrowser />
          </IconButton>,
          <IconButton key="refresh" onTouchTap={() => this.props.setLocation()}>
            <NavigationRefresh />
          </IconButton>
        ]}
      >
        <CardMedia expandable style={styles.flexible}>
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
