import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import Drawer from 'material-ui/Drawer';
import Toggle from 'material-ui/Toggle';
import FileDownload from 'material-ui/svg-icons/file/file-download';
import ActionLanguage from 'material-ui/svg-icons/action/language';
import ActionHistory from 'material-ui/svg-icons/action/history';
import NavigationArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import NavigationMenu from 'material-ui/svg-icons/navigation/menu';

import icons from './icons';
import { acceptedLanguages } from '../localization/';
import CloneDialog from './CloneDialog';

const getStyles = (props, context) => {
  const { palette } = context.muiTheme;

  return {
    root: {
      flex: '0 0 auto',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      zIndex: null
    },
    leftIcon: {
      display: props.showAll ? 'block' : 'none',
      marginTop: 0
    },
    button: {
      marginLeft: 20,
      zIndex: 2
    },
    projectName: {
      color: palette.alternateTextColor,
      fontSize: '.8rem',
      fontWeight: 600
    },
    visits: {
      color: palette.alternateTextColor,
      fontSize: '.8rem'
    },
    toggle: {
      width: 'initial',
      filter: 'contrast(40%)'
    },
    toggleLabel: {
      color: palette.alternateTextColor
    }
  };
};

export default class Menu extends PureComponent {
  static propTypes = {
    files: PropTypes.array.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    setLocalization: PropTypes.func.isRequired,
    project: PropTypes.object,
    setProject: PropTypes.func.isRequired,
    setCardVisibility: PropTypes.func.isRequired,
    launchIDE: PropTypes.func.isRequired,
    showAll: PropTypes.bool.isRequired,
    toggleShowAll: PropTypes.func.isRequired,
    globalEvent: PropTypes.object.isRequired
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  state = {
    overrideTitle: null,
    open: false
  };

  get filesForPublishing() {
    // i18n 設定の固定:
    // 1. i18n/ll_CC/ 以下のファイルを取得
    const prefix = `i18n/${this.props.localization.ll_CC}/`;
    const currentLocales = this.props.files.filter(file =>
      file.name.startsWith(prefix)
    );

    // 2. i18n/ 以下のファイルをすべて削除し、
    const withoutI18n = this.props.files.filter(
      file => !file.name.startsWith('i18n/')
    );

    // 3. i18n/ll_CC/ 以下のファイルをルートに追加する
    const intoRoot = currentLocales.map(file => {
      const [, name] = file.name.split(prefix);
      return file.set({ name });
    });
    return withoutI18n.concat(intoRoot);
  }

  handleClone = () => {
    this.props.openFileDialog(CloneDialog, {
      files: this.props.files,
      project: this.props.project,
      setProject: this.props.setProject,
      launchIDE: this.props.launchIDE
    });
  };

  handleToggleDrawer = () =>
    this.setState({
      open: !this.state.open
    });

  handleSetTitle = event => {
    this.setState({ overrideTitle: event.data.value });
  };

  componentDidMount() {
    this.props.globalEvent.on('message.menuTitle', this.handleSetTitle);
  }

  render() {
    const { localization, setLocalization } = this.props;

    const styles = getStyles(this.props, this.context);

    const {
      palette: { alternateTextColor }
    } = this.context.muiTheme;

    const title =
      this.props.project &&
      (this.props.project.title ? (
        <div style={styles.projectName}>{this.props.project.title}</div>
      ) : (
        <FlatButton
          label={localization.cloneDialog.setTitle}
          labelStyle={{
            color: alternateTextColor
          }}
          onClick={this.handleClone}
        />
      ));

    return (
      <AppBar
        title={this.state.overrideTitle || title}
        style={styles.root}
        titleStyle={{ flex: null }}
        iconStyleLeft={styles.leftIcon}
        iconElementLeft={
          <IconButton onClick={this.handleToggleDrawer}>
            <NavigationMenu />
          </IconButton>
        }
      >
        <div style={{ flex: 1 }} />
        <Toggle
          label={this.props.showAll ? '' : localization.menu.showAll}
          toggled={this.props.showAll}
          onToggle={this.props.toggleShowAll}
          style={styles.toggle}
          labelStyle={styles.toggleLabel}
        />
        {/* {visits &&
          <div style={styles.visits}>
            {visits.getAttribute('x-feeles-visits')}
            PV
          </div>} */}
        {this.props.showAll ? (
          <IconButton
            tooltip={localization.menu.clone}
            onClick={this.handleClone}
            style={styles.button}
          >
            <FileDownload color={alternateTextColor} />
          </IconButton>
        ) : null}
        <IconMenu
          iconButtonElement={
            <IconButton tooltip={localization.menu.language}>
              <ActionLanguage color={alternateTextColor} />
            </IconButton>
          }
          anchorOrigin={{
            horizontal: 'right',
            vertical: 'top'
          }}
          targetOrigin={{
            horizontal: 'right',
            vertical: 'bottom'
          }}
          style={styles.button}
        >
          {acceptedLanguages.map(lang => (
            <MenuItem
              key={lang.accept[0]}
              primaryText={lang.native}
              onClick={() => setLocalization(lang.accept[0])}
            />
          ))}
        </IconMenu>
        <Drawer
          open={this.state.open}
          docked={false}
          onRequestChange={open => this.setState({ open })}
        >
          <AppBar
            iconElementLeft={
              <IconButton onClick={this.handleToggleDrawer}>
                <NavigationArrowBack />
              </IconButton>
            }
          />
          {this.state.open
            ? icons.map((item, index) => (
                <MenuItem
                  key={index}
                  primaryText={localization[lowerCaseAtFirst(item.name)].title}
                  leftIcon={item.icon}
                  onClick={() => {
                    this.props.setCardVisibility(item.name, true);
                    this.handleToggleDrawer();
                  }}
                />
              ))
            : null}
          <MenuItem
            primaryText={localization.menu.version}
            leftIcon={<ActionHistory />}
            onClick={() => {
              this.handleAbout();
              this.handleToggleDrawer();
            }}
          />
        </Drawer>
      </AppBar>
    );
  }
}

function lowerCaseAtFirst(string) {
  return string[0].toLowerCase() + string.substr(1);
}
