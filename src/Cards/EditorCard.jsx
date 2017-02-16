import React, { PureComponent, PropTypes } from 'react';
import Card from './CardWindow';
import { CardMedia } from 'material-ui/Card';


import EditorPane from '../EditorPane/';

export default class EditorCard extends PureComponent {

  static propTypes = {
    cardPropsBag: PropTypes.object.isRequired,
    editorProps: PropTypes.object.isRequired,
  };

  render() {
    return (
      <Card initiallyExpanded {...this.props.cardPropsBag}>
        <CardMedia expandable >
          <EditorPane {...this.props.editorProps} />
        </CardMedia>
      </Card>
    );
  }
}
