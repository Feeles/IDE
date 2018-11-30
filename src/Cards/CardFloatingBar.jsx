import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import withTheme from '@material-ui/core/styles/withTheme';

const getCn = props => ({
  root: style({
    display: 'flex',
    alignItems: 'stretch',
    padding: props.theme.spacing.unit,
    width: '100%',
    boxSizing: 'border-box',
    zIndex: 1000,
    position: ['-webkit-sticky', 'sticky'],
    top: 0,
    backgroundColor: props.theme.palette.background.paper
  })
});

@withTheme()
export default class CardFloatingBar extends PureComponent {
  static propTypes = {
    children: PropTypes.node
  };

  render() {
    const dcn = getCn(this.props);
    return <div className={dcn.root}>{this.props.children}</div>;
  }
}
