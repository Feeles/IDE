import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import FlatButton from 'material-ui/FlatButton';
import AlertError from 'material-ui/svg-icons/alert/error';
import { red50, red500 } from 'material-ui/styles/colors';

export default class ErrorPane extends PureComponent {
  static propTypes = {
    error: PropTypes.object,
    localization: PropTypes.object.isRequired,
    onRestore: PropTypes.func.isRequired
  };

  render() {
    const { error, localization, onRestore } = this.props;

    const styles = {
      group: {
        flex: 0,
        backgroundColor: 'rgb(245, 245, 245)'
      },
      root: {
        height: 120,
        borderStyle: 'double',
        borderColor: red500,
        backgroundColor: red50,
        overflow: 'scroll'
      },
      heading: {
        display: 'flex',
        alignItems: 'center',
        color: red500
      },
      errorIcon: {
        marginLeft: 4,
        marginRight: 4
      },
      restore: {
        color: red500
      },
      blank: {
        flex: 1
      },
      message: {
        color: red500,
        margin: 0,
        padding: 8,
        paddingTop: 0,
        fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace'
      }
    };

    return (
      <CSSTransitionGroup
        transitionName={{
          enter: 'zoomInUp',
          enterActive: 'animated',
          leave: 'fadeOut',
          leaveActive: 'animated'
        }}
        transitionEnterTimeout={1000}
        transitionLeaveTimeout={500}
        style={styles.groups}
      >
        {error
          ? <div key="error" style={styles.root}>
              <div style={styles.heading}>
                <AlertError
                  key="alert"
                  color={red500}
                  style={styles.errorIcon}
                />
                <span>{localization.editorCard.error}</span>
                <div style={styles.blank} />
                <FlatButton
                  label={localization.editorCard.restore}
                  style={styles.restore}
                  onTouchTap={onRestore}
                />
              </div>
              <pre style={styles.message}>{error.message}</pre>
            </div>
          : null}
      </CSSTransitionGroup>
    );
  }
}
