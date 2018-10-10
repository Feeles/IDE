import React from 'react';
import PropTypes from 'prop-types';
import FlatButton from '@material-ui/core/FlatButton';
import RaisedButton from '@material-ui/core/RaisedButton';

const Confirm = props => {
  const style = Object.assign({ marginRight: 20 }, props.style);
  return <RaisedButton {...props} style={style} />;
};

Confirm.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  style: PropTypes.object
};

Confirm.defaultProps = {
  primary: true
};

const Abort = props => {
  const style = Object.assign({ marginRight: 20 }, props.style);
  return <FlatButton {...props} style={style} />;
};

Abort.propTypes = {
  onClick: PropTypes.func.isRequired,
  style: PropTypes.object
};

Abort.defaultProps = {
  label: 'Cancel'
};

export { Confirm, Abort };
