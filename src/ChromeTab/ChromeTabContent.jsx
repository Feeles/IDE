import React, { Component } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { style, classes } from 'typestyle';

const cn = {
  root: style({
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column'
  }),
  showing: style({
    opacity: 1,
    zIndex: 11
  }),
  hidden: style({
    opacity: 0,
    zIndex: 10
  })
};

const getCn = props => ({
  container: style({
    flex: '1 1 auto',
    borderTop: `1px solid ${props.theme.palette.primary.main}`
  })
});

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
    const dcn = getCn(this.props);
    const { children } = this.props;
    const { show } = this.props;

    return (
      <div className={classes(cn.root, show ? cn.showing : cn.hidden)}>
        <div className={dcn.container}>{children}</div>
      </div>
    );
  }
}
