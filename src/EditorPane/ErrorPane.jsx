import React, { PureComponent, PropTypes } from 'react';
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
    if (!error) {
      return null;
    }

    const styles = {
      root: {
        flex: '0 1 120px',
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
      <div style={styles.root}>
        <div style={styles.heading}>
          <AlertError color={red500} style={styles.errorIcon} />
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
    );
  }
}
