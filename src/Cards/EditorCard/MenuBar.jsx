import React from 'react';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import Button from '@material-ui/core/Button';
import HardwareKeyboardBackspace from '@material-ui/icons/KeyboardBackspace';
import ContentSave from '@material-ui/icons/Save';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Description from '@material-ui/icons/Description';

import PlayMenu from './PlayMenu';
import CardFloatingBar from '../CardFloatingBar';

const cn = {
  blank: style({
    flex: '1 1 auto'
  }),
  fileNameButton: style({
    textTransform: 'inherit'
  })
};

export default class MenuBar extends React.Component {
  static propTypes = {
    localization: PropTypes.object.isRequired,
    getFiles: PropTypes.func.isRequired,
    href: PropTypes.string.isRequired,
    handleUndo: PropTypes.func.isRequired,
    setLocation: PropTypes.func.isRequired,
    hasChanged: PropTypes.bool.isRequired,
    hasHistory: PropTypes.bool.isRequired,
    selectTab: PropTypes.func.isRequired,
    tabs: PropTypes.array.isRequired
  };

  handleClickListItem = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleMenuItemClick = (event, index) => {
    this.props.selectTab(this.props.tabs[index]);
    this.setState({ anchorEl: null });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  state = {
    anchorEl: null
  };

  render() {
    const { anchorEl } = this.state;
    const selected = this.props.tabs.find(tab => tab.isSelected);

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
          {selected.label}
        </Button>
        <Menu
          id="file-select-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          {this.props.tabs.map((tab, index) => (
            <MenuItem
              key={tab.key}
              selected={tab.isSelected}
              onClick={event => this.handleMenuItemClick(event, index)}
            >
              <ListItemText primary={tab.label} secondary={tab.file.name} />
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
