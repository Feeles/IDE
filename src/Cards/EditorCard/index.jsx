import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import IconButton from 'material-ui/IconButton';
import ContentCreate from 'material-ui/svg-icons/content/create';
import AVPlayCircleOutline from 'material-ui/svg-icons/av/play-circle-outline';

import Card from '../CardWindow';
import SourceEditor from './SourceEditor';
import ChromeTab, { Tab } from '../../ChromeTab/';

const MAX_TAB = 5;

const getStyles = (props, context) => {
  const { palette } = context.muiTheme;

  return {
    tabContainer: {
      position: 'absolute',
      top: 0,
      width: 'calc(100% - 48px)',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'flex-end',
      height: 32,
      paddingRight: 7,
      paddingLeft: 40,
      zIndex: 10
    },
    tabContentContainer: {
      flex: 1,
      position: 'relative',
      borderTop: `1px solid ${palette.primary1Color}`
    }
  };
};

export default class EditorCard extends PureComponent {
  static propTypes = {
    fileView: PropTypes.object.isRequired,
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
    loadConfig: PropTypes.func.isRequired,
    reboot: PropTypes.bool.isRequired,
    href: PropTypes.string.isRequired,
    scrollToCard: PropTypes.func.isRequired,
    cards: PropTypes.object.isRequired,
    updateCard: PropTypes.func.isRequired,
    globalEvent: PropTypes.object.isRequired
  };

  state = {
    // { [Tab.file.key]: Doc }
    currentDoc: {}
  };

  static icon() {
    return <ContentCreate />;
  }

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  componentDidUpdate(prevProps) {
    if (prevProps.tabs !== this.props.tabs) {
      const prevSelected = prevProps.tabs.find(t => t.isSelected);
      const nextSelected = this.props.tabs.find(t => t.isSelected);
      if (prevSelected !== nextSelected) {
        // タブの選択が変化したら EditorCard にスクロールする
        this.props.scrollToCard('EditorCard');
      }
    }
  }

  componentDidMount() {
    const { globalEvent } = this.props;
    globalEvent.on('message.editor', this.handleEditor);
    // init.fileName があるとき Mount 後に selectTab しておく
    try {
      const { init } = this.props.cards.EditorCard;
      if (init && init.fileName) {
        const getFile = () => this.props.findFile(init.fileName);
        this.props.selectTab(new Tab({ getFile }));
      }
    } catch (e) {
      // continue regardless of error
    }
  }

  setLocation = href => {
    this.props.setLocation(href);
    this.props.scrollToCard('MonitorCard');
  };

  handleEditor = event => {
    const { value } = event.data;
    if (value) {
      // feeles.openEditor()
      const getFile = () => this.props.findFile(value);
      this.props.selectTab(new Tab({ getFile }));
      this.props.updateCard('EditorCard', { visible: true });
    } else {
      // feeles.closeEditor()
      this.props.updateCard('EditorCard', { visible: false });
    }
  };

  renderBackground() {
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
          onClick={() => this.setLocation()}
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

  handleDocChanged = next => {
    if (next) {
      this.setState({ currentDoc: { [next.id]: next.doc } });
    } else {
      this.setState({ currentDoc: {} });
    }
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
      putFile,
      selectTab,
      openFileDialog,
      localization,
      findFile,
      getConfig,
      reboot,
      cardPropsBag
    } = this.props;
    const styles = getStyles(this.props, this.context);

    const tabs = [];
    const containerWidth = this.tabContainer
      ? this.tabContainer.getBoundingClientRect().width -
        styles.tabContainer.paddingLeft -
        styles.tabContainer.paddingRight
      : 0;
    for (const tab of this.props.tabs) {
      if (tabs.length < MAX_TAB) {
        // current tab でなければ undefined
        const doc = this.state.currentDoc[tab.file.key];
        tabs.push(
          <ChromeTab
            key={tab.key}
            tab={tab}
            file={tab.file}
            tabs={tabs}
            isSelected={tab.isSelected}
            localization={localization}
            handleSelect={selectTab}
            handleClose={this.props.closeTab}
            containerWidth={containerWidth}
            doc={doc}
          />
        );
      }
    }
    const selectedTab = this.props.tabs.find(item => item.isSelected);

    return (
      <Card icon={EditorCard.icon()} {...cardPropsBag} fit width={640}>
        <div style={styles.tabContainer} ref={ref => (this.tabContainer = ref)}>
          {tabs}
        </div>
        <div style={styles.tabContentContainer}>
          <SourceEditor
            fileView={this.props.fileView}
            file={selectedTab.file}
            files={this.props.files}
            getFiles={this.getFiles}
            closeSelectedTab={this.handleCloseSelectedTab}
            selectTabFromFile={this.handleSelectTabFromFile}
            setLocation={this.setLocation}
            href={this.props.href}
            getConfig={getConfig}
            loadConfig={this.props.loadConfig}
            findFile={findFile}
            localization={localization}
            reboot={reboot}
            openFileDialog={openFileDialog}
            putFile={putFile}
            onDocChanged={this.handleDocChanged}
          />
        </div>
      </Card>
    );
  }
}

export { default as Preview } from './Preview';
export { default as SourceEditor } from './SourceEditor';
