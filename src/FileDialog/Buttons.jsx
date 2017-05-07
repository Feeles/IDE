import React from 'react';
import PropTypes from 'prop-types';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

const Confirm = props => {
  const style = Object.assign({}, commonStyle, props.style);
  return <RaisedButton {...props} style={style} />;
};

Confirm.propTypes = {
  label: PropTypes.string.isRequired,
  onTouchTap: PropTypes.func.isRequired
};

Confirm.defaultProps = {
  primary: true
};

const Abort = props => {
  const style = Object.assign({}, commonStyle, props.style);
  return <FlatButton {...props} style={style} />;
};

Abort.propTypes = {
  onTouchTap: PropTypes.func.isRequired
};

Abort.defaultProps = {
  label: 'Cancel'
};

const commonStyle = {
  marginRight: 20
};

export { Confirm, Abort, commonStyle };
