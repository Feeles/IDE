import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Card from '../CardWindow';
import FileFolderOpen from 'material-ui/svg-icons/file/folder-open';

import Hierarchy from './Hierarchy';

export default class HierarchyCard extends PureComponent {
  static propTypes = {
    cardPropsBag: PropTypes.object.isRequired,
    hierarchyProps: PropTypes.object.isRequired
  };

  static icon() {
    return <FileFolderOpen />;
  }

  render() {
    return (
      <Card icon={HierarchyCard.icon()} {...this.props.cardPropsBag} fit>
        <Hierarchy {...this.props.hierarchyProps} />
      </Card>
    );
  }
}
