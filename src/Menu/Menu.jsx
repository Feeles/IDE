import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import Drawer from 'material-ui/Drawer';
import Snackbar from 'material-ui/Snackbar';
import CircularProgress from 'material-ui/CircularProgress';
import Toggle from 'material-ui/Toggle';
import FileDownload from 'material-ui/svg-icons/file/file-download';
import FileCloudUpload from 'material-ui/svg-icons/file/cloud-upload';
import ActionLanguage from 'material-ui/svg-icons/action/language';
import ActionHistory from 'material-ui/svg-icons/action/history';
import ActionAccountCircle from 'material-ui/svg-icons/action/account-circle';
import ActionAutorenew from 'material-ui/svg-icons/action/autorenew';
import NavigationArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import { emphasize } from 'material-ui/utils/colorManipulator';
import TwitterIcon from '../utils/TwitterIcon';
import FacebookIcon from '../utils/FacebookIcon';
import GoogleIcon from '../utils/GoogleIcon';

import { acceptedLanguages } from '../localization/';
import CloneDialog from './CloneDialog';
import MetaDialog from './MetaDialog';
import { updateProject } from '../database/';
import organization from '../organization';
import debugWindow from '../utils/debugWindow';
import open from '../utils/open';

import fetchPonyfill from 'fetch-ponyfill';
const fetch =
  window.fetch ||
  // for IE11
  fetchPonyfill({
    // TODO: use babel-runtime to rewrite this into require("babel-runtime/core-js/promise")
    Promise
  }).fetch;

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
    hidden: {
      opacity: 0,
      width: 1,
      height: 1
    },
    progress: {
      marginLeft: 20,
      padding: 12
    },
    visits: {
      color: palette.alternateTextColor,
      fontSize: '.8rem'
    },
    twitter: {
      color: '#FFFFFF',
      backgroundColor: '#1DA1F2'
    },
    line: {
      color: '#FFFFFF',
      backgroundColor: '#00C300'
    },
    facebook: {
      color: '#FFFFFF',
      backgroundColor: '#3B5998'
    },
    google: {
      color: 'rgba(0,0,0,0.54)',
      backgroundColor: '#FFFFFF'
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
    cards: PropTypes.object.isRequired,
    cardIcons: PropTypes.object,
    files: PropTypes.array.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    setLocalization: PropTypes.func.isRequired,
    getConfig: PropTypes.func.isRequired,
    setConfig: PropTypes.func.isRequired,
    loadConfig: PropTypes.func.isRequired,
    findFile: PropTypes.func.isRequired,
    project: PropTypes.object,
    setProject: PropTypes.func.isRequired,
    updateCard: PropTypes.func.isRequired,
    launchIDE: PropTypes.func.isRequired,
    deployURL: PropTypes.string,
    setDeployURL: PropTypes.func.isRequired,
    oAuthId: PropTypes.string,
    setOAuthId: PropTypes.func.isRequired,
    showAll: PropTypes.bool.isRequired,
    toggleShowAll: PropTypes.func.isRequired,
    globalEvent: PropTypes.object.isRequired
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  state = {
    overrideTitle: null,
    open: false,
    isDeploying: false,
    notice: null
  };

  get shareURL() {
    if (!this.props.deployURL) {
      return location.href;
    }
    const url = new URL(this.props.deployURL);
    const { origin, pathname } = url;
    return `${origin}/p/${pathname.split('/').reverse()[0]}`;
  }

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
      launchIDE: this.props.launchIDE,
      deployURL: this.props.deployURL
    });
  };

  handleDeploy = async (withOAuth, isUpdate) => {
    const { localization } = this.props;

    const result = await this.props.openFileDialog(MetaDialog, {
      getConfig: this.props.getConfig,
      setConfig: this.props.setConfig,
      findFile: this.props.findFile
    });
    if (!result) return;

    this.setState({ isDeploying: true });

    try {
      const composed = await Promise.all(
        this.filesForPublishing.map(item => item.collect())
      );

      // isUpdate の場合は PUT products/:search, そうでない場合は POST products
      const actionURL = isUpdate
        ? this.props.deployURL
        : organization.api.deploy;
      const body = new URLSearchParams();
      body.append('json', JSON.stringify(composed));
      body.append(
        'script_src',
        'https://unpkg.com/feeles-ide@latest/umd/index.js'
      );
      if (withOAuth) {
        body.append('oauth_id', this.props.oAuthId);
      }
      if (isUpdate) {
        body.append('_method', 'PUT');
        // Update og:url
        const ogp = this.props.getConfig('ogp');
        if (ogp['og:url'] !== this.shareURL) {
          this.props.setConfig('ogp', {
            ...ogp,
            'og:url': this.shareURL
          });
        }
      }
      body.append('ogp', JSON.stringify(this.props.getConfig('ogp')));

      // .feelesrc.yml の情報を付与
      const feelesrc = this.props.loadConfig('feelesrc');
      if (!isUpdate && feelesrc.kitIdentifier) {
        // キットの識別子 e.g. com.feeles.hack-rpg
        body.append('kit_identifier', feelesrc.kitIdentifier);
      }

      // store/update action
      const response = await fetch(actionURL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        // [Safari Bug] URLSearchParams not supported in bodyInit
        body: body.toString(),
        mode: 'cors'
      });

      if (response.ok) {
        const text = await response.text();
        const { search } = JSON.parse(text);
        const api = new URL(actionURL);
        const deployURL = `${api.origin}/api/v1/products/${search}`;
        this.props.setDeployURL(deployURL);
        if (this.props.project) {
          await updateProject(this.props.project.id, { deployURL });
        }
        this.setState({
          notice: {
            message: localization.menu.published,
            action: localization.menu.goToSee,
            autoHideDuration: 20000,
            onActionClick: () => window.open(`${api.origin}/p/${search}`)
          }
        });
      } else {
        alert(localization.menu.failedToDeploy);
        debugWindow(response);
      }
    } catch (e) {
      console.info(e);
    }

    this.setState({ isDeploying: false });
  };

  handleLoginWithOAuth(url) {
    const { localization } = this.props;

    const win = open(url);
    const callback = oAuthId => {
      this.props.setOAuthId(oAuthId);
      this.setState({
        notice: {
          message: localization.menu.loggedIn,
          action: localization.menu.logout,
          autoHideDuration: 20000,
          onActionClick: this.handleLogout
        }
      });
    };
    window.addEventListener('message', function task(event) {
      if (event.source === win) {
        window.removeEventListener('message', task);
        callback(event.data.id);
      }
    });
  }

  handleLogout = () => {
    this.props.setOAuthId();
    this.handleRequestClose();
  };

  handleRequestClose = () => {
    this.setState({ notice: null });
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

    const { palette: { alternateTextColor } } = this.context.muiTheme;

    const isLoggedin = this.props.oAuthId !== null;

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
        onLeftIconButtonClick={this.handleToggleDrawer}
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
        {this.state.isDeploying ? (
          <CircularProgress
            size={24}
            style={styles.progress}
            color={alternateTextColor}
          />
        ) : null}
        {!this.state.isDeploying && this.props.showAll ? (
          <IconMenu
            iconButtonElement={
              <IconButton tooltip={localization.menu.you}>
                <ActionAccountCircle color={alternateTextColor} />
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
            {isLoggedin ? null : (
              <MenuItem
                primaryText={localization.menu.deployAnonymous}
                leftIcon={<FileCloudUpload />}
                onClick={() => this.handleDeploy(false, false)}
              />
            )}
            {isLoggedin ? (
              <MenuItem
                primaryText={localization.menu.deploySelf}
                rightIcon={<ArrowDropRight />}
                menuItems={[
                  <MenuItem
                    key="1"
                    primaryText={localization.menu.update}
                    disabled={!this.props.deployURL}
                    leftIcon={<ActionAutorenew />}
                    onClick={() => this.handleDeploy(true, true)}
                  />,
                  <MenuItem
                    key="2"
                    primaryText={localization.menu.create}
                    leftIcon={<FileCloudUpload />}
                    onClick={() => this.handleDeploy(true, false)}
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
                  <HoverMenuItem
                    key="1"
                    primaryText={localization.menu.withGoogle}
                    leftIcon={<GoogleIcon />}
                    style={styles.google}
                    onClick={() =>
                      this.handleLoginWithOAuth(organization.api.google)
                    }
                  />,
                  <HoverMenuItem
                    key="2"
                    primaryText={localization.menu.withFacebook}
                    leftIcon={<FacebookIcon />}
                    style={styles.facebook}
                    onClick={() =>
                      this.handleLoginWithOAuth(organization.api.facebook)
                    }
                  />,
                  <HoverMenuItem
                    key="3"
                    primaryText={localization.menu.withTwitter}
                    leftIcon={<TwitterIcon />}
                    style={styles.twitter}
                    onClick={() =>
                      this.handleLoginWithOAuth(organization.api.twitter)
                    }
                  />
                ]}
              />
            )}
            {isLoggedin ? (
              <MenuItem
                primaryText={localization.menu.logout}
                onClick={this.handleLogout}
              />
            ) : null}
          </IconMenu>
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
              <IconButton>
                <NavigationArrowBack />
              </IconButton>
            }
            onLeftIconButtonClick={this.handleToggleDrawer}
          />
          {this.state.open
            ? Object.entries(this.props.cards)
                .map(([name, card]) => ({
                  name,
                  ...card
                }))
                .map(item => (
                  <MenuItem
                    key={item.name}
                    primaryText={
                      localization[lowerCaseAtFirst(item.name)].title
                    }
                    leftIcon={
                      this.props.cardIcons && this.props.cardIcons[item.name]
                        ? this.props.cardIcons[item.name]()
                        : null
                    }
                    onClick={() => {
                      this.props.updateCard(item.name, { visible: true });
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

class HoverMenuItem extends PureComponent {
  static propTypes = {
    style: PropTypes.object.isRequired
  };

  state = {
    hover: false
  };

  render() {
    let { style } = this.props;
    if (this.state.hover) {
      style = {
        ...style,
        backgroundColor: emphasize(style.backgroundColor, 0.14)
      };
    }
    return (
      <MenuItem
        {...this.props}
        style={style}
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
      />
    );
  }
}
