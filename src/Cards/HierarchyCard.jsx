import React, { PureComponent, PropTypes } from 'react';
import Card from './CardWindow';
import { CardMedia } from 'material-ui/Card';


import Hierarchy from '../Hierarchy/';

export default class HierarchyCard extends PureComponent {

  static propTypes = {
    cardPropsBag: PropTypes.object.isRequired,
    hierarchyProps: PropTypes.object.isRequired,
  };

  render() {
    return (
      <Card initiallyExpanded {...this.props.cardPropsBag}>
        <CardMedia expandable >
          <Hierarchy {...this.props.hierarchyProps} />
        </CardMedia>
      </Card>
    );
  }
}
