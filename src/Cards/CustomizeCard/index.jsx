import React, { PureComponent } from 'react';
import { style } from 'typestyle';
import PropTypes from 'prop-types';
import Card from '../CardWindow';
import CardHeader from '@material-ui/core/CardHeader';

import CardFloatingBar from '../CardFloatingBar';
import { SourceFile } from '../../File/';
import EditFile from '../EditFile';
import resolveOrigin from '../../utils/resolveOrigin';

const classes = {
  block: style({
    whiteSpace: 'inherit'
  })
};

export default class CustomizeCard extends PureComponent {
  static propTypes = {
    cardPropsBag: PropTypes.object.isRequired,
    localization: PropTypes.object.isRequired,
    findFile: PropTypes.func.isRequired,
    addFile: PropTypes.func.isRequired,
    globalEvent: PropTypes.object.isRequired
  };

  componentDidMount() {
    const file = this.props.findFile(name);

    if (!file) {
      this.props.addFile(
        new SourceFile({
          type: 'text/css',
          name: 'feeles/codemirror.css',
          text: ''
        })
      );
    }
  }

  renderBlock(title, href) {
    const { localization } = this.props;

    const subtitle = [
      <span key={1}>{title + ' - '}</span>,
      <a key={2} href={href} target="blank">
        {resolveOrigin(href)}
      </a>
    ];

    return (
      <CardHeader className={classes.block} title={title} subtitle={subtitle}>
        <EditFile
          filePath="feeles/codemirror.css"
          globalEvent={this.props.globalEvent}
          localization={localization}
        />
      </CardHeader>
    );
  }

  render() {
    const { localization } = this.props;

    return (
      <Card {...this.props.cardPropsBag}>
        <CardFloatingBar>
          {this.props.localization.customizeCard.title}
        </CardFloatingBar>
        {this.renderBlock(
          localization.customizeCard.style,
          'http://codemirror.net/doc/manual.html#styling'
        )}
      </Card>
    );
  }
}
