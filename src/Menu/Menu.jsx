import React, { PropTypes, PureComponent } from 'react';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import Drawer from 'material-ui/Drawer';
import Snackbar from 'material-ui/Snackbar';
import PowerSettingsNew from 'material-ui/svg-icons/action/power-settings-new';
import FileDownload from 'material-ui/svg-icons/file/file-download';
import FileCloudUpload from 'material-ui/svg-icons/file/cloud-upload';
import FileCloudCircle from 'material-ui/svg-icons/file/cloud-circle';
import ActionLanguage from 'material-ui/svg-icons/action/language';
import ActionAssignment from 'material-ui/svg-icons/action/assignment';
import ActionDashboard from 'material-ui/svg-icons/action/dashboard';
import NavigationArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import SocialShare from 'material-ui/svg-icons/social/share';
import NotificationSyncDisabled from 'material-ui/svg-icons/notification/sync-disabled';
import ContentLink from 'material-ui/svg-icons/content/link';


import { BinaryFile, SourceFile } from '../File/';
import getLocalization, { acceptedLanguages } from '../localization/';
import AboutDialog from './AboutDialog';
import CloneDialog from './CloneDialog';
import {CardIcons} from '../Cards/CardWindow';
import { updateProject } from '../database/';
import organization from '../organization';


const getStyles = (props, context) => {
  const { palette } = context.muiTheme;

  return {
    root: {
      flex: '0 0 auto',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    leftIcon: {
      marginTop: 0,
    },
    button: {
      marginLeft: 20,
      zIndex: 2,
    },
    projectName: {
      color: palette.alternateTextColor,
      fontSize: '.8rem',
      fontWeight: 600,
    },
    hidden: {
      opacity: 0,
      width: 1,
      height: 1,
    },
  };
};

export default class Menu extends PureComponent {

  static propTypes = {
    files: PropTypes.array.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    setLocalization: PropTypes.func.isRequired,
    getConfig: PropTypes.func.isRequired,
    setConfig: PropTypes.func.isRequired,
    coreString: PropTypes.string,
    saveAs: PropTypes.func.isRequired,
    project: PropTypes.object,
    setProject: PropTypes.func.isRequired,
    updateCard: PropTypes.func.isRequired,
    launchIDE: PropTypes.func.isRequired,
    deployURL: PropTypes.string,
    setDeployURL: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    open: false,
    password: null,
    isDeploying: false,
    openSnackbar: false,
  };

  get shareURL() {
    if (!this.props.deployURL) {
      return '';
    }
    const url = new URL(this.props.deployURL);
    const {origin, pathname} = url;
    return `${origin}/p/${pathname.split('/').reverse()[0]}`;
  }

  handleClone = () => {
    this.props.openFileDialog(CloneDialog, {
      coreString: this.props.coreString,
      files: this.props.files,
      saveAs: this.props.saveAs,
      project: this.props.project,
      setProject: this.props.setProject,
      launchIDE: this.props.launchIDE,
      deployURL: this.props.deployURL,
    });
  };

  handleAbout = () => {
    this.props.openFileDialog(AboutDialog, {
      files: this.props.files,
      deployURL: this.props.deployURL,
    });
  };

  handleDeploy = async () => {
    if (this.state.isDeploying) return;

    const {
      deployURL,
      localization,
      getConfig,
    } = this.props;

    const password = this.state.password || prompt(localization.menu.enterPassword);
    if (!password) {
      this.setState({password: null});
      return;
    }

    this.setState({isDeploying: true});

    const params = new URLSearchParams();
    params.set('script_src', CORE_CDN_URL);
    params.set('ogp', JSON.stringify(getConfig('ogp')));
    params.set('organization_id', organization.id);
    params.set('organization_password', password);

    const composed = await Promise.all(this.props.files.map(item => item.compose()));
    params.set('json', JSON.stringify(composed));

    const actionURL = this.props.deployURL || organization.deployURL;

    const response = await fetch(actionURL, {
      method: this.props.deployURL ? 'PUT' : 'POST',
      body: params,
      mode: 'cors'
    });

    if (response.ok) {
      const text = await response.text();
      const {search} = JSON.parse(text);
      const api = new URL(actionURL);
      const deployURL = `${api.origin}/api/v1/products/${search}`;
      this.props.setDeployURL(deployURL);
      if (this.props.project) {
        await updateProject(this.props.project.id, {deployURL});
      }
      this.setState({password});
      window.open(`${api.origin}/p/${search}`);
    } else {
      console.error(response);
      alert(localization.menu.failedToDeploy);
      if (process.env.NODE_ENV !== 'production') {
        window.open(
          URL.createObjectURL(await response.blob())
        );
      }
    }

    this.setState({isDeploying: false});
  };

  handleShare = () => {
    if (!this.input || !this.shareURL) return;

    this.input.value = this.shareURL;
    this.input.select();
    if (document.execCommand('copy')) {
      this.setState({openSnackbar: true});
    }
  };

  handleRequestClose = () => {
    this.setState({openSnackbar: false});
  };

  handleUnlink = async () => {
    if (confirm(this.props.localization.menu.confirmUnlink)) {
      this.props.setDeployURL(null);
      if (this.props.project) {
        await updateProject(this.props.project.id, {deployURL: null});
      }
    }
  };

  handleToggleDrawer = () => this.setState({
    open: !this.state.open,
  });

  render() {
    const {
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

    const DeployStateIcon = this.state.isDeploying
      ? FileCloudCircle
      : FileCloudUpload;

    return (
      <AppBar
        style={styles.root}
        iconStyleLeft={styles.leftIcon}
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
      {this.props.deployURL ? (
        <IconMenu
          iconButtonElement={(
            <IconButton tooltip={localization.menu.share}>
              <SocialShare color={alternateTextColor} />
            </IconButton>
          )}
          anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
          targetOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          style={styles.button}
        >
          <MenuItem leftIcon={<ContentLink />} onTouchTap={this.handleShare}>
            {localization.menu.copyURL}
            <input style={styles.hidden} ref={ref => this.input = ref} />
          </MenuItem>
          <MenuItem
            primaryText={localization.menu.update}
            leftIcon={<DeployStateIcon />}
            onTouchTap={this.handleDeploy}
            disabled={this.state.isDeploying}
          />
          <MenuItem
            primaryText={localization.menu.unlink}
            leftIcon={<NotificationSyncDisabled />}
            onTouchTap={this.handleUnlink}
          />
        </IconMenu>
      ) : (
        <IconButton
          tooltip={localization.menu.deploy}
          onTouchTap={this.handleDeploy}
          disabled={this.state.isDeploying}
          style={styles.button}
        >
          <DeployStateIcon color={alternateTextColor} />
        </IconButton>
      )}
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
        {this.state.open ? Object.entries(this.props.getConfig('card'))
          .map(([name, card]) => ({name, ...card}))
          .filter(item => !item.visible)
          .map(item => (
          <MenuItem
            key={item.name}
            primaryText={localization[lowerCaseAtFirst(item.name)].title}
            leftIcon={CardIcons[item.name]}
            onTouchTap={() => {
              this.props.updateCard(item.name, {visible: true});
              this.handleToggleDrawer();
            }}
          />
        )) : null}
        </Drawer>
        <Snackbar
          open={this.state.openSnackbar}
          message={localization.menu.linkCopied + this.shareURL}
          autoHideDuration={4000}
          onRequestClose={this.handleRequestClose}
        />
      </AppBar>
    );
  }
}

function lowerCaseAtFirst(string) {
  return string[0].toLowerCase() + string.substr(1);
}
