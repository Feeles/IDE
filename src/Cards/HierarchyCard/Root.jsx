import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import { emphasize, fade } from '@material-ui/core/styles/colorManipulator';

import DirCard from './DirCard';
import getHierarchy from './getHierarchy';

const getCn = props => ({
  root: style({
    boxSizing: 'border-box',
    width: '100%',
    paddingBottom: 40,
    overflowX: 'hidden',
    overflowY: 'scroll',
    fontFamily: props.theme.fontFamily,
    backgroundColor: fade(
      emphasize(props.theme.palette.background.paper, 1),
      0.07
    )
  })
});

@withTheme()
export default class Root extends PureComponent {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired,
    isDirOpened: PropTypes.func.isRequired,
    handleFileSelect: PropTypes.func.isRequired,
    handleDirToggle: PropTypes.func.isRequired,
    handleFileMove: PropTypes.func.isRequired,
    handleNativeDrop: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired
  };

  render() {
    const dcn = getCn(this.props);
    const { files } = this.props;

    const transfer = {
      isDirOpened: this.props.isDirOpened,
      handleFileSelect: this.props.handleFileSelect,
      handleDirToggle: this.props.handleDirToggle,
      handleFileMove: this.props.handleFileMove,
      handleNativeDrop: this.props.handleNativeDrop,
      openFileDialog: this.props.openFileDialog,
      putFile: this.props.putFile
    };

    return (
      <div className={dcn.root}>
        <DirCard dir={getHierarchy(files)} {...transfer} isRoot />
      </div>
    );
  }
}
