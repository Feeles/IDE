import React, { Component } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const getStyles = props => {
  const { show } = props;
  const { palette } = props.theme;

  return {
    root: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      opacity: show ? 1 : 0,
      backgroundColor: 'transparent',
      zIndex: show ? 11 : 10,
      display: 'flex',
      flexDirection: 'column'
    },
    container: {
      flex: '1 1 auto',
      borderTop: `1px solid ${palette.primary.main}`
    }
  };
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

    const { root, container } = getStyles(this.props, this.context);

    return (
      <div style={root}>
        <div style={container}>{children}</div>
      </div>
    );
  }
}
