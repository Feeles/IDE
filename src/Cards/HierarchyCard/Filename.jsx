import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import TextField from '@material-ui/core/TextField';

import { separate } from '../../File/';

const cn = {
  root: style({
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'baseline'
  }),
  ext: style({
    fontSize: '.8em',
    paddingLeft: 4
  }),
  textField: style({
    width: 'auto',
    flex: '0 1 auto',
    height: 40
  })
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
    const { palette } = this.props.theme;

    const { path, plane, ext, name } = separate(file.name);

    return (
      <div className={cn.root}>
        <span
          style={{
            color: palette.text.secondary
          }}
        >
          {path}
        </span>
        {isEditing ? (
          <TextField
            id={name}
            defaultValue={plane}
            ref={this.handleInput}
            className={cn.textField}
            onClick={this.handleTextFieldTap}
          />
        ) : (
          <span
            onClick={this.handleDoubleTap}
            style={{
              color: palette.text.primary
            }}
          >
            {plane}
          </span>
        )}
        <span
          className={cn.ext}
          style={{
            color: palette.text.secondary
          }}
        >
          {ext}
        </span>
      </div>
    );
  }
}
