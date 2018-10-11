import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import AlertError from '@material-ui/icons/Error';
import red from '@material-ui/core/colors/red';

import { Confirm, Abort } from './Buttons';

export default class DeleteDialog extends Component {
  static propTypes = {
    resolve: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    content: PropTypes.any
  };

  constructor(props) {
    super(props);
  }

  handleDelete = () => {
    const { resolve, onRequestClose, content } = this.props;
    resolve(content);
    onRequestClose();
  };

  render() {
    const { onRequestClose, content } = this.props;

    const style = {
      textAlign: 'center'
    };

    const iconStyle = {
      marginRight: 10,
      marginBottom: -6,
      color: red['400']
    };

    return (
      <Dialog open onClose={onRequestClose}>
        <DialogTitle>
          Do you really want to delete <b>{content && content.name}</b>?
        </DialogTitle>
        <DialogContent style={style}>
          <AlertError style={iconStyle} />
          This operation can not be undone.
        </DialogContent>
        <DialogActions>
          <Abort onClick={onRequestClose}>Cancel</Abort>,
          <Confirm onClick={this.handleDelete}>Delete</Confirm>
        </DialogActions>
      </Dialog>
    );
  }
}
