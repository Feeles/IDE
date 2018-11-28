import React from 'react';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import MenuItem from '@material-ui/core/MenuItem';
import Description from '@material-ui/icons/Description';
import Typography from '@material-ui/core/Typography';
import ArrowRight from '@material-ui/icons/ArrowRight';

import { Tab } from './';

const cn = {
  blank: style({
    flex: '1 1 auto'
  }),
  fileNameButton: style({
    width: 200
  }),
  menuSize: {
    paper: style({
      width: 200
    })
  },
  menuItem: style({
    paddingTop: 4,
    paddingBottom: 4
  }),
  icon: style({
    width: 24,
    height: 24,
    marginRight: 4
  })
};

const Icon = props =>
  props.iconUrl ? (
    <img src={props.iconUrl} alt="" className={cn.icon} />
  ) : (
    <Description />
  );
Icon.propTypes = {
  iconUrl: PropTypes.string
};

export default class SelectTab extends React.Component {
  static propTypes = {
    localization: PropTypes.object.isRequired,
    tabs: PropTypes.array.isRequired,
    filePath: PropTypes.string.isRequired,
    globalEvent: PropTypes.object.isRequired
  };

  state = {
    anchorEl: null
  };

  componentDidUpdate(prevProps) {
    if (prevProps.filePath !== this.props.filePath) {
      // ファイルが選択されたので Popout は閉じる
      this.handleClose();
    }
  }

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const { anchorEl } = this.state;

    // 現在選択中のタブの情報を filePath (ファイル名) から調べる. tabs の中にはない(nullになる)こともある
    const selected = Tab.find(this.props.tabs, this.props.filePath);

    return (
      <>
        <Button
          variant="text"
          className={cn.fileNameButton}
          onClick={this.handleClick}
        >
          {selected ? <Icon iconUrl={selected.iconUrl} /> : null}
          {selected ? selected.label : this.props.filePath}
          <div className={cn.blank} />
          <ArrowDropDown />
        </Button>
        <Menu
          id="file-select-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          classes={cn.menuSize}
          onClose={this.handleClose}
        >
          <NestedMenus
            tabs={this.props.tabs}
            localization={this.props.localization}
            filePath={this.props.filePath}
            globalEvent={this.props.globalEvent}
          />
        </Menu>
      </>
    );
  }
}

class NestedMenus extends React.Component {
  static propTypes = {
    tabs: PropTypes.array.isRequired,
    localization: PropTypes.object.isRequired,
    filePath: PropTypes.string.isRequired,
    globalEvent: PropTypes.object.isRequired
  };

  state = {
    anchorEl: null,
    selectedIndex: -1
  };

  handleMenuItemClick = filePath => {
    this.props.globalEvent.emit('message.editor', {
      data: { value: filePath }
    });
    this.handleClose();
  };

  handleOpen = (event, index) => {
    this.setState({
      anchorEl: event.currentTarget,
      selectedIndex: index
    });
  };

  handleClose = () => {
    this.setState({
      anchorEl: null,
      selectedIndex: -1
    });
  };

  render() {
    const { anchorEl } = this.state;

    return (
      <>
        {this.props.tabs.map((tab, index) =>
          tab.filePath ? (
            <MenuItem
              key={index}
              selected={tab.filePath === this.props.filePath}
              className={cn.menuItem}
              onClick={() => this.handleMenuItemClick(tab.filePath)}
            >
              <Icon iconUrl={tab.iconUrl} />
              <Typography variant="body2">{tab.label}</Typography>
            </MenuItem>
          ) : tab.tabs ? (
            <React.Fragment key={index}>
              <MenuItem
                selected={index === this.state.selectedIndex}
                className={cn.menuItem}
                onClick={event => this.handleOpen(event, index)}
              >
                <Icon iconUrl={tab.iconUrl} />
                <Typography variant="body2">{tab.label}</Typography>
                <div className={cn.blank} />
                <ArrowRight />
              </MenuItem>
              <Menu
                id={`file-select-menu-${tab.label}`}
                classes={cn.menuSize}
                open={index === this.state.selectedIndex}
                anchorEl={anchorEl}
                onClose={this.handleClose}
                anchorOrigin={{
                  horizontal: 'right',
                  vertical: 'top'
                }}
              >
                <NestedMenus
                  tabs={tab.tabs}
                  localization={this.props.localization}
                  filePath={this.props.filePath}
                  globalEvent={this.props.globalEvent}
                />
              </Menu>
            </React.Fragment>
          ) : null
        )}
      </>
    );
  }
}
