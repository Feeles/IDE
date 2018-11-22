import React from 'react';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import Button from '@material-ui/core/Button';
import HardwareKeyboardBackspace from '@material-ui/icons/KeyboardBackspace';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Description from '@material-ui/icons/Description';
import Layers from '@material-ui/icons/Layers';
import LayersClear from '@material-ui/icons/LayersClear';
import Typography from '@material-ui/core/Typography';

import PlayMenu from './PlayMenu';
import CardFloatingBar from '../CardFloatingBar';
import { IconButton, withTheme } from '@material-ui/core';

const cn = {
  blank: style({
    flex: '1 1 auto'
  }),
  fileNameButton: style({
    textTransform: 'inherit'
  }),
  menuItem: style({
    paddingTop: 4,
    paddingBottom: 4
  })
};

const getCn = props => ({
  icon: style({
    color: props.theme.typography.button.color
  })
});

@withTheme()
export default class MenuBar extends React.Component {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    localization: PropTypes.object.isRequired,
    getFiles: PropTypes.func.isRequired,
    href: PropTypes.string.isRequired,
    handleUndo: PropTypes.func.isRequired,
    setLocation: PropTypes.func.isRequired,
    hasChanged: PropTypes.bool.isRequired,
    hasHistory: PropTypes.bool.isRequired,
    tabs: PropTypes.array.isRequired,
    filePath: PropTypes.string.isRequired,
    showLineWidget: PropTypes.bool.isRequired,
    setShowLineWidget: PropTypes.func.isRequired,
    globalEvent: PropTypes.object.isRequired
  };

  handleClickListItem = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleMenuItemClick = filePath => {
    this.props.globalEvent.emit('message.editor', {
      data: { value: filePath }
    });
    this.setState({ anchorEl: null });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  toggleLineWidget = () => {
    const { showLineWidget } = this.props;
    this.props.setShowLineWidget(!showLineWidget);
  };

  state = {
    anchorEl: null
  };

  render() {
    const { anchorEl } = this.state;
    const dcn = getCn(this.props);

    // 現在選択中のタブの情報を filePath (ファイル名) から調べる. tabs の中にはない(nullになる)こともある
    const selected = this.props.tabs.find(
      tab => tab.filePath === this.props.filePath
    );

    return (
      <CardFloatingBar>
        {this.props.localization.editorCard.title}
        <Button
          variant="text"
          disabled={!this.props.hasHistory}
          onClick={this.props.handleUndo}
        >
          <HardwareKeyboardBackspace />
          {this.props.localization.editorCard.undo}
        </Button>
        <Button
          variant="text"
          className={cn.fileNameButton}
          onClick={this.handleClickListItem}
        >
          <Description />
          {selected ? selected.label : this.props.filePath}
        </Button>
        <IconButton onClick={this.toggleLineWidget}>
          {this.props.showLineWidget ? (
            <Layers className={dcn.icon} />
          ) : (
            <LayersClear />
          )}
        </IconButton>
        <Menu
          id="file-select-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          {this.props.tabs.map((tab, index) => (
            <MenuItem
              key={index}
              selected={tab.filePath === this.props.filePath}
              className={cn.menuItem}
              onClick={() => this.handleMenuItemClick(tab.filePath)}
            >
              <Description />
              <Typography variant="body2">{tab.label}</Typography>
            </MenuItem>
          ))}
        </Menu>
        <div className={cn.blank} />
        <PlayMenu
          getFiles={this.props.getFiles}
          setLocation={this.props.setLocation}
          href={this.props.href}
          localization={this.props.localization}
          hasChanged={this.props.hasChanged}
        />
      </CardFloatingBar>
    );
  }
}
