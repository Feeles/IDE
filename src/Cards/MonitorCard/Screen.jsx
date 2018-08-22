import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { SrcDocEnabled } from './setSrcDoc';
import ErrorMessage from './ErrorMessage';
import SvgButton from './SvgButton';

const Padding = 1;
const ScaleChangeMin = 0.02;

export default class Screen extends PureComponent {
  static propTypes = {
    reboot: PropTypes.bool.isRequired,
    animation: PropTypes.bool.isRequired,
    display: PropTypes.bool.isRequired,
    frameRef: PropTypes.func.isRequired,
    handleReload: PropTypes.func,
    error: PropTypes.object,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    isFullScreen: PropTypes.bool.isRequired
  };

  static defaultProps = {
    animation: false,
    display: false,
    error: null,
    isFullScreen: false
  };

  state = {
    loading: false
  };

  componentDidUpdate(prevProps) {
    if (prevProps.reboot !== this.props.reboot) {
      if (!this.props.reboot) {
        this.setState({ loading: true }, () => {
          setTimeout(() => {
            this.setState({ loading: false });
          }, 250);
        });
      }
    }
    if (this.iframe) {
      this.iframe.width = `${this.props.width}px`;
      this.iframe.height = `${this.props.height}px`;
    }
  }

  _scale = 0;
  handleUpdate = () => {
    const { width, height } = this.props;

    if (
      this.iframe &&
      this.iframe.parentNode &&
      this.iframe.parentNode.parentNode
    ) {
      const rect = this.iframe.parentNode.getBoundingClientRect();
      const containerWidth = Math.max(0, rect.width - Padding);
      const containerHeight = Math.max(0, rect.height - Padding);

      const scale =
        containerHeight / containerWidth > height / width
          ? containerWidth / width
          : containerHeight / height;

      if (Math.abs(this._scale - scale) >= ScaleChangeMin) {
        this.iframe.style.transform = `scale(${scale})`;
        this._scale = scale;
      }
    }
    if (this.iframe) {
      requestAnimationFrame(this.handleUpdate);
    }
  };

  handleFrame = ref => {
    this.iframe = ref;
    this.props.frameRef(ref);

    this._scale = 0;
    if (this.iframe) {
      requestAnimationFrame(this.handleUpdate);
    }
  };

  render() {
    const { display, isFullScreen } = this.props;
    const { loading } = this.state;

    const style = {
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      background: 'linear-gradient(rgba(0,0,0,0.8), rgba(128,128,128,0.8))',
      display: display ? 'block' : 'none',
      paddingTop: isFullScreen ? 64 : 0, // フルスクリーン中、余白がなくならないように
      boxSizing: 'border-box',
      overflow: 'hidden',
      zIndex: 10
    };

    const parentStyle = {
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    };

    const frameStyle = {
      border: '0 none',
      flex: '0 0 auto',
      opacity: loading ? 0 : 1,
      transition: loading
        ? 'none'
        : 'opacity 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'
    };

    const buttonStyle = {
      position: 'absolute',
      left: 0,
      top: 0,
      zIndex: 1
    };

    const sandbox = SrcDocEnabled
      ? 'allow-scripts allow-modals allow-popups'
      : 'allow-scripts allow-modals allow-popups allow-same-origin';

    return (
      <div style={style}>
        <ErrorMessage error={this.props.error} />
        {this.props.handleReload ? (
          <SvgButton style={buttonStyle} onClick={this.props.handleReload}>
            {
              'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'
            }
          </SvgButton>
        ) : null}
        <div style={parentStyle}>
          {this.props.reboot ? null : (
            <iframe
              sandbox={sandbox}
              style={frameStyle}
              ref={this.handleFrame}
              width={this.props.width}
              height={this.props.height}
            />
          )}
        </div>
      </div>
    );
  }
}
