import React, { Component, PropTypes } from 'react';
import Postmate from '../js/LoosePostmate';

Postmate.debug = process.env.NODE_ENV !== 'production';


import template from '../html/screen';
import screenJs from '../js/screen';

export default class Screen extends Component {

  static propTypes = {
    player: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired,
    style: PropTypes.any
  };

  state = {
    width: 300,
    height: 150,
    frame: null
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.style !== nextProps.style) {
      this.handleResize();
    }
  }

  prevent = null;
  start = () => {
    const { player, config, files } = this.props;
    const model = Object.assign({}, config, { files });

    const title = 'h4p';
    const html = template({ title, screenJs });
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));

    this.prevent =
      (this.prevent || Promise.resolve())
      .then(() => {
        player.emit('screen.beforeunload'); // call beforeunload

        return new Postmate({
          container: this.container,
          url,
          model
        });
      })
      .then(child => {
        this.setState({ frame: child.frame });

        const resized = (view) => player.emit('screen.resize', view);
        child.on('load', () => child.get('size').then(resized));
        child.on('resize', resized);
        player.once('screen.beforeunload', () => child.destroy());

        player.emit('screen.load', { child });
      })
      .catch((err) => err);
  };

  componentDidMount() {
    this.props.player.on('screen.resize', this.handleScreenSizeChange);
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    this.props.player.off('screen.resize', this.handleScreenSizeChange);
    window.removeEventListener('resize', this.handleResize);
  }

  handleScreenSizeChange = ({ width, height }) => {
    this.setState({ width, height });
    this.handleResize();
  };

  handleResize = () => {
    const { frame, width, height } = this.state;
    if (!frame) return;
    const screenRect = this.container.getBoundingClientRect();

    frame.width = width;
    frame.height = height;

    const translate = {
      x: (screenRect.width - width) / 2,
      y: (screenRect.height - height) / 2
    };
    const ratio = (size) => Math.max(size.height, 1) / Math.max(size.width, 1);
    const scale = ratio(screenRect) > ratio({ width, height }) ?
      screenRect.width / width : screenRect.height / height;

    frame.style.transform = `translate(${translate.x}px, ${translate.y}px) scale(${scale})`;
  };


  render() {
    return (
      <div
        ref={(container) => this.container = container}
        style={this.props.style}
        className={CSS_PREFIX + 'screen'}
      />
    );
  }
}
