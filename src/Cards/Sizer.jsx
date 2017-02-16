import React, { PureComponent, PropTypes } from 'react';
import { DragSource } from 'react-dnd';
import Paper from 'material-ui/Paper';
import transitions from 'material-ui/styles/transitions';


import DragTypes from '../utils/dragTypes';

export const SizerWidth = 24;

const getStyles = (props, context) => {

  const {
    palette,
    paper,
  } = context.muiTheme;

  return {
    root: {
      flex: '0 0 auto',
      width: SizerWidth,
      marginTop: -12,
      marginBottom: 32,
      display: 'flex',
      cursor: 'col-resize',
      zIndex: 1101,
    },
    preview: {
      flex: '1 1 auto',
      backgroundColor: palette.accent1Color,
      borderRadius: SizerWidth / 2,
      boxShadow: paper.zDepthShadows[1],
    },
  };

};

class Sizer extends PureComponent {

  static propTypes = {
    width: PropTypes.number.isRequired,
    onSizer: PropTypes.func.isRequired,

    connectDragSource: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    isActive: false,
  };

  componentWillReceiveProps(nextProps) {
    const { isDragging, onSizer } = this.props;

    if (!isDragging && nextProps.isDragging) {
      onSizer(true);
    } else if (isDragging && !nextProps.isDragging) {
      onSizer(false);
    }
  }

  render() {
    const {
      connectDragSource,
      connectDragPreview,
    } = this.props;

    const {
      root,
      preview,
    } = getStyles(this.props, this.context);

    return connectDragSource(
      <div style={root}>
      {connectDragPreview(
        <div style={preview} />
      )}
      </div>
    );
  }
}

const spec = {
  beginDrag(props) {
    return {
      width: props.width
    };
  },
};

const collect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging()
});

export default DragSource(DragTypes.Sizer, spec, collect)(Sizer);
