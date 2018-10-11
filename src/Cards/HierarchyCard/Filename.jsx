import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';

import { separate } from '../../File/';

const getStyles = props => {
  const { palette } = props.theme;

  return {
    root: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'baseline'
    },
    path: {
      color: palette.text.secondary
    },
    plane: {
      color: palette.text.primary
    },
    ext: {
      color: palette.text.secondary,
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

@withTheme()
export default class Filename extends PureComponent {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    file: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
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
    ref.input.onblur = () => {
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

    const styles = getStyles(this.props, this.context);

    const { path, plane, ext, name } = separate(file.name);

    return (
      <div style={styles.root}>
        <span style={styles.path}>{path}</span>
        {isEditing ? (
          <TextField
            id={name}
            defaultValue={plane}
            ref={this.handleInput}
            style={styles.textField}
            onClick={this.handleTextFieldTap}
          />
        ) : (
          <span onClick={this.handleDoubleTap} style={styles.plane}>
            {plane}
          </span>
        )}
        <span style={styles.ext}>{ext}</span>
      </div>
    );
  }
}
