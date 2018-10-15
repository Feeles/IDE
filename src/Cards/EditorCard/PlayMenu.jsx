import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AVPlayCircleOutline from '@material-ui/icons/PlayCircleOutline';
import NavigationRefresh from '@material-ui/icons/Refresh';
import NavigationArrowDropDown from '@material-ui/icons/ArrowDropDown';
import { fade } from '@material-ui/core/styles/colorManipulator';

const cn = {
  currentSecondaryText: style({
    marginLeft: 8,
    fontSize: '.8rem',
    opacity: 0.6
  }),
  menu: style({
    maxHeight: 300
  }),
  href: style({
    marginLeft: 8,
    fontSize: '.8rem',
    opacity: 0.6
  })
};
const getCn = props => ({
  button: style({
    borderRadius: 0,
    boxShadow: 'none',
    padding: 0,
    lineHeight: 2,
    paddingLeft: props.theme.spacing.unit,
    color: props.theme.palette.primary.contrastText,
    backgroundColor: props.theme.palette.primary.main
  }),
  dropDown: style({
    // marginLeft: -16,

    minWidth: 32,
    padding: 0,
    lineHeight: 2,
    borderRadius: 0,
    boxShadow: 'none',
    color: props.theme.palette.primary.contrastText,
    backgroundColor: props.theme.palette.primary.main
  }),
  current: style({
    marginTop: -8,
    marginBottom: -8,
    backgroundColor: fade(props.theme.palette.primary.main, 0.1)
  })
});

@withTheme()
export default class PlayMenu extends PureComponent {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    getFiles: PropTypes.func.isRequired,
    setLocation: PropTypes.func.isRequired,
    href: PropTypes.string.isRequired,
    localization: PropTypes.object.isRequired
  };

  state = {
    open: false,
    anchorEl: null,
    // [...{ title, href(name) }]
    entries: []
  };

  handlePlay = event => {
    const files = this.props.getFiles().filter(file => file.is('html'));

    if (files.length <= 1) {
      // 表示すべきリストがない
      this.props.setLocation();
      return;
    }

    const parser = new DOMParser();
    const entries = files
      .map(file => {
        const doc = parser.parseFromString(file.text, 'text/html');
        const titleNode = doc.querySelector('title');
        const title = titleNode && titleNode.textContent;
        return {
          title: title || file.name,
          href: file.name
        };
      })
      .sort((a, b) => (a.title > b.title ? 1 : -1));

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
      entries
    });
  };

  handleItemTouchTap = (event, menuItem) => {
    this.props.setLocation(menuItem.props.value);
    this.setState({
      open: false
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false
    });
  };

  renderMenu = entry => {
    return (
      <MenuItem key={entry.href} value={entry.href}>
        <span>{entry.title}</span>
        <span style={cn.href}>{entry.href}</span>
      </MenuItem>
    );
  };

  render() {
    const dcn = getCn(this.props);
    const { localization } = this.props;

    const current = this.state.entries.find(
      item => item.href === this.props.href
    );

    return (
      <div>
        <Button
          variant="contained"
          color="primary"
          className={dcn.button}
          onClick={() => this.props.setLocation()}
        >
          <AVPlayCircleOutline />
          {localization.editorCard.play}
        </Button>
        <Button
          variant="contained"
          color="primary"
          className={dcn.dropDown}
          onClick={this.handlePlay}
        >
          <NavigationArrowDropDown />
        </Button>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'right', vertical: 'top' }}
          onClose={this.handleRequestClose}
        >
          <Menu
            value={this.state.href}
            className={cn.menu}
            onItemTouchTap={this.handleItemTouchTap}
          >
            {current && [
              <MenuItem key="current" value={current.href}>
                <ListItemIcon>
                  <NavigationRefresh />
                </ListItemIcon>
                <ListItemText
                  className={dcn.current}
                  inset
                  primary={current.title}
                  secondary={
                    <span className={cn.currentSecondaryText}>
                      Ctrl + Space
                    </span>
                  }
                />
                {current.title}
              </MenuItem>,
              <Divider key="divider" />
            ]}
            {this.state.entries.map(this.renderMenu)}
          </Menu>
        </Popover>
      </div>
    );
  }
}
