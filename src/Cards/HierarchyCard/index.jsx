import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import FileFolderOpen from 'material-ui/svg-icons/file/folder-open';
import ContentAdd from 'material-ui/svg-icons/content/add';
import includes from 'lodash/includes';

import Card from '../CardWindow';
import { makeFromFile } from '../../File/';
import { SignDialog, AddDialog } from '../../FileDialog/';
import { Tab } from '../../ChromeTab/';
import Root from './Root';
import SearchBar from './SearchBar';

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

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  static icon() {
    return <FileFolderOpen />;
  }

  state = {
    openedPaths: [''],
    tabbedFiles: [],
    filter: file => false
  };

  componentWillReceiveProps(nextProps) {
    if (
      this.props.files !== nextProps.files ||
      this.props.tabs !== nextProps.tabs
    ) {
      this.setState({
        tabbedFiles: nextProps.tabs.map(tab => tab.file)
      });
    }
  }

  handleNativeDrop = (files, dir = null) => {
    const { addFile, selectTab, openFileDialog } = this.props;

    Promise.all(files.map(makeFromFile))
      .then(files =>
        openFileDialog(SignDialog, {
          content: files,
          getFiles: () => this.props.files
        })
      )
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
    const {
      files,
      selectTab,
      putFile,
      openFileDialog,
      localization
    } = this.props;
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

    const styles = {
      button: {
        margin: 16,
        alignSelf: 'flex-end'
      }
    };

    return (
      <Card icon={HierarchyCard.icon()} {...this.props.cardPropsBag} fit>
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
        <FloatingActionButton
          mini
          style={styles.button}
          onClick={this.handleAdd}
        >
          <ContentAdd />
        </FloatingActionButton>
      </Card>
    );
  }
}
