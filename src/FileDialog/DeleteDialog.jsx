import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
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

    const actions = [
      <Abort key="close" onClick={onRequestClose} />,
      <Confirm key="delete" label="Delete" onClick={this.handleDelete} />
    ];

    return (
      <Dialog
        title={
          <h3>
            Do you really want to delete <b>{content && content.name}</b>?
          </h3>
        }
        actions={actions}
        modal={false}
        open={true}
        onRequestClose={onRequestClose}
        bodyStyle={style}
      >
        <AlertError style={iconStyle} />
        This operation can not be undone.
      </Dialog>
    );
  }
}
