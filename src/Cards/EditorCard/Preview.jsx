import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';

import PropTypes from 'prop-types';

const getStyles = (props, context, state) => {
  const { scale } = state;

  return {
    root: {
      position: 'absolute',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      overflow: 'hidden',
      background: `linear-gradient(white, black)`,
      width: '100%',
      height: '100%'
    },
    img: {
      transform: `scale(${scale})`
    }
  };
};
@withTheme()
export default class Preview extends PureComponent {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    file: PropTypes.object.isRequired,
    localization: PropTypes.object.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,
    getFiles: PropTypes.func.isRequired
  };

  state = {
    scale: 1
  };

  componentDidMount() {
    const { file } = this.props;
    if (file.is('image')) {
      const image = new Image();
      image.onload = () => {
        const ratio = size =>
          Math.max(size.height, 1) / Math.max(size.width, 1);
        const screenRect = this.container.getBoundingClientRect();
        const scale =
          ratio(screenRect) > ratio(image)
            ? screenRect.width / image.width
            : screenRect.height / image.height;
        this.setState({ scale: scale * 0.9 });
      };
      image.src = file.blobURL;
    }
  }

  render() {
    const { file } = this.props;

    const { root, img } = getStyles(this.props, this.context, this.state);

    const content = file.is('image') ? (
      <img src={file.blobURL} alt={file.name} style={img} />
    ) : file.is('audio') ? (
      <audio src={file.blobURL} controls />
    ) : null;

    return (
      <div style={root} ref={ref => ref && (this.container = ref)}>
        {content}
      </div>
    );
  }
}
