import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import includes from 'lodash/includes';

import FileCard from './FileCard';
import DragTypes from '../../utils/dragTypes';

const getStyles = props => {
  const { isRoot, isDirOpened, isOver, dragSource } = props;
  const cd = props.dir;
  const { palette, spacing, transitions } = props.theme;

  const borderStyle =
    isOver && !includes(cd.files, dragSource) ? 'dashed' : 'solid';
  const borderWidth = 4;

  return {
    root: isRoot
      ? {
          paddingTop: 16,
          paddingRight: 0,
          paddingBottom: 80,
          paddingLeft: 16
        }
      : {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'space-around',
          boxSizing: 'border-box',
          height: isDirOpened(cd, 'auto', 40),
          marginTop: 4,
          marginRight: 8,
          paddingBottom: isDirOpened(cd, spacing.unit * 2, 0),
          paddingLeft: isDirOpened(cd, spacing.unit * 2, 0),
          borderWidth,
          borderStyle,
          borderColor: palette.primary.main,
          borderRadius: 2,
          transition: transitions.create(['margin', 'padding-bottom', 'border'])
        },
    closed: {
      color: palette.text.secondary,
      paddingLeft: spacing.unit * 2,
      cursor: 'pointer'
    },
    closer: {
      marginLeft: -spacing.unit * 2,
      backgroundColor: palette.primary.main,
      cursor: 'pointer'
    },
    closerLabel: {
      paddingLeft: spacing.unit * 2,
      fontWeight: 'bold',
      color: palette.primary.contrastText
    }
  };
};

@withTheme()
class _DirCard extends PureComponent {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    dir: PropTypes.object.isRequired,
    selectedFile: PropTypes.object,
    tabbedFiles: PropTypes.array.isRequired,
    isDirOpened: PropTypes.func.isRequired,
    handleFileSelect: PropTypes.func.isRequired,
    handleDirToggle: PropTypes.func.isRequired,
    handleFileMove: PropTypes.func.isRequired,
    handleNativeDrop: PropTypes.func.isRequired,
    isRoot: PropTypes.bool,
    openFileDialog: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,

    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    dragSource: PropTypes.object
  };

  static defaultProps = {
    isRoot: false
  };

  render() {
    const {
      isRoot,
      isDirOpened,
      handleDirToggle,

      connectDropTarget
    } = this.props;
    const cd = this.props.dir;

    const transfer = {
      selectedFile: this.props.selectedFile,
      tabbedFiles: this.props.tabbedFiles,
      isDirOpened: this.props.isDirOpened,
      handleFileSelect: this.props.handleFileSelect,
      handleDirToggle: this.props.handleDirToggle,
      handleFileMove: this.props.handleFileMove,
      handleNativeDrop: this.props.handleNativeDrop,
      openFileDialog: this.props.openFileDialog,
      putFile: this.props.putFile
    };

    const { root, closed, closer, closerLabel } = getStyles(
      this.props,
      this.context
    );

    const closerProps = {
      style: closer,
      labelStyle: closerLabel,
      onClick: () => handleDirToggle(cd)
    };

    return connectDropTarget(
      <div style={root}>
        {isDirOpened(
          cd,
          [].concat(
            isRoot ? null : <DirCloser key="closer" {...closerProps} />,
            cd.dirs.map(dir => (
              <DirCard key={dir.path} dir={dir} {...transfer} />
            )),
            cd.files.map(file => (
              <FileCard key={file.key} file={file} {...transfer} />
            ))
          ),
          <div style={closed} onClick={() => handleDirToggle(cd)}>
            {cd.path}
          </div>
        )}
      </div>
    );
  }
}

const spec = {
  drop(props, monitor) {
    if (monitor.getDropResult()) {
      return;
    }
    const { files } = monitor.getItem();
    switch (monitor.getItemType()) {
      case DragTypes.File:
        files
          .filter(file => !includes(props.dir.files, file))
          .forEach(file => props.handleFileMove(file, props.dir));
        break;
      case NativeTypes.FILE:
        props.handleNativeDrop(files, props.dir);
        break;
    }
    return {};
  }
};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver({ shallow: true }),
  dragSource: monitor.getItem()
});

const DirCard = DropTarget([DragTypes.File, NativeTypes.FILE], spec, collect)(
  _DirCard
);
export default DirCard;

export const DirCloser = props => {
  return (
    <div style={props.style} onClick={props.onClick}>
      <span style={props.labelStyle}>../</span>
    </div>
  );
};

DirCloser.propTypes = {
  style: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  labelStyle: PropTypes.object.isRequired
};
