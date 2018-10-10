import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import IconMenu from '@material-ui/core/IconMenu';
import MenuItem from '@material-ui/core/MenuItem';
import FlatButton from '@material-ui/core/FlatButton';
import Toggle from '@material-ui/core/Toggle';
import FileDownload from '@material-ui/core/svg-icons/file/file-download';
import ActionLanguage from '@material-ui/core/svg-icons/action/language';
import NavigationMenu from '@material-ui/core/svg-icons/navigation/menu';

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
    cardProps: PropTypes.object.isRequired,
    setCardVisibility: PropTypes.func.isRequired,
    toggleSidebar: PropTypes.func.isRequired,
    files: PropTypes.array.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    setLocalization: PropTypes.func.isRequired,
    project: PropTypes.object,
    setProject: PropTypes.func.isRequired,
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
          <IconButton onClick={this.props.toggleSidebar}>
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
      </AppBar>
    );
  }
}
