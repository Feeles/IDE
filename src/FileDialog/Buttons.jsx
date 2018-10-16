import React from 'react';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import Button from '@material-ui/core/Button';

const cn = {
  root: style({
    marginRight: 20
  })
};

const Confirm = props => {
  return <Button variant="contained" className={cn.root} {...props} />;
};

Confirm.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  style: PropTypes.object
};

Confirm.defaultProps = {
  color: 'primary'
};

const Abort = props => {
  return <Button variant="text" className={cn.root} {...props} />;
};

Abort.propTypes = {
  onClick: PropTypes.func.isRequired,
  style: PropTypes.object
};

Abort.defaultProps = {
  children: 'Cancel'
};

export { Confirm, Abort };
