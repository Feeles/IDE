import React, {PureComponent, PropTypes} from 'react';
import Card from './CardWindow';
import {CardMedia} from 'material-ui/Card';

import {ShotPane} from '../EditorPane/';
import shallowEqual from '../utils/shallowEqual';

export default class ShotCard extends PureComponent {

  static propTypes = {
    cardPropsBag: PropTypes.object.isRequired,
    shotProps: PropTypes.object.isRequired,
    updateCard: PropTypes.func.isRequired
  };

  state = {
    file: null,
    completes: [],
  };

  // port が渡されることを前提とした実装, 今のままではあまりよくない
  // カード本体の Mount, Update にアクセスできるクラスと、ShotPane を統合すべき
  // でなければ ShotCard が show のときしか port をハンドルできない
  componentWillMount() {
    if (this.props.ShotPane && this.props.shotProps.port) {
      this.handlePort(null, this.props.shotProps.port);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.shotProps !== nextProps.shotProps) {
      this.handlePort(this.props.shotProps.port, nextProps.shotProps.port);
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

  handleMessage = (event) => {
    const {query, value} = event.data || {};
    if (!query) return;

    // feeles.openCode()
    if (query === 'code') {
      const file = this.props.shotProps.findFile(value);
      this.setState({file});
      this.props.updateCard('ShotCard', {visible: true});
    }

    // feeles.exports
    if (query === 'complete') {
      if (!shallowEqual(value, this.state.completes)) {
        this.setState({completes: value});
      }
    }
  };

  handleExpand = (expand) => {
    if (expand) {
      this.props.updateCard('MonitorCard', {visible: true});
    }
  };

  render() {
    return (
      <Card initiallyExpanded onExpandChange={this.handleExpand} {...this.props.cardPropsBag}>
        <CardMedia expandable>
          <ShotPane {...this.props.shotProps} file={this.state.file} completes={this.state.completes} />
        </CardMedia>
      </Card>
    );
  }
}
