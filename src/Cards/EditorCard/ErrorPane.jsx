import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import red from '@material-ui/core/colors/red';
import ActionRestore from '@material-ui/icons/Restore';

export default class ErrorPane extends PureComponent {
  static propTypes = {
    error: PropTypes.object,
    localization: PropTypes.object.isRequired,
    onRestore: PropTypes.func.isRequired,
    canRestore: PropTypes.bool.isRequired
  };

  state = {
    show: false,
    expanded: false
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  componentDidUpdate(prevProps) {
    if (prevProps.error !== this.props.error) {
      this.setState({
        show: !!this.props.error
      });
    }
  }

  handleClose = () => {
    this.setState({ show: false });
  };

  handleRestore = () => {
    this.setState({ show: false }, () => {
      this.props.onRestore();
    });
  };

  renderAsDialog() {
    const { localization, canRestore } = this.props;

    const styles = {
      error: {
        margin: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderStyle: 'double',
        borderColor: red['500'],
        backgroundColor: red['50'],
        overflow: 'hidden'
      },
      heading: {
        color: 'rgba(255, 0, 0, .5)'
      },
      close: {
        alignSelf: 'flex-end'
      },
      blank: {
        flex: '0 0 1rem'
      }
    };

    return (
      <Paper key="error" zDepth={2} style={styles.error}>
        <Button
          variant="flat"
          color="primary"
          label={localization.common.close}
          style={styles.close}
          onClick={this.handleClose}
        />
        <h2 style={styles.heading}>{localization.editorCard.error}</h2>
        <div style={styles.blank} />
        <Button
          variant="raised"
          color="primary"
          icon={<ActionRestore />}
          label={localization.editorCard.restore}
          onClick={this.handleRestore}
          disabled={!canRestore}
        />
        <div style={styles.blank} />
      </Paper>
    );
  }

  renderAsDock() {
    const { expanded } = this.state;
    const styles = {
      message: {
        position: 'relative',
        maxHeight: this.props.error ? (expanded ? 1000 : 48) : 0,
        width: '100%',
        boxSizing: 'border-box',
        paddingLeft: 8,
        overflow: 'scroll',
        cursor: 'pointer'
      },
      messageText: {
        margin: 8,
        color: red['500'],
        fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace'
      }
    };
    return (
      <div
        style={styles.message}
        onClick={() => this.setState({ expanded: !expanded })}
      >
        <pre style={styles.messageText}>
          {this.props.error && this.props.error.message}
        </pre>
      </div>
    );
  }

  render() {
    const { show } = this.state;
    const { palette } = this.context.muiTheme;
    const styles = {
      root: {
        borderTopStyle: show ? 'double' : 'none',
        borderTopWidth: 3,
        borderTopColor: palette.primary1Color
      },
      dialogRoot: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 100
      }
    };

    return (
      <div style={styles.root}>
        {this.renderAsDock()}
        <CSSTransitionGroup
          transitionName={{
            enter: 'zoomInUp',
            enterActive: 'animated',
            leave: 'fadeOut',
            leaveActive: 'animated'
          }}
          transitionEnterTimeout={1000}
          transitionLeaveTimeout={500}
          style={styles.dialogRoot}
        >
          {show ? this.renderAsDialog() : null}
        </CSSTransitionGroup>
      </div>
    );
  }
}
