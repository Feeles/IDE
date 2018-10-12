import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import ContentCreate from '@material-ui/icons/Create';

const getStyles = props => {
  const { palette } = props.theme;

  return {
    hint: {
      color: palette.text.secondary,
      fontStyle: 'italic',
      fontSize: '.8em',
      borderBottom: `1px dashed ${palette.text.secondary}`
    },
    label: {
      fontSize: 16
    }
  };
};

@withTheme()
export default class EditableLabel extends PureComponent {
  static propTypes = Object.assign(
    {
      theme: PropTypes.object.isRequired,
      openImmediately: PropTypes.bool.isRequired,
      tapTwiceQuickly: PropTypes.string.isRequired,
      onEditEnd: PropTypes.func
    },
    TextField.propTypes
  );

  static defaultProps = {
    openImmediately: false,
    tapTwiceQuickly: 'Tap twice quickly'
  };

  state = {
    isEditing: this.props.openImmediately
  };

  touched = false;
  handleTouch = () => {
    if (this.touched) {
      this.setState({ isEditing: true });
    }
    this.touched = true;
    setTimeout(() => (this.touched = false), 200);
  };

  handleBlur = () => {
    this.setState({ isEditing: false });
  };

  handleKeyPress = () => {
    if (event.key === 'Enter') {
      this.setState({ isEditing: false });
    }
  };

  componentDidMount() {
    if (this.props.openImmediately && this.input) {
      this.input.focus();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.input) return;

    if (!prevState.isEditing && this.state.isEditing) {
      this.input.focus();
    }
    if (prevState.isEditing && !this.state.isEditing) {
      this.props.onEditEnd(this.input.value);
    }
  }

  render() {
    const { isEditing } = this.state;
    const { value, defaultValue } = this.props;

    const labelText = value || defaultValue;

    const { hint, label } = getStyles(this.props, this.context);

    const style = Object.assign({}, label, this.props.style);

    const props = Object.assign({}, this.props);
    delete props.onEditEnd;
    delete props.tapTwiceQuickly;
    delete props.openImmediately;

    return isEditing ? (
      <TextField
        {...props}
        ref={ref => ref && (this.input = ref.input)}
        onBlur={this.handleBlur}
        onKeyPress={this.handleKeyPress}
      />
    ) : labelText ? (
      <div style={style} onClick={this.handleTouch}>
        {labelText}
      </div>
    ) : (
      <div style={hint} onClick={this.handleTouch}>
        <ContentCreate />
        {this.props.tapTwiceQuickly}
      </div>
    );
  }
}
