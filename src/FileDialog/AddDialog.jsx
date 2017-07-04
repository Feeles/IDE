import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import CodeMirror from 'codemirror';
import 'codemirror/mode/meta';

import { SourceFile } from 'File/';
import { Confirm, Abort } from './Buttons';

const getSeed = type => {
  if (type === 'application/json') {
    return '{}';
  }
  return '\n'.repeat(30);
};

export default class AddDialog extends Component {
  static propTypes = {
    resolve: PropTypes.func.isRequired,
    reject: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired
  };

  state = {
    name: ''
  };

  handleAdd = () => {
    const { name } = this.state;
    const { mime } = CodeMirror.findModeByFileName(name) || {
      mime: 'text/plain'
    };

    this.props.resolve(
      new SourceFile({
        name,
        type: mime,
        text: getSeed(mime)
      })
    );

    this.props.onRequestClose();
  };

  handleUpdateName = (event, name) => {
    this.setState({ name });
  };

  render() {
    const { localization } = this.props;

    const actions = [
      <Abort
        label={localization.addDialog.cancel}
        onTouchTap={this.props.onRequestClose}
      />,
      <Confirm label={localization.addDialog.add} onTouchTap={this.handleAdd} />
    ];

    return (
      <Dialog
        title={localization.addDialog.title}
        actions={actions}
        modal={false}
        open={true}
        onRequestClose={this.props.onRequestClose}
      >
        <TextField
          fullWidth
          value={this.state.name}
          floatingLabelText={localization.addDialog.fileName}
          hintText="main.js"
          onChange={this.handleUpdateName}
        />
      </Dialog>
    );
  }
}
