import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { separate } from '../../File/';

const cn = {
  root: style({
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'baseline'
  }),
  textField: style({
    width: 'auto',
    flex: '0 1 auto',
    height: 40
  })
};

export default class Filename extends PureComponent {
  static propTypes = {
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

    const { path, plane, ext, name } = separate(file.name);

    return (
      <div className={cn.root}>
        <Typography color="textSecondary">{path}</Typography>
        {isEditing ? (
          <TextField
            id={name}
            defaultValue={plane}
            ref={this.handleInput}
            className={cn.textField}
            onClick={this.handleTextFieldTap}
          />
        ) : (
          <Typography color="textPrimary" onClick={this.handleDoubleTap}>
            {plane}
          </Typography>
        )}
        <Typography color="textSecondary" variant="caption">
          {ext}
        </Typography>
      </div>
    );
  }
}
