import React, {PureComponent, PropTypes} from 'react';
import Card from './CardWindow';
import {CardMedia} from 'material-ui/Card';

import {ShotPane} from '../EditorPane/';

export default class ShotCard extends PureComponent {

  static propTypes = {
    cardPropsBag: PropTypes.object.isRequired,
    shotProps: PropTypes.object.isRequired,
    updateCard: PropTypes.func.isRequired
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
          <ShotPane {...this.props.shotProps} />
        </CardMedia>
      </Card>
    );
  }
}
