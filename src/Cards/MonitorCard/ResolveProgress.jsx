import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import CircularProgress from 'material-ui/CircularProgress';

// Timeout [ms] 間 resolve がなければ、次の resolve まで hide
const Timeout = 2000;

export default class ResolveProgress extends PureComponent {
  static propTypes = {
    globalEvent: PropTypes.object.isRequired
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  state = {
    visible: false
  };

  componentWillMount() {
    const { globalEvent } = this.props;
    globalEvent.on('message.resolve', this.handleResolve);
  }

  _timer = null;
  handleResolve = ({ data }) => {
    if (!this.state.visible) {
      this.setState({ visible: true });
    }
    clearInterval(this._timer);
    this._timer = setTimeout(() => {
      this.setState({ visible: false });
    }, Timeout);
  };

  render() {
    if (!this.state.visible) {
      return null;
    }
    const { palette } = this.context.muiTheme;

    return (
      <CircularProgress
        size={100}
        thickness={8}
        color={palette.primary1Color}
      />
    );
  }
}
