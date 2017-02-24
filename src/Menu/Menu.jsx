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
import ActionLanguage from 'material-ui/svg-icons/action/language';
import ActionAssignment from 'material-ui/svg-icons/action/assignment';
import ActionDashboard from 'material-ui/svg-icons/action/dashboard';
import NavigationArrowBack from 'material-ui/svg-icons/navigation/arrow-back';


import { BinaryFile, SourceFile } from '../File/';
import getLocalization, { acceptedLanguages } from '../localization/';
import AboutDialog from './AboutDialog';
import CloneDialog from './CloneDialog';
import {CardIcons} from '../Cards/CardWindow';


const getStyles = (props, context) => {
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

  handleDeploy = async () => {
    const serialized = JSON.stringify(
      this.props.files.map(item => item.serialize())
    );

    const json = new File([serialized], 'index.json', {
      type: 'application/json'
    });

    const formData = new FormData();
    formData.set('json', json);
    formData.set('script_src', CORE_CDN_URL);
    formData.set('organization_id', '2f8d7d90-fa51-11e6-afbf-f95c84f7b705');
    formData.set('organization_password', 'password');

    const origin = 'https://feeles-publisher.herokuapp.com';
    const response = await fetch(origin + '/api/v1/products', {
      method: 'POST',
      body: formData,
      mode: 'cors'
    });

    if (response.ok) {
      const text = await response.text();
      const {search} = JSON.parse(text);
      window.open(origin + '/products/' + search);
    } else {
      const blob = await response.blob();
      window.open(URL.createObjectURL(blob));
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
      </AppBar>
    );
  }
}

function lowerCaseAtFirst(string) {
  return string[0].toLowerCase() + string.substr(1);
}
