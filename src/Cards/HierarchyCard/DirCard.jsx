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
  })
};
const getCn = props => ({
  dir: style({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'space-around',
    boxSizing: 'border-box',
    marginTop: 4,
    marginRight: 8,
    borderWidth: 4,
    borderRadius: 2,
    height: props.isDirOpened(props.dir, 'auto', 40),
    paddingBottom: props.isDirOpened(
      props.dir,
      props.theme.spacing.unit * 2,
      0
    ),
    paddingLeft: props.isDirOpened(props.dir, props.theme.spacing.unit * 2, 0),
    borderStyle:
      props.isOver && !includes(props.dir.files, props.dragSource)
        ? 'dashed'
        : 'solid',
    borderColor: props.theme.palette.primary.main,
    transition: props.theme.transitions.create([
      'margin',
      'padding-bottom',
      'border'
    ])
  }),
  closed: style({
    cursor: 'pointer',
    color: props.theme.palette.text.secondary,
    paddingLeft: props.theme.spacing.unit * 2
  }),
  closer: style({
    cursor: 'pointer',
    marginLeft: -props.theme.spacing.unit * 2,
    backgroundColor: props.theme.palette.primary.main
  }),
  closerLabel: style({
    fontWeight: 'bold',
    paddingLeft: props.theme.spacing.unit * 2,
    color: props.theme.palette.primary.contrastText
  })
});

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
    const dcn = getCn(this.props);
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

    return connectDropTarget(
      <div className={isRoot ? cn.root : dcn.dir}>
        {isDirOpened(
          cd,
          [].concat(
            isRoot ? null : (
              <DirCloser
                key="closer"
                classes={dcn}
                onClick={() => handleDirToggle(cd)}
              />
            ),
            cd.dirs.map(dir => (
              <DirCard key={dir.path} dir={dir} {...transfer} />
            )),
            cd.files.map(file => (
              <FileCard key={file.key} file={file} {...transfer} />
            ))
          ),
          <div className={dcn.closed} onClick={() => handleDirToggle(cd)}>
            {cd.path}
          </div>
        )}
      </div>
    );
  }
}

export const DirCloser = withTheme()(props => {
  return (
    <div className={props.classes.closer} onClick={props.onClick}>
      <span className={props.classes.closerLabel}>../</span>
    </div>
  );
});

DirCloser.propTypes = {
  classes: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired
};
