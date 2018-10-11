import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import { fade } from '@material-ui/core/styles/colorManipulator';
import EditorDragHandle from '@material-ui/icons/DragHandle';
import ActionSettings from '@material-ui/icons/Settings';
import includes from 'lodash/includes';

import Filename from './Filename';
import { PreferenceDialog } from '../../FileDialog/';
import DragTypes from '../../utils/dragTypes';

const getStyles = (props, context) => {
  const { file, selectedFile, tabbedFiles, isDragging } = props;
  const { palette, spacing, transitions } = context.muiTheme;

  const isSelected = selectedFile === file;
  const backgroundColor = includes(tabbedFiles, file)
    ? fade(palette.canvasColor, 1)
    : palette.disabledColor;

  return {
    root: {
      marginTop: 4,
      marginRight: 8,
      transition: transitions.create()
    },
    card: {
      boxSizing: 'border-box',
      height: 40,
      paddingLeft: spacing.desktopGutterLess,
      borderTopRightRadius: isSelected ? 0 : 2,
      borderBottomRightRadius: isSelected ? 0 : 2,
      backgroundColor,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      opacity: isDragging ? 0.5 : 1,
      transition: transitions.create()
    },
    dragHandle: {
      flex: '0 0 auto',
      width: spacing.iconSize,
      height: spacing.iconSize,
      marginRight: spacing.desktopGutterMini,
      cursor: 'move'
    },
    container: {
      flex: '1 1 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  };
};

class FileCard extends PureComponent {
  static propTypes = {
    file: PropTypes.object.isRequired,
    selectedFile: PropTypes.object,
    tabbedFiles: PropTypes.array.isRequired,
    handleFileSelect: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,

    connectDragSource: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  handleConfirmSettings = async event => {
    event.stopPropagation();
    const { file, openFileDialog, putFile } = this.props;

    const change = await openFileDialog(PreferenceDialog, { content: file });
    if (change) {
      putFile(file, file.set(change));
    }
  };

  handleNameChange = (event, name) => {
    const { file, putFile } = this.props;

    return putFile(file, file.rename(name));
  };

  render() {
    const {
      file,
      selectedFile,
      handleFileSelect,
      connectDragSource,
      connectDragPreview
    } = this.props;
    const { prepareStyles } = this.context.muiTheme;

    const isSelected = selectedFile === file;

    const { root, card, dragHandle, container } = getStyles(
      this.props,
      this.context
    );

    return connectDragPreview(
      <div style={root}>
        <Paper
          zDepth={isSelected ? 2 : 0}
          onClick={() => handleFileSelect(file)}
          style={card}
        >
          {connectDragSource(
            <div style={prepareStyles(dragHandle)}>
              <EditorDragHandle />
            </div>
          )}
          <div style={prepareStyles(container)}>
            <Filename file={file} onChange={this.handleNameChange} />
          </div>
          <IconButton onClick={this.handleConfirmSettings}>
            <ActionSettings />
          </IconButton>
        </Paper>
      </div>
    );
  }
}

const spec = {
  beginDrag(props) {
    return { files: [props.file] };
  }
};

const collect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging()
});

export default DragSource(DragTypes.File, spec, collect)(FileCard);
