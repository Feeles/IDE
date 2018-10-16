import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
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

const cn = {
  container: style({
    flex: '1 1 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  })
};
const getCn = props => ({
  root: style({
    marginTop: 4,
    marginRight: 8,
    transition: props.theme.transitions.create()
  }),
  card: style({
    boxSizing: 'border-box',
    height: 40,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: props.theme.spacing.unit * 2,
    borderTopRightRadius: props.isSelected ? 0 : 2,
    borderBottomRightRadius: props.isSelected ? 0 : 2,
    backgroundColor: includes(props.tabbedFiles, props.file)
      ? fade(props.theme.palette.background.paper, 1)
      : props.theme.palette.disabledColor,
    opacity: props.isDragging ? 0.5 : 1,
    transition: props.theme.transitions.create()
  }),
  dragHandle: style({
    flex: '0 0 auto',
    cursor: 'move',
    width: props.theme.spacing.unit * 3,
    height: props.theme.spacing.unit * 3,
    marginRight: props.theme.spacing.unit
  })
});

@withTheme()
class FileCard extends PureComponent {
  static propTypes = {
    theme: PropTypes.object.isRequired,
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
    const dcn = getCn(this.props);
    const {
      file,
      selectedFile,
      handleFileSelect,
      connectDragSource,
      connectDragPreview
    } = this.props;

    const isSelected = selectedFile === file;

    return connectDragPreview(
      <div className={dcn.root}>
        <Paper
          elevation={isSelected ? 2 : 0}
          onClick={() => handleFileSelect(file)}
          className={dcn.card}
        >
          {connectDragSource(
            <div className={dcn.dragHandle}>
              <EditorDragHandle />
            </div>
          )}
          <div className={cn.container}>
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
