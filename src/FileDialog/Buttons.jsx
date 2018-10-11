import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';

const Confirm = props => {
  const style = Object.assign({ marginRight: 20 }, props.style);
  return <Button variant="contained" {...props} style={style} />;
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
  return <Button variant="text" {...props} style={style} />;
};

Abort.propTypes = {
  onClick: PropTypes.func.isRequired,
  style: PropTypes.object
};

Abort.defaultProps = {
  label: 'Cancel'
};

export { Confirm, Abort };
