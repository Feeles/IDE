import React, { PureComponent } from 'react';
import { style } from 'typestyle';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import ContentAdd from '@material-ui/icons/Add';
import includes from 'lodash/includes';

import Card from '../CardWindow';
import { makeFromFile } from '../../File/';
import { AddDialog } from '../../FileDialog/';
import { Tab } from '../../ChromeTab/';
import Root from './Root';
import SearchBar from './SearchBar';

const cn = {
  button: style({
    margin: 16,
    alignSelf: 'flex-end'
  })
};

export default class HierarchyCard extends PureComponent {
  static propTypes = {
    files: PropTypes.array.isRequired,
    tabs: PropTypes.array.isRequired,
    addFile: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,
    deleteFile: PropTypes.func.isRequired,
    findFile: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired,
    closeTab: PropTypes.func.isRequired,
    saveAs: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    cardPropsBag: PropTypes.object.isRequired
  };

  state = {
    openedPaths: [''],
    tabbedFiles: [],
    filter: () => false
  };

  componentDidUpdate(prevProps) {
    if (
      prevProps.files !== this.props.files ||
      prevProps.tabs !== this.props.tabs
    ) {
      this.setState({
        tabbedFiles: this.props.tabs.map(tab => tab.file)
      });
    }
  }

  handleNativeDrop = (files, dir = null) => {
    const { addFile } = this.props;

    Promise.all(files.map(makeFromFile))
      .then(files => {
        files = files.map(file => (dir ? file.move(dir.path) : file));
        return Promise.all(files.map(addFile));
      })
      .then(files => {
        files = files.slice(0, 5);
        return Promise.all(files.map(this.handleFileSelect));
      });
  };

  handleDirToggle = dir => {
    const openedPaths = this.isDirOpened(
      dir,
      this.state.openedPaths.filter(path => path !== dir.path),
      this.state.openedPaths.concat(dir.path)
    );
    this.setState({ openedPaths });
  };

  handleFileMove = (file, dir) => {
    const { putFile } = this.props;

    return putFile(file, file.move(dir.path));
  };

  handleFileSelect = file => {
    const { selectTab, closeTab, tabs, findFile } = this.props;
    if (file.is('text')) {
      // SourceFile
      const getFile = () => findFile(({ key }) => key === file.key);
      const tab = new Tab({ getFile });

      const selected = tabs.find(tab => tab.isSelected);

      if (selected && selected.is(tab)) {
        closeTab(selected);
      } else {
        selectTab(tab);
      }
    } else {
      // BinaryFile
      try {
        window.open(file.blobURL, file.blobURL);
      } catch (e) {
        // continue regardless of error
      }
    }
  };

  isDirOpened = (dir, passed, failed) => {
    return includes(this.state.openedPaths, dir.path) ? passed : failed;
  };

  handleDelete = () => {
    this.props.deleteFile(...this.props.files.filter(this.state.filter));
  };

  handleAdd = async () => {
    const file = await this.props.openFileDialog(AddDialog);
    if (file) {
      await this.props.addFile(file);
      await this.handleFileSelect(file);
    }
  };

  render() {
    const { files, putFile, openFileDialog, localization } = this.props;
    const { filter } = this.state;

    const tabs = this.props.tabs.filter(tab => !tab.props.component);
    const selected = tabs.find(tab => tab.isSelected);

    const transfer = {
      selectedFile: selected && selected.file,
      tabbedFiles: this.state.tabbedFiles,
      openFileDialog,
      putFile,
      isDirOpened: this.isDirOpened,
      handleFileSelect: this.handleFileSelect,
      handleDirToggle: this.handleDirToggle,
      handleFileMove: this.handleFileMove,
      handleNativeDrop: this.handleNativeDrop
    };

    return (
      <Card
        icon={this.props.localization.hierarchyCard.title}
        {...this.props.cardPropsBag}
        fit
      >
        <SearchBar
          files={files}
          filterRef={filter => this.setState({ filter })}
          putFile={putFile}
          deleteAll={this.handleDelete}
          onOpen={this.handleNativeDrop}
          openFileDialog={openFileDialog}
          saveAs={this.props.saveAs}
          localization={localization}
        />
        <Root files={files.filter(filter)} {...transfer} />
        <Button
          variant="fab"
          mini
          className={cn.button}
          onClick={this.handleAdd}
        >
          <ContentAdd />
        </Button>
      </Card>
    );
  }
}
