import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { style } from 'typestyle';

const HeaderHeight = 32;

export const cn = {
  root: style({
    flex: 0,
    display: 'flex',
    alignItems: 'center',
    minHeight: HeaderHeight,
    paddingLeft: 8,
    width: '100%',
    boxSizing: 'border-box',
    overflowX: 'auto',
    overflowY: 'hidden'
  }),
  blank: style({
    flex: 1
  })
};

export default class CardFloatingBas extends PureComponent {
  static propTypes = {
    children: PropTypes.node
  };

  static defaultProps = {};

  render() {
    return <div className={cn.root}>{this.props.children}</div>;
  }
}
