import React, { PureComponent } from 'react';
import { style } from 'typestyle';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import ContentAdd from '@material-ui/icons/Add';
import includes from 'lodash/includes';

import Card from '../CardWindow';
import CardFloatingBar from '../CardFloatingBar';
import { makeFromFile } from '../../File/';
import { AddDialog } from '../../FileDialog/';
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
    saveAs: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    cardPropsBag: PropTypes.object.isRequired,
    globalEvent: PropTypes.object.isRequired
  };

  state = {
    openedPaths: [''],
    filter: () => false
  };

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
    this.props.globalEvent.emit('message.editor', {
      data: {
        value: file.name
      }
    });
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

    const transfer = {
      openFileDialog,
      putFile,
      isDirOpened: this.isDirOpened,
      handleFileSelect: this.handleFileSelect,
      handleDirToggle: this.handleDirToggle,
      handleFileMove: this.handleFileMove,
      handleNativeDrop: this.handleNativeDrop
    };

    return (
      <Card {...this.props.cardPropsBag} fit>
        <CardFloatingBar>
          {this.props.localization.hierarchyCard.title}
        </CardFloatingBar>
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
