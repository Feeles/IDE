import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';

import { separate } from 'File/';

const getStyles = (props, context) => {
  const { palette } = context.muiTheme;

  return {
    root: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'baseline'
    },
    path: {
      color: palette.secondaryTextColor
    },
    plane: {
      color: palette.textColor
    },
    ext: {
      color: palette.secondaryTextColor,
      fontSize: '.8em',
      paddingLeft: 4
    },
    textField: {
      width: 'auto',
      flex: '0 1 auto',
      height: 40
    }
  };
};

export default class Filename extends PureComponent {
  static propTypes = {
    file: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  state = {
    isEditing: false
  };

  handleInput = ref => {
    const { file, onChange } = this.props;

    if (!ref) return;
    ref.input.onchange = ({ target }) => {
      onChange(file, target.value);
      this.setState({ isEditing: false });
    };
    ref.input.onblur = event => {
      this.setState({ isEditing: false });
    };
  };

  touchFlag = false;
  handleDoubleTap = event => {
    event.stopPropagation();

    if (this.touchFlag) {
      this.setState({ isEditing: true });
      return;
    }
    this.touchFlag = true;
    setTimeout(() => (this.touchFlag = false), 200);
  };

  handleTextFieldTap = event => {
    event.stopPropagation();
  };

  render() {
    const { file } = this.props;
    const { isEditing } = this.state;
    const { prepareStyles } = this.context.muiTheme;

    const styles = getStyles(this.props, this.context);

    const { path, plane, ext, name } = separate(file.name);

    return (
      <div style={prepareStyles(styles.root)}>
        <span style={prepareStyles(styles.path)}>{path}</span>
        {isEditing
          ? <TextField
              id={name}
              defaultValue={plane}
              ref={this.handleInput}
              style={styles.textField}
              onTouchTap={this.handleTextFieldTap}
            />
          : <span
              onTouchTap={this.handleDoubleTap}
              style={prepareStyles(styles.plane)}
            >
              {plane}
            </span>}
        <span style={prepareStyles(styles.ext)}>{ext}</span>
      </div>
    );
  }
}
