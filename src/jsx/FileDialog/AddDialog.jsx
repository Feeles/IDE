import React, { Component, PropTypes } from 'react';
import { Dialog } from 'material-ui';


import { Confirm, Abort } from './Buttons';
import FilenameInput from './FilenameInput';

export default class AddDialog extends Component {

  static propTypes = {
    resolve: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired
  };

  handleAdd = () => {
    const { resolve, onRequestClose } = this.props;

    resolve({ name: this.input.name, filename: this.input.value, code: '', isOpened: true });
    onRequestClose();
  };

  render() {
    const { onRequestClose } = this.props;

    const actions = [
      <Abort onTouchTap={onRequestClose} />,
      <Confirm label="Add" onTouchTap={this.handleAdd} />
    ];

    return (
      <Dialog
        title="Add new file"
        actions={actions}
        modal={false}
        open={true}
        onRequestClose={onRequestClose}
      >
        <FilenameInput ref={(input) => this.input = input} />
      </Dialog>
    );
  }
}
