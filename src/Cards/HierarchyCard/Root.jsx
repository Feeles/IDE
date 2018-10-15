import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import { emphasize, fade } from '@material-ui/core/styles/colorManipulator';

import DirCard from './DirCard';
import getHierarchy from './getHierarchy';

const cn = {
  root: style({
    boxSizing: 'border-box',
    width: '100%',
    paddingBottom: 40,
    overflowX: 'hidden',
    overflowY: 'scroll'
  })
};

@withTheme()
export default class Root extends PureComponent {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired,
    selectedFile: PropTypes.object,
    tabbedFiles: PropTypes.array.isRequired,
    isDirOpened: PropTypes.func.isRequired,
    handleFileSelect: PropTypes.func.isRequired,
    handleDirToggle: PropTypes.func.isRequired,
    handleFileMove: PropTypes.func.isRequired,
    handleNativeDrop: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired
  };

  render() {
    const { files } = this.props;
    const { fontFamily, palette } = this.props.theme;

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

    return (
      <div
        className={cn.root}
        style={{
          fontFamily,
          backgroundColor: fade(emphasize(palette.background.paper, 1), 0.07)
        }}
      >
        <DirCard dir={getHierarchy(files)} {...transfer} isRoot />
      </div>
    );
  }
}
