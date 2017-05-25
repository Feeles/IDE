import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import IconButton from 'material-ui/IconButton';
import ContentCreate from 'material-ui/svg-icons/content/create';
import AVPlayCircleOutline from 'material-ui/svg-icons/av/play-circle-outline';
import transitions from 'material-ui/styles/transitions';

import Card from '../CardWindow';
import { SourceFile } from 'File/';
import SourceEditor from './SourceEditor';
import ChromeTab, { Tab } from 'ChromeTab/';

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
      position: 'relative',
      borderTop: `1px solid ${palette.primary1Color}`
    }
  };
};

export default class EditorCard extends PureComponent {
  static propTypes = {
    cardPropsBag: PropTypes.object.isRequired,
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
    scrollToCard: PropTypes.func.isRequired,
    cards: PropTypes.object.isRequired,
    updateCard: PropTypes.func.isRequired
  };

  state = {
    docs: null
  };

  static icon() {
    return <ContentCreate />;
  }

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.tabs !== nextProps.tabs) {
      const prevSelected = this.props.tabs.find(t => t.isSelected);
      const nextSelected = nextProps.tabs.find(t => t.isSelected);
      if (prevSelected !== nextSelected) {
        // タブの選択が変化したら EditorCard にスクロールする
        this.props.scrollToCard('EditorCard');
      }
    }
    if (this.props.port !== nextProps.port) {
      this.handlePort(this.props.port, nextProps.port);
    }
  }

  componentDidMount() {
    // init.fileName があるとき Mount 後に selectTab しておく
    try {
      const { init } = this.props.cards.EditorCard;
      if (init && init.fileName) {
        const getFile = () => this.props.findFile(init.fileName);
        this.props.selectTab(new Tab({ getFile }));
      }
    } catch (e) {}
  }

  setLocation = href => {
    this.props.setLocation(href);
    this.props.scrollToCard('MonitorCard');
  };

  handlePort = (prevPort, nextPort) => {
    if (prevPort) {
      prevPort.removeEventListener('message', this.handleMessage);
    }
    if (nextPort) {
      nextPort.addEventListener('message', this.handleMessage);
    }
  };

  // TODO: この辺の処理は共通化した方がよさそう
  handleMessage = event => {
    const { query, value } = event.data || {};
    if (!query) return;

    if (query === 'editor' && value) {
      // feeles.openEditor()
      const getFile = () => this.props.findFile(value);
      this.props.selectTab(new Tab({ getFile }));
      this.props.updateCard('EditorCard', { visible: true });
    } else if (query === 'editor') {
      // feeles.closeEditor()
      this.props.updateCard('EditorCard', { visible: false });
    }
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

  closeTab = tab => {
    if (this.state.docs) {
      this.state.docs.delete(tab.file.key);
    }
    this.props.closeTab(tab);
  };

  render() {
    if (!this.props.tabs.length) {
      return (
        <Card icon={EditorCard.icon()} {...this.props.cardPropsBag} fit>
          {this.renderBackground()}
        </Card>
      );
    }

    const {
      files,
      putFile,
      selectTab,
      openFileDialog,
      localization,
      findFile,
      getConfig,
      setConfig,
      port,
      reboot
    } = this.props;
    const { prepareStyles, palette } = this.context.muiTheme;

    const tabs = [];
    for (const tab of this.props.tabs) {
      if (tabs.length < MAX_TAB && this.state.docs) {
        const doc = this.state.docs.get(tab.file.key);
        if (doc) {
          tabs.push(
            <ChromeTab
              key={tab.key}
              tab={tab}
              file={tab.file}
              tabs={tabs}
              isSelected={tab.isSelected}
              localization={localization}
              handleSelect={selectTab}
              handleClose={this.closeTab}
              doc={doc}
            />
          );
        }
      }
    }
    const selectedTab = this.props.tabs.find(item => item.isSelected);

    const styles = getStyles(this.props, this.context);

    return (
      <Card icon={EditorCard.icon()} {...this.props.cardPropsBag} fit>
        <div style={styles.root}>
          <div style={styles.tabContainer}>
            {tabs}
          </div>
          <div style={styles.tabContentContainer}>
            <SourceEditor
              file={selectedTab.file}
              getFiles={this.getFiles}
              closeSelectedTab={this.handleCloseSelectedTab}
              selectTabFromFile={this.handleSelectTabFromFile}
              setLocation={this.setLocation}
              href={this.props.href}
              getConfig={getConfig}
              findFile={findFile}
              localization={localization}
              port={port}
              reboot={reboot}
              openFileDialog={openFileDialog}
              putFile={putFile}
              docsRef={docs => this.setState({ docs })}
            />
          </div>
        </div>
      </Card>
    );
  }
}

export { default as Preview } from './Preview';
export { default as Editor } from './Editor';
export { default as SourceEditor } from './SourceEditor';
