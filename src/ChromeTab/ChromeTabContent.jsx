import React, { Component } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { style } from 'typestyle';

const cn = {
  root: style({
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column'
  }),
  container: style({
    flex: '1 1 auto'
  })
};

@withTheme()
export default class ChromeTabContent extends Component {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired
  };

  shouldComponentUpdate(nextProps) {
    if (!this.props.show && !nextProps.show) {
      return false;
    }
    return true;
  }

  render() {
    const { children } = this.props;
    const { show } = this.props;
    const { palette } = this.props.theme;

    return (
      <div
        className={cn.root}
        style={{
          opacity: show ? 1 : 0,
          zIndex: show ? 11 : 10
        }}
      >
        <div
          className={cn.container}
          style={{
            borderTop: `1px solid ${palette.primary.main}`
          }}
        >
          {children}
        </div>
      </div>
    );
  }
}
