import React, { PureComponent, PropTypes } from 'react';
import { Card, CardMedia } from 'material-ui/Card';


import {commonRoot} from './commonStyles';
import EditorPane from '../EditorPane/';

export default class EditorCard extends PureComponent {

  static propTypes = {

  };

  render() {

    return (
      <Card initiallyExpanded style={commonRoot}>
        <CardMedia>
          <EditorPane {...this.props} />
        </CardMedia>
      </Card>
    );
  }
}
