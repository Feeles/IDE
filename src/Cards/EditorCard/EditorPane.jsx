import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import IconButton from 'material-ui/IconButton';
import AVPlayCircleOutline from 'material-ui/svg-icons/av/play-circle-outline';
import transitions from 'material-ui/styles/transitions';

import { SourceFile } from 'File/';
import ChromeTab, { ChromeTabContent } from 'ChromeTab/';

const MAX_TAB = 16;

const getStyles = (props, context) => {
  const { palette, spacing, fontFamily } = context.muiTheme;

  return {
    root: {
      flex: 1,
      position: 'relative',
      opacity: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      overflow: 'hidden',
      fontFamily,
      transition: transitions.easeOut()
    },
    tabContainer: {
      display: 'flex',
      alignItems: 'flex-end',
      height: 32,
      paddingRight: 7,
      paddingBottom: 10,
      paddingLeft: 7,
      marginBottom: -10,
      overflow: 'hidden',
      zIndex: 10
    },
    tabContentContainer: {
      flex: '1 1 auto',
      position: 'relative'
    }
  };
};

export default class EditorPane extends PureComponent {
  static propTypes = {
    files: PropTypes.array.isRequired,
    tabs: PropTypes.array.isRequired,
    putFile: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired,
    closeTab: PropTypes.func.isRequired,
    setLocation: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    findFile: PropTypes.func.isRequired,
    getConfig: PropTypes.func.isRequired,
    setConfig: PropTypes.func.isRequired,
    port: PropTypes.object,
    reboot: PropTypes.bool.isRequired,
    scrollToCard: PropTypes.func.isRequired
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  componentWillReceiveProps(nextProps, nextState) {
    if (this.props.tabs !== nextProps.tabs) {
      const prevSelected = this.props.tabs.find(t => t.isSelected);
      const nextSelected = nextProps.tabs.find(t => t.isSelected);
      if (prevSelected !== nextSelected) {
        // タブの選択が変化したら EditorCard にスクロールする
        this.props.scrollToCard('EditorCard');
      }
    }
  }

  setLocation = href => {
    this.props.setLocation(href);
    this.props.scrollToCard('MonitorCard');
  };

  renderBackground() {
    const { localization } = this.props;
    const { palette } = this.context.muiTheme;

    const styles = {
      noFileBg: {
        flex: '1 1 auto',
        backgroundColor: palette.primary1Color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      logo: {
        color: palette.secondaryTextColor
      },
      largeIcon: {
        width: 40,
        height: 40
      },
      large: {
        width: 80,
        height: 80,
        padding: 20
      }
    };

    return (
      <div style={styles.noFileBg}>
        <h1 style={styles.logo}>Feeles</h1>
        <IconButton
          iconStyle={styles.largeIcon}
          style={styles.large}
          onTouchTap={() => this.setLocation()}
        >
          <AVPlayCircleOutline color={palette.alternateTextColor} />
        </IconButton>
      </div>
    );
  }

  getFiles = () => this.props.files;

  handleCloseSelectedTab = () => {
    this.props.tabs
      .filter(item => item.isSelected)
      .forEach(item => this.props.closeTab(item));
  };

  handleSelectTabFromFile = file => {
    this.props.tabs
      .filter(item => item.file.key === file.key)
      .forEach(item => this.props.selectTab(item));
  };

  render() {
    if (!this.props.tabs.length) {
      return this.renderBackground();
    }

    const {
      files,
      tabs,
      putFile,
      selectTab,
      closeTab,
      openFileDialog,
      localization,
      findFile,
      getConfig,
      setConfig,
      port,
      reboot
    } = this.props;
    const { prepareStyles, palette } = this.context.muiTheme;

    const styles = getStyles(this.props, this.context);

    return (
      <div style={styles.root}>
        <div style={styles.tabContainer}>
          {tabs
            .slice(0, MAX_TAB)
            .map(tab => (
              <ChromeTab
                key={tab.key}
                tab={tab}
                file={tab.file}
                tabs={tabs}
                isSelected={tab.isSelected}
                localization={localization}
                handleSelect={selectTab}
                handleClose={closeTab}
              />
            ))}
        </div>
        <div style={styles.tabContentContainer}>
          {tabs.map(tab => (
            <ChromeTabContent key={tab.key} show={tab.isSelected}>
              {tab.renderContent({
                getFiles: this.getFiles,
                closeSelectedTab: this.handleCloseSelectedTab,
                selectTabFromFile: this.handleSelectTabFromFile,
                setLocation: this.setLocation,
                href: this.props.href,
                getConfig,
                findFile,
                localization,
                port,
                reboot,
                openFileDialog,
                putFile
              })}
            </ChromeTabContent>
          ))}
        </div>
      </div>
    );
  }
}
