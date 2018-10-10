import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export default class SvgButton extends PureComponent {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    style: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired
  };

  static defaultProps = {
    style: {}
  };

  render() {
    const svgStyle = {
      width: 24,
      height: 24
    };

    const style = {
      backgroundColor: 'transparent',
      border: 'none',
      outline: 'none',
      cursor: 'pointer',
      ...this.props.style
    };

    return (
      <button style={style} onClick={this.props.onClick}>
        <svg fill="white" style={svgStyle} viewBox="0 0 24 24">
          <path d={this.props.children} />
        </svg>
      </button>
    );
  }
}
