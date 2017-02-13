import React, { PureComponent, PropTypes } from 'react';
import { Card, CardHeader, CardMedia } from 'material-ui/Card';


import {commonRoot} from './commonStyles';
import EditorPane from '../EditorPane/';

export default class EditorCard extends PureComponent {

  static propTypes = {
    localization: PropTypes.object.isRequired,
  };

  render() {

    return (
      <Card initiallyExpanded style={commonRoot}>
        <CardHeader actAsExpander showExpandableButton
          title={this.props.localization.editorCard.title}
        />
        <CardMedia expandable >
          <EditorPane {...this.props} />
        </CardMedia>
      </Card>
    );
  }
}
