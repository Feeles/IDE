import React, { PropTypes, PureComponent } from 'react';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import Drawer from 'material-ui/Drawer';
import PowerSettingsNew from 'material-ui/svg-icons/action/power-settings-new';
import FileDownload from 'material-ui/svg-icons/file/file-download';
import FileCloudUpload from 'material-ui/svg-icons/file/cloud-upload';
import OpenInBrowser from 'material-ui/svg-icons/action/open-in-browser';
import ActionLanguage from 'material-ui/svg-icons/action/language';
import ActionAssignment from 'material-ui/svg-icons/action/assignment';
import ActionDashboard from 'material-ui/svg-icons/action/dashboard';
import NavigationArrowBack from 'material-ui/svg-icons/navigation/arrow-back';


import { BinaryFile, SourceFile } from '../File/';
import getLocalization, { acceptedLanguages } from '../localization/';
import AboutDialog from './AboutDialog';
import CloneDialog from './CloneDialog';


const getStyles = (props, context) => {

  const {
    isPopout,
  } = props;
  const { palette } = context.muiTheme;

  return {
    root: {
      flex: '0 0 auto',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    button: {
      marginLeft: 20,
      zIndex: 2,
    },
    popoutIcon: {
      transform: isPopout ? 'rotate(180deg)' : '',
    },
    projectName: {
      color: palette.alternateTextColor,
      fontSize: '.8rem',
      fontWeight: 600,
    },
  };
};

export default class Menu extends PureComponent {

  static propTypes = {
    files: PropTypes.array.isRequired,
    isPopout: PropTypes.bool.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    togglePopout: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    setLocalization: PropTypes.func.isRequired,
    getConfig: PropTypes.func.isRequired,
    setConfig: PropTypes.func.isRequired,
    coreString: PropTypes.string,
    saveAs: PropTypes.func.isRequired,
    project: PropTypes.object,
    setProject: PropTypes.func.isRequired,
    cards: PropTypes.array.isRequired,
    updateCard: PropTypes.func.isRequired,
    launchIDE: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    open: false,
  };

  handleClone = () => {
    this.props.openFileDialog(CloneDialog, {
      coreString: this.props.coreString,
      files: this.props.files,
      saveAs: this.props.saveAs,
      project: this.props.project,
      setProject: this.props.setProject,
      launchIDE: this.props.launchIDE,
    });
  };

  handleAbout = () => {
    this.props.openFileDialog(AboutDialog, {
      files: this.props.files,
    });
  };

  handleDeploy = () => {
    const task = async (event) => {
      if (event.source === popout) {
        window.removeEventListener('message', task);
        const [port] = event.ports;
        const provider = event.data;

        await this.props.setConfig('provider', JSON.parse(provider));

        const html = await SourceFile.embed({
          getConfig: this.props.getConfig,
          files: this.props.files,
          coreString: this.props.coreString,
        });

        port.postMessage(html.text);
      }
    };

    window.addEventListener('message', task);

    const popout = window.open(
      this.props.getConfig('provider').publishUrl,
      '_blank',
      'width=400,height=400');

    if (popout) {
      window.addEventListener('unload', () => popout.close());
    }
  };

  handleToggleDrawer = () => this.setState({
    open: !this.state.open,
  });

  render() {
    const {
      isPopout,
      togglePopout,
      localization,
      setLocalization,
      getConfig,
    } = this.props;

    const styles = getStyles(this.props, this.context);

    const {
      prepareStyles,
      palette: { alternateTextColor }
    } = this.context.muiTheme;

    const canDeploy = !!getConfig('provider').publishUrl;

    return (
      <AppBar
        style={styles.root}
        iconElementLeft={<IconButton><ActionDashboard /></IconButton>}
        onLeftIconButtonTouchTap={this.handleToggleDrawer}
      >
        <div style={{ flexGrow: 1 }}></div>
      {this.props.project && (
        this.props.project.title ? (
          <div style={styles.projectName}>
          {this.props.project.title}
          </div>
        ) : (
          <FlatButton
            label={localization.cloneDialog.setTitle}
            labelStyle={{ color: alternateTextColor }}
            onTouchTap={this.handleClone}
          />
        )
      )}
        <IconButton
          tooltip={localization.menu.popout}
          onTouchTap={togglePopout}
          style={styles.button}
          iconStyle={styles.popoutIcon}
        >
          <OpenInBrowser color={alternateTextColor} />
        </IconButton>
        <IconButton
          tooltip={localization.menu.clone}
          disabled={!this.props.coreString}
          onTouchTap={this.handleClone}
          style={styles.button}
        >
          <FileDownload color={alternateTextColor} />
        </IconButton>
        <IconButton
          tooltip={localization.menu.aboutFeeles}
          onTouchTap={this.handleAbout}
          style={styles.button}
        >
          <ActionAssignment color={alternateTextColor} />
        </IconButton>
        <IconButton
          tooltip={localization.menu.deploy}
          disabled={!canDeploy || !this.props.coreString}
          onTouchTap={this.handleDeploy}
          style={styles.button}
        >
          <FileCloudUpload color={alternateTextColor} />
        </IconButton>
        <IconMenu
          iconButtonElement={(
            <IconButton
              tooltip={localization.menu.language}
            >
              <ActionLanguage color={alternateTextColor} />
            </IconButton>
          )}
          anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
          targetOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          style={styles.button}
        >
        {acceptedLanguages.map(lang => (
          <MenuItem
            key={lang.accept[0]}
            primaryText={lang.native}
            onTouchTap={() => setLocalization(
              getLocalization(lang.accept[0])
            )}
          />
        ))}
        </IconMenu>
        <Drawer
          open={this.state.open}
          docked={false}
          onRequestChange={(open) => this.setState({open})}
        >
          <AppBar
            iconElementLeft={<IconButton><NavigationArrowBack /></IconButton>}
            onLeftIconButtonTouchTap={this.handleToggleDrawer}
          />
        {this.state.open ? this.props.cards
          .filter(item => !item.visible)
          .map(item => (
          <MenuItem
            key={item.name}
            primaryText={localization[lowerCaseAtFirst(item.name)].title}
            onTouchTap={() => {
              this.props.updateCard(item.name, {visible: true});
              this.handleToggleDrawer();
            }}
          />
        )) : null}
        </Drawer>
      </AppBar>
    );
  }
}

function lowerCaseAtFirst(string) {
  return string[0].toLowerCase() + string.substr(1);
}
