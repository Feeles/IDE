import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';

// Timeout [ms] 間 resolve がなければ、次の resolve まで hide
const Timeout = 1000;

export default class ResolveProgress extends PureComponent {
  static propTypes = {
    size: PropTypes.number.isRequired,
    globalEvent: PropTypes.object.isRequired
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  state = {
    visible: false
  };

  componentDidMount() {
    const { globalEvent } = this.props;
    globalEvent.on('message.resolve', this.handleResolve);
  }

  _timer = null;
  handleResolve = () => {
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

    return (
      <CircularProgress
        size={this.props.size}
        thickness={Math.max(1, this.props.size / 8)}
        color="primary"
      />
    );
  }
}
