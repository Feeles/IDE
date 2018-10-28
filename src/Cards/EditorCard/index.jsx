import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import Button from '@material-ui/core/Button';
import AVPlayCircleOutline from '@material-ui/icons/PlayCircleOutline';

import Card from '../CardWindow';
import SourceEditor from './SourceEditor';
import { Tab } from '../../ChromeTab/';

const cn = {
  largeIcon: style({
    width: 40,
    height: 40
  }),
  large: style({
    width: 80,
    height: 80,
    padding: 20
  })
};
const getCn = props => ({
  noFileBg: style({
    flex: '1 1 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: props.theme.palette.primary.main
  })
});

@withTheme()
export default class EditorCard extends PureComponent {
  static propTypes = {
    theme: PropTypes.object.isRequired,
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
    cardProps: PropTypes.object.isRequired,
    setCardVisibility: PropTypes.func.isRequired,
    globalEvent: PropTypes.object.isRequired
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
      const { init } = this.props.cardProps.EditorCard;
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
      this.props.setCardVisibility('EditorCard', true);
    } else {
      // feeles.closeEditor()
      this.props.setCardVisibility('EditorCard', false);
    }
  };

  renderBackground(className) {
    return (
      <div className={className}>
        <Button
          variant="contained"
          size="large"
          onClick={() => this.setLocation()}
        >
          Feeles
          <AVPlayCircleOutline className={cn.largeIcon} />
        </Button>
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
    const dcn = getCn(this.props);
    if (!this.props.tabs.length) {
      return (
        <Card {...this.props.cardPropsBag} fit>
          {this.renderBackground(dcn.noFileBg)}
        </Card>
      );
    }

    const {
      putFile,
      openFileDialog,
      localization,
      findFile,
      getConfig,
      reboot,
      cardPropsBag
    } = this.props;

    const selectedTab = this.props.tabs.find(item => item.isSelected);

    return (
      <Card {...cardPropsBag} fit width={640}>
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
          selectTab={this.props.selectTab}
          closeTab={this.props.closeTab}
          tabs={this.props.tabs}
        />
      </Card>
    );
  }
}

export { default as Preview } from './Preview';
export { default as SourceEditor } from './SourceEditor';
