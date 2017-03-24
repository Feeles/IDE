import React, { PureComponent, PropTypes } from 'react';
import Card from './CardWindow';
import { CardMedia } from 'material-ui/Card';
import FileFolderOpen from 'material-ui/svg-icons/file/folder-open';

import Hierarchy from '../Hierarchy/';

export default class HierarchyCard extends PureComponent {

  static propTypes = {
    cardPropsBag: PropTypes.object.isRequired,
    hierarchyProps: PropTypes.object.isRequired,
  };

  static icon() {
    return (
      <FileFolderOpen color="gray" />
    );
  }

  render() {
    return (
      <Card initiallyExpanded icon={HierarchyCard.icon()} {...this.props.cardPropsBag}>
        <CardMedia expandable >
          <Hierarchy {...this.props.hierarchyProps} />
        </CardMedia>
      </Card>
    );
  }
}
