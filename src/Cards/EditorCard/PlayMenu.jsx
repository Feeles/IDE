import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
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

export default class PlayMenu extends PureComponent {
  static propTypes = {
    getFiles: PropTypes.func.isRequired,
    setLocation: PropTypes.func.isRequired,
    href: PropTypes.string.isRequired,
    localization: PropTypes.object.isRequired
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
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
    const hrefStyle = {
      marginLeft: 8,
      fontSize: '.8rem',
      opacity: 0.6
    };

    return (
      <MenuItem key={entry.href} value={entry.href}>
        <span>{entry.title}</span>
        <span style={hrefStyle}>{entry.href}</span>
      </MenuItem>
    );
  };

  render() {
    const { localization } = this.props;
    const { palette, spacing } = this.context.muiTheme;

    const styles = {
      button: {
        padding: 0,
        paddingLeft: spacing.unit,
        lineHeight: 2,
        color: palette.alternateTextColor,
        backgroundColor: palette.primary1Color,
        borderRadius: 0
      },
      dropDown: {
        // marginLeft: -16,
        minWidth: 32,
        padding: 0,
        lineHeight: 2,
        color: palette.alternateTextColor,
        backgroundColor: palette.primary1Color,
        borderRadius: 0
      },
      current: {
        backgroundColor: fade(palette.primary1Color, 0.1),
        marginTop: -8,
        marginBottom: -8
      },
      currentSecondaryText: {
        marginLeft: 8,
        fontSize: '.8rem',
        opacity: 0.6
      },
      menu: {
        maxHeight: 300
      }
    };

    const current = this.state.entries.find(
      item => item.href === this.props.href
    );

    return (
      <div>
        <Button
          variant="flat"
          color="primary"
          style={styles.button}
          onClick={() => this.props.setLocation()}
        >
          <AVPlayCircleOutline />
          {localization.editorCard.play}
        </Button>
        <Button
          variant="flat"
          color="primary"
          style={styles.dropDown}
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
            style={styles.menu}
            onItemTouchTap={this.handleItemTouchTap}
          >
            {current && [
              <MenuItem key="current" value={current.href}>
                <ListItemIcon>
                  <NavigationRefresh />
                </ListItemIcon>
                <ListItemText
                  style={styles.current}
                  inset
                  primary={current.title}
                  secondary={
                    <span style={styles.currentSecondaryText}>
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
