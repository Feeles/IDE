import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import red from '@material-ui/core/colors/red';

import SvgButton from './SvgButton';

const cn = {
  root: style({
    position: 'absolute',
    width: '100%',
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: red['500'],
    zIndex: 3000
  }),
  button: style({
    alignSelf: 'flex-end'
  }),
  pre: style({
    width: '100%',
    maxHeight: '8rem',
    color: 'white',
    overflow: 'scroll',
    fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace'
  })
};

export default class ErrorMessage extends PureComponent {
  static propTypes = {
    error: PropTypes.object
  };

  static defaultProps = {
    error: null
  };

  state = {
    open: false
  };

  get message() {
    return this.props.error ? this.props.error.message : '';
  }

  componentDidUpdate(prevProps) {
    if (prevProps.error !== this.props.error) {
      this.setState({
        open: this.props.error !== null
      });
    }
  }

  handleClose = () => {
    this.setState({
      open: false
    });
  };

  render() {
    return this.state.open ? (
      <div className={cn.root}>
        <SvgButton className={cn.button} onClick={this.handleClose}>
          {
            'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'
          }
        </SvgButton>
        <pre className={cn.pre}>{this.message}</pre>
      </div>
    ) : null;
  }
}
