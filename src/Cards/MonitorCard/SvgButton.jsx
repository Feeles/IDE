import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { style } from 'typestyle';

const cn = {
  root: style({
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    cursor: 'pointer'
  })
};

export default class SvgButton extends PureComponent {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    style: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired
  };

  static defaultProps = {
    style: {}
  };

  render() {
    const svgStyle = {
      width: 24,
      height: 24
    };

    return (
      <button
        style={this.props.style}
        className={cn.root}
        onClick={this.props.onClick}
      >
        <svg fill="white" style={svgStyle} viewBox="0 0 24 24">
          <path d={this.props.children} />
        </svg>
      </button>
    );
  }
}
