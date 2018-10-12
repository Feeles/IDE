import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TextField from '@material-ui/core/TextField';

import { Confirm, Abort } from './Buttons';

const getStyles = () => {
  return {
    root: {
      fontSize: 16
    },
    left: {
      textAlign: 'right'
    }
  };
};

export default class RenameDialog extends Component {
  static propTypes = {
    resolve: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    content: PropTypes.any
  };

  state = {
    changed: false,
    name: this.props.content.name,
    type: this.props.content.type
  };

  confirm = () => {
    const { onRequestClose, resolve } = this.props;
    const { changed, name, type } = this.state;

    resolve(changed ? { name, type } : {});
    onRequestClose();
  };

  handleNameChange = (event, name) => {
    this.setState({ changed: true, name });
  };

  handleTypeChange = (event, type) => {
    this.setState({ changed: true, type });
  };

  render() {
    const { onRequestClose } = this.props;
    const { changed, name, type } = this.state;

    const { root, left } = getStyles(this.props, this.context);

    return (
      <Dialog open style={root} onClose={onRequestClose}>
        <DialogTitle>File Preference</DialogTitle>
        <DialogContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell style={left}>Name</TableCell>
                <TableCell>
                  <TextField
                    id="name"
                    defaultValue={name}
                    onChange={this.handleNameChange}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={left}>Type</TableCell>
                <TableCell>
                  <TextField
                    id="type"
                    defaultValue={type}
                    onChange={this.handleTypeChange}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Abort onClick={onRequestClose}>Cancel</Abort>
          <Confirm disabled={!changed} onClick={this.confirm}>
            Save
          </Confirm>
        </DialogActions>
      </Dialog>
    );
  }
}
