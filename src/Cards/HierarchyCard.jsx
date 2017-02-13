import React, { PureComponent, PropTypes } from 'react';
import { Card, CardHeader, CardMedia } from 'material-ui/Card';


import {commonRoot} from './commonStyles';
import Hierarchy from '../Hierarchy/';

export default class HierarchyCard extends PureComponent {

  static propTypes = {
    localization: PropTypes.object.isRequired,
  };

  render() {

    return (
      <Card initiallyExpanded style={commonRoot}>
        <CardMedia expandable >
          <Hierarchy {...this.props} />
        </CardMedia>
      </Card>
    );
  }
}
