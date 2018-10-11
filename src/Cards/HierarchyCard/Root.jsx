import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { emphasize, fade } from '@material-ui/core/styles/colorManipulator';

import DirCard from './DirCard';
import getHierarchy from './getHierarchy';

const getStyles = props => {
  const { fontFamily, palette } = props.theme;

  return {
    root: {
      boxSizing: 'border-box',
      width: '100%',
      fontFamily,
      paddingBottom: 40,
      overflowX: 'hidden',
      overflowY: 'scroll',
      backgroundColor: fade(emphasize(palette.background.paper, 1), 0.07)
    }
  };
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

    const { root } = getStyles(this.props, this.context);

    return (
      <div style={root}>
        <DirCard dir={getHierarchy(files)} {...transfer} isRoot />
      </div>
    );
  }
}
