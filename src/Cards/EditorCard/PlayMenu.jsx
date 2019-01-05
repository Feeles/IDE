import React, { PureComponent } from 'react'
import { withTheme } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { style } from 'typestyle'
import Button from '@material-ui/core/Button'
import Popover from '@material-ui/core/Popover'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Divider from '@material-ui/core/Divider'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import AVPlayCircleOutline from '@material-ui/icons/PlayCircleOutline'
import NavigationRefresh from '@material-ui/icons/Refresh'
import NavigationArrowDropDown from '@material-ui/icons/ArrowDropDown'
import { fade } from '@material-ui/core/styles/colorManipulator'

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
}
const getCn = props => ({
  dropDown: style({
    marginLeft: props.theme.spacing.unit,
    minWidth: 0,
    paddingLeft: 0,
    paddingRight: 0
  }),
  current: style({
    marginTop: -8,
    marginBottom: -8,
    backgroundColor: fade(props.theme.palette.primary.main, 0.1)
  })
})

@withTheme()
export default class PlayMenu extends PureComponent {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    getFiles: PropTypes.func.isRequired,
    runApp: PropTypes.func.isRequired,
    href: PropTypes.string.isRequired,
    localization: PropTypes.object.isRequired,
    hasChanged: PropTypes.bool.isRequired
  }

  state = {
    open: false,
    anchorEl: null,
    // [...{ title, href(name) }]
    entries: [],
    hasMultiEntry: false
  }

  componentDidMount() {
    this.handleUpdate()
  }

  componentDidUpdate() {
    this.handleUpdate()
  }

  handleUpdate() {
    const files = this.props.getFiles().filter(file => file.is('html'))
    this.setState({
      hasMultiEntry: files.length > 1
    })
  }

  handlePlay = event => {
    const files = this.props.getFiles().filter(file => file.is('html'))
    const parser = new DOMParser()
    const entries = files
      .map(file => {
        const doc = parser.parseFromString(file.text, 'text/html')
        const titleNode = doc.querySelector('title')
        const title = titleNode && titleNode.textContent
        return {
          title: title || file.name,
          href: file.name
        }
      })
      .sort((a, b) => (a.title > b.title ? 1 : -1))

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
      entries
    })
  }

  handleItemTouchTap = (event, menuItem) => {
    this.props.runApp(menuItem.props.value)
    this.setState({
      open: false
    })
  }

  handleRequestClose = () => {
    this.setState({
      open: false
    })
  }

  renderMenu = entry => {
    return (
      <MenuItem key={entry.href} value={entry.href}>
        <span>{entry.title}</span>
        <span style={cn.href}>{entry.href}</span>
      </MenuItem>
    )
  }

  render() {
    const dcn = getCn(this.props)
    const { localization } = this.props

    const current = this.state.entries.find(
      item => item.href === this.props.href
    )

    return (
      <>
        <Button
          variant="contained"
          color={this.props.hasChanged ? 'primary' : 'default'}
          onClick={() => this.props.runApp()}
        >
          <AVPlayCircleOutline />
          {localization.editorCard.play}
        </Button>
        {this.state.hasMultiEntry ? (
          <Button
            variant="text"
            color="primary"
            className={dcn.dropDown}
            onClick={this.handlePlay}
          >
            <NavigationArrowDropDown />
          </Button>
        ) : null}
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
      </>
    )
  }
}
