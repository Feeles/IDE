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

  render() {
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
        <CardMedia expandable>
          <Monitor {...this.props.monitorProps}/>
        </CardMedia>
      </Card>
    );
  }
}
