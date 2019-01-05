import React, { PureComponent } from 'react'
import { withTheme } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { style, classes } from 'typestyle'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import MuiMenu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import ActionLanguage from '@material-ui/icons/Language'
import NavigationMenu from '@material-ui/icons/Menu'

import { acceptedLanguages } from '../localization/'

const cn = {
  root: style({
    zIndex: null
  }),
  button: style({
    marginLeft: 20
  }),
  projectName: style({
    fontSize: '.8rem',
    fontWeight: 600
  }),
  toggle: style({
    filter: 'contrast(40%)'
  }),
  blank: style({
    flex: 1
  })
}

const getCn = props => ({
  leftIcon: style({
    marginTop: 0,
    marginLeft: -14,
    display: props.showAll ? 'block' : 'none'
  }),
  contrastColor: style({
    color: props.theme.palette.primary.contrastText
  })
})

@withTheme()
export default class Menu extends PureComponent {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    cardProps: PropTypes.object.isRequired,
    setCardVisibility: PropTypes.func.isRequired,
    toggleSidebar: PropTypes.func.isRequired,
    files: PropTypes.array.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    setLocalization: PropTypes.func.isRequired,
    project: PropTypes.object,
    showAll: PropTypes.bool.isRequired,
    toggleShowAll: PropTypes.func.isRequired,
    globalEvent: PropTypes.object.isRequired
  }

  state = {
    overrideTitle: null,
    open: false,
    anchorEl: null
  }

  get filesForPublishing() {
    // i18n 設定の固定:
    // 1. i18n/ll_CC/ 以下のファイルを取得
    const prefix = `i18n/${this.props.localization.ll_CC}/`
    const currentLocales = this.props.files.filter(file =>
      file.name.startsWith(prefix)
    )

    // 2. i18n/ 以下のファイルをすべて削除し、
    const withoutI18n = this.props.files.filter(
      file => !file.name.startsWith('i18n/')
    )

    // 3. i18n/ll_CC/ 以下のファイルをルートに追加する
    const intoRoot = currentLocales.map(file => {
      const [, name] = file.name.split(prefix)
      return file.set({ name })
    })
    return withoutI18n.concat(intoRoot)
  }

  handleSetTitle = event => {
    this.setState({ overrideTitle: event.data.value })
  }

  componentDidMount() {
    this.props.globalEvent.on('message.menuTitle', this.handleSetTitle)
  }

  handleLanguage = event => {
    this.setState({
      anchorEl: event.currentTarget
    })
  }

  handleCloseMenu = () => {
    this.setState({
      anchorEl: null
    })
  }

  render() {
    const dcn = getCn(this.props)
    const { localization, setLocalization } = this.props

    const title =
      this.props.project &&
      (this.props.project.title ? (
        <div className={classes(cn.projectName, dcn.contrastColor)}>
          {this.props.project.title}
        </div>
      ) : (
        <Button variant="text" onClick={this.handleClone}>
          <span className={dcn.contrastColor}>
            {localization.cloneDialog.setTitle}
          </span>
        </Button>
      ))
    return (
      <AppBar className={cn.root} position="relative">
        <Toolbar>
          <IconButton
            className={dcn.leftIcon}
            onClick={this.props.toggleSidebar}
          >
            <NavigationMenu />
          </IconButton>
          {this.state.overrideTitle || title}
          <div className={cn.blank} />
          <FormControlLabel
            control={
              <Switch
                checked={this.props.showAll}
                onChange={this.props.toggleShowAll}
                className={cn.toggle}
              />
            }
            label={this.props.showAll ? '' : localization.menu.showAll}
            className={dcn.contrastColor}
          />
          <IconButton
            tooltip={localization.menu.language}
            onClick={this.handleLanguage}
          >
            <ActionLanguage />
          </IconButton>
          <MuiMenu
            anchorEl={this.state.anchorEl}
            open={!!this.state.anchorEl}
            onClose={this.handleCloseMenu}
          >
            {acceptedLanguages.map(lang => (
              <MenuItem
                key={lang.accept[0]}
                onClick={() => setLocalization(lang.accept[0])}
              >
                {lang.native}
              </MenuItem>
            ))}
          </MuiMenu>
        </Toolbar>
      </AppBar>
    )
  }
}
