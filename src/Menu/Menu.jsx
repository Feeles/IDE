import React, { PropTypes, PureComponent } from 'react';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import Drawer from 'material-ui/Drawer';
import Snackbar from 'material-ui/Snackbar';
import CircularProgress from 'material-ui/CircularProgress';
import PowerSettingsNew from 'material-ui/svg-icons/action/power-settings-new';
import FileDownload from 'material-ui/svg-icons/file/file-download';
import FileCloudUpload from 'material-ui/svg-icons/file/cloud-upload';
import ActionLanguage from 'material-ui/svg-icons/action/language';
import ActionHistory from 'material-ui/svg-icons/action/history';
import ActionDashboard from 'material-ui/svg-icons/action/dashboard';
import ActionAccountCircle from 'material-ui/svg-icons/action/account-circle';
import ActionAutorenew from 'material-ui/svg-icons/action/autorenew';
import NavigationArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import NotificationSyncDisabled from 'material-ui/svg-icons/notification/sync-disabled';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import TwitterIcon from '../utils/TwitterIcon';
import LineIcon from '../utils/LineIcon';
import FacebookIcon from '../utils/FacebookIcon';


import { BinaryFile, SourceFile } from '../File/';
import { acceptedLanguages } from '../localization/';
import AboutDialog from './AboutDialog';
import CloneDialog from './CloneDialog';
import MetaDialog from './MetaDialog';
import { updateProject } from '../database/';
import organization from '../organization';
import debugWindow from '../utils/debugWindow';
import open from '../utils/open';
import * as Cards from '../Cards';

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
    progress: {
      marginLeft: 20,
      padding: 12,
    },
    visits: {
      color: palette.alternateTextColor,
      fontSize: '.8rem',
    },
    twitter: {
      color: '#FFFFFF',
      backgroundColor: '#1DA1F2',
    },
    line: {
      color: '#FFFFFF',
      backgroundColor: '#00C300',
    },
    facebook: {
      color: '#FFFFFF',
      backgroundColor: '#3B5998',
    },
  };
};

export default class Menu extends PureComponent {

  static propTypes = {
    cards: PropTypes.object.isRequired,
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
    notice: null,
    // OAuth 認証によって得られる UUID.
    // あくまで発行しているのは feeles.com である
    // この値はユーザが見えるところには表示してはならない
    oAuthId: null,
  };

  get shareURL() {
    if (!this.props.deployURL) {
      return location.href;
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

  handleDeploy = async (withOAuth, isUpdate) => {
    const {localization} = this.props;

    const result = await this.props.openFileDialog(MetaDialog, {
      getConfig: this.props.getConfig,
      setConfig: this.props.setConfig,
    });
    if (!result) return;

    // organization による投稿にはパスワードが必要
    let password = null;
    if (!withOAuth) {
      password = this.state.password || prompt(localization.menu.enterPassword);
      if (!password) {
        this.setState({password: null});
        return;
      }
    }

    this.setState({isDeploying: true});

    try {
      const composed = await Promise.all(this.props.files.map(item => item.collect()));

      // isUpdate の場合は PUT products/:search, そうでない場合は POST products
      const actionURL = isUpdate ? this.props.deployURL : organization.api.deploy;
      const body = {
        json: JSON.stringify(composed),
        script_src: CORE_CDN_URL,
        ogp: this.props.getConfig('ogp'),
      };
      if (withOAuth) {
        body.oauth_id = this.state.oAuthId;
      } else {
        body.organization_id = organization.id;
        body.organization_password = password;
      }
      const response = await fetch(actionURL, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
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

        this.setState({
          password,
          notice: {
            message: localization.menu.published,
            action: localization.menu.goToSee,
            autoHideDuration: 20000,
            onActionTouchTap: () => window.open(`${api.origin}/p/${search}`),
          }
        });
      } else {
        alert(localization.menu.failedToDeploy);
        debugWindow(response);
      }

    } catch (e) {
      console.error(e);
    }

    this.setState({isDeploying: false});
  };

  handleLoginWithOAuth(url) {
    const {
      localization,
    } = this.props;

    const win = open(url);
    const callback = (oAuthId) => {
      this.setState({
        oAuthId,
        notice: {
          message: localization.menu.loggedIn,
          action: localization.menu.logout,
          autoHideDuration: 20000,
          onActionTouchTap: this.handleLogout,
        },
      });
    };
    window.addEventListener('message', function task(event) {
      if (event.source === win) {
        window.removeEventListener('message', task);
        callback(event.data.id);
      }
    });
  };

  handleLogout = () => {
    this.setState({oAuthId: null});
  };

  handleRequestClose = () => {
    this.setState({notice: null});
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

    const visits = document.querySelector('script[x-feeles-visits]');
    const isLoggedin = this.state.oAuthId !== null;

    return (
      <AppBar
        title={organization.title}
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
      {visits && (
        <div style={styles.visits}>{visits.getAttribute('x-feeles-visits')} PV</div>
      )}
        <IconButton
          tooltip={localization.menu.clone}
          disabled={!this.props.coreString}
          onTouchTap={this.handleClone}
          style={styles.button}
        >
          <FileDownload color={alternateTextColor} />
        </IconButton>
      {this.state.isDeploying ? (
        <CircularProgress size={24} style={styles.progress} color={alternateTextColor} />
      ) : (
        <IconMenu
          iconButtonElement={(
            <IconButton tooltip={localization.menu.you}>
              <ActionAccountCircle color={alternateTextColor} />
            </IconButton>
          )}
          anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
          targetOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          style={styles.button}
        >
        {isLoggedin ? (
          <MenuItem
            primaryText={localization.menu.deploySelf}
            rightIcon={<ArrowDropRight />}
            menuItems={[
              <MenuItem
                primaryText={localization.menu.update}
                disabled={!this.props.deployURL}
                leftIcon={<ActionAutorenew />}
                onTouchTap={() => this.handleDeploy(true, true)}
              />,
              <MenuItem
                primaryText={localization.menu.create}
                leftIcon={<FileCloudUpload />}
                onTouchTap={() => this.handleDeploy(true, false)}
              />
            ]}
          />
        ) : (
          <MenuItem
            primaryText={localization.menu.login}
            disabled={isLoggedin}
            leftIcon={<ActionAccountCircle />}
            rightIcon={<ArrowDropRight />}
            menuItems={[
              <MenuItem
                primaryText={localization.menu.withTwitter}
                leftIcon={<TwitterIcon />}
                style={styles.twitter}
                onTouchTap={() => this.handleLoginWithOAuth(organization.api.twitter)}
              />,
              <MenuItem
                primaryText={localization.menu.withLine}
                leftIcon={<LineIcon />}
                style={styles.line}
                onTouchTap={() => this.handleLoginWithOAuth(organization.api.line)}
              />,
              <MenuItem
                primaryText={localization.menu.withFacebook}
                leftIcon={<FacebookIcon />}
                style={styles.facebook}
                onTouchTap={() => this.handleLoginWithOAuth(organization.api.facebook)}
              />
            ]}
          />
        )}
        {organization.id ? (
          <MenuItem
            rightIcon={<ArrowDropRight />}
            primaryText={localization.menu.deployAs(organization.title)}
            menuItems={[
              <MenuItem
                primaryText={localization.menu.update}
                disabled={!this.props.deployURL}
                leftIcon={<ActionAutorenew />}
                onTouchTap={() => this.handleDeploy(false, true)}
              />,
              <MenuItem
                primaryText={localization.menu.create}
                leftIcon={<FileCloudUpload />}
                onTouchTap={() => this.handleDeploy(false, false)}
              />
            ]}
          />
        ) : null}
        {isLoggedin ? (
          <MenuItem
            primaryText={localization.menu.logout}
            onTouchTap={this.handleLogout}
          />
        ) : null}
        </IconMenu>
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
            onTouchTap={() => setLocalization(lang.accept[0])}
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
        {this.state.open ? Object.entries(this.props.cards)
          .map(([name, card]) => ({name, ...card}))
          .filter(item => !item.visible)
          .map(item => (
          <MenuItem
            key={item.name}
            primaryText={localization[lowerCaseAtFirst(item.name)].title}
            leftIcon={renderCardIcon(item.name)}
            onTouchTap={() => {
              this.props.updateCard(item.name, {visible: true});
              this.handleToggleDrawer();
            }}
          />
        )) : null}
          <MenuItem
            primaryText={localization.menu.version}
            leftIcon={<ActionHistory />}
            onTouchTap={() => {
              this.handleAbout();
              this.handleToggleDrawer();
            }}
          />
        </Drawer>
        <Snackbar
          open={this.state.notice !== null}
          message=""
          autoHideDuration={4000}
          style={styles.snackbar}
          onRequestClose={this.handleRequestClose}
          {...this.state.notice}
        />
      </AppBar>
    );
  }
}

function lowerCaseAtFirst(string) {
  return string[0].toLowerCase() + string.substr(1);
}

function renderCardIcon(name) {
  if (name in Cards) {
    return Cards[name].icon();
  } else {
    return null;
  }
}
