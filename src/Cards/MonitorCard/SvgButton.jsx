import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

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
    // この SvgButton フェイクは Popup の中で使われることもあるため, CSS の class が使えない
    const styles = {
      root: {
        backgroundColor: 'transparent',
        border: 'none',
        outline: 'none',
        cursor: 'pointer',
        ...this.props.style
      },
      svg: {
        width: 24,
        height: 24
      }
    };

    return (
      <button style={styles.root} onClick={this.props.onClick}>
        <svg fill="white" style={styles.svg} viewBox="0 0 24 24">
          <path d={this.props.children} />
        </svg>
      </button>
    );
  }
}
