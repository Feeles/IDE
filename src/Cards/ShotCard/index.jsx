import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Card from '../CardWindow';
import { CardMedia } from 'material-ui/Card';
import ContentReply from 'material-ui/svg-icons/content/reply';

import ShotPane from './ShotPane';
import shallowEqual from 'utils/shallowEqual';

export default class ShotCard extends PureComponent {
  static propTypes = {
    cardPropsBag: PropTypes.object.isRequired,
    updateCard: PropTypes.func.isRequired,
    files: PropTypes.array.isRequired,
    findFile: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    getConfig: PropTypes.func.isRequired,
    port: PropTypes.object
  };

  state = {
    file: null,
    completes: []
  };

  static icon() {
    return <ContentReply />;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.port !== nextProps.port) {
      this.handlePort(this.props.port, nextProps.port);
    }
  }

  handlePort = (prevPort, nextPort) => {
    if (prevPort) {
      prevPort.removeEventListener('message', this.handleMessage);
    }
    if (nextPort) {
      nextPort.addEventListener('message', this.handleMessage);
    }
  };

  handleMessage = event => {
    const { query, value } = event.data || {};
    if (!query) return;

    if (query === 'code' && value) {
      // feeles.openCode()
      const file = this.props.findFile(value);
      this.setState({ file });
      this.props.updateCard('ShotCard', { visible: true });
    } else if (query === 'code') {
      // feeles.closeCode()
      this.props.updateCard('ShotCard', { visible: false });
    }
    if (query === 'complete') {
      // feeles.exports
      if (!shallowEqual(value, this.state.completes)) {
        this.setState({ completes: value });
      }
    }
  };

  render() {
    return (
      <Card icon={ShotCard.icon()} {...this.props.cardPropsBag}>
        <ShotPane
          file={this.state.file}
          completes={this.state.completes}
          files={this.props.files}
          findFile={this.props.findFile}
          localization={this.props.localization}
          getConfig={this.props.getConfig}
          port={this.props.port}
        />
      </Card>
    );
  }
}
