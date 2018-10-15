import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import { DropTarget } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import includes from 'lodash/includes';

import FileCard from './FileCard';
import DragTypes from '../../utils/dragTypes';

const cn = {
  root: style({
    borderWidth: 0,
    paddingTop: 16,
    paddingRight: 0,
    paddingBottom: 80,
    paddingLeft: 16
  }),
  dir: style({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'space-around',
    boxSizing: 'border-box',
    marginTop: 4,
    marginRight: 8,
    borderWidth: 4,
    borderRadius: 2
  }),
  closed: style({
    cursor: 'pointer'
  }),
  closer: style({
    cursor: 'pointer'
  }),
  closerLabel: style({
    fontWeight: 'bold'
  })
};

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

@DropTarget([DragTypes.File, NativeTypes.FILE], spec, collect)
@withTheme()
export default class DirCard extends PureComponent {
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
      isOver,
      dragSource,

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
      putFile: this.props.putFile,

      theme: this.props.theme,
      connectDropTarget: connectDropTarget,
      isOver: isOver,
      dragSource: dragSource
    };

    const { palette, spacing, transitions } = this.props.theme;

    const borderStyle =
      isOver && !includes(cd.files, dragSource) ? 'dashed' : 'solid';

    return connectDropTarget(
      <div
        className={isRoot ? cn.root : cn.dir}
        style={{
          height: isDirOpened(cd, 'auto', 40),
          paddingBottom: isDirOpened(cd, spacing.unit * 2, 0),
          paddingLeft: isDirOpened(cd, spacing.unit * 2, 0),
          borderStyle,
          borderColor: palette.primary.main,
          transition: transitions.create(['margin', 'padding-bottom', 'border'])
        }}
      >
        {isDirOpened(
          cd,
          [].concat(
            isRoot ? null : (
              <DirCloser key="closer" onClick={() => handleDirToggle(cd)} />
            ),
            cd.dirs.map(dir => (
              <DirCard key={dir.path} dir={dir} {...transfer} />
            )),
            cd.files.map(file => (
              <FileCard key={file.key} file={file} {...transfer} />
            ))
          ),
          <div
            className={cn.closed}
            style={{
              color: palette.text.secondary,
              paddingLeft: spacing.unit * 2
            }}
            onClick={() => handleDirToggle(cd)}
          >
            {cd.path}
          </div>
        )}
      </div>
    );
  }
}

export const DirCloser = withTheme()(props => {
  return (
    <div
      className={cn.closer}
      style={{
        marginLeft: -props.theme.spacing.unit * 2,
        backgroundColor: props.theme.palette.primary.main
      }}
      onClick={props.onClick}
    >
      <span
        className={cn.closerLabel}
        style={{
          paddingLeft: props.theme.spacing.unit * 2,
          color: props.theme.palette.primary.contrastText
        }}
      >
        ../
      </span>
    </div>
  );
});

DirCloser.propTypes = {
  onClick: PropTypes.func.isRequired
};
