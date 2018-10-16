import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import red from '@material-ui/core/colors/red';
import ActionRestore from '@material-ui/icons/Restore';

const cn = {
  dialogRoot: style({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: 100
  }),
  error: style({
    margin: 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderStyle: 'double',
    borderColor: red['500'],
    backgroundColor: red['50'],
    overflow: 'hidden'
  }),
  heading: style({
    color: 'rgba(255, 0, 0, .5)'
  }),
  close: style({
    alignSelf: 'flex-end'
  }),
  blank: style({
    flex: '0 0 1rem'
  }),

  messageText: style({
    margin: 8,
    color: red['500'],
    fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace'
  })
};
const getCn = (props, state) => ({
  root: style({
    borderTopWidth: 3,
    borderTopStyle: state.show ? 'double' : 'none',
    borderTopColor: props.theme.palette.primary.main
  }),
  message: style({
    position: 'relative',
    maxHeight: props.error ? (state.expanded ? 1000 : 48) : 0,
    width: '100%',
    boxSizing: 'border-box',
    paddingLeft: 8,
    overflow: 'scroll',
    cursor: 'pointer'
  })
});

@withTheme()
export default class ErrorPane extends PureComponent {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    error: PropTypes.object,
    localization: PropTypes.object.isRequired,
    onRestore: PropTypes.func.isRequired,
    canRestore: PropTypes.bool.isRequired
  };

  state = {
    show: false,
    expanded: false
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

    return (
      <Paper key="error" elevation={2} className={cn.error}>
        <Button
          variant="text"
          color="primary"
          className={cn.close}
          onClick={this.handleClose}
        >
          {localization.common.close}
        </Button>
        <h2 className={cn.heading}>{localization.editorCard.error}</h2>
        <div className={cn.blank} />
        <Button
          variant="contained"
          color="primary"
          onClick={this.handleRestore}
          disabled={!canRestore}
        >
          <ActionRestore />
          {localization.editorCard.restore}
        </Button>
        <div className={cn.blank} />
      </Paper>
    );
  }

  renderAsDock(className) {
    const { expanded } = this.state;
    return (
      <div
        className={className}
        onClick={() => this.setState({ expanded: !expanded })}
      >
        <pre className={cn.messageText}>
          {this.props.error && this.props.error.message}
        </pre>
      </div>
    );
  }

  render() {
    const dcn = getCn(this.props, this.state);
    const { show } = this.state;

    return (
      <div className={dcn.root}>
        {this.renderAsDock(dcn.message)}
        <CSSTransitionGroup
          transitionName={{
            enter: 'zoomInUp',
            enterActive: 'animated',
            leave: 'fadeOut',
            leaveActive: 'animated'
          }}
          transitionEnterTimeout={1000}
          transitionLeaveTimeout={500}
          className={cn.dialogRoot}
        >
          {show ? this.renderAsDialog() : null}
        </CSSTransitionGroup>
      </div>
    );
  }
}
