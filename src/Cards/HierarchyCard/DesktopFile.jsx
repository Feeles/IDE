import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import { DropTarget } from 'react-dnd';
import HardwareComputer from '@material-ui/icons/Computer';

import DragTypes from '../../utils/dragTypes';

const getStyles = props => {
  const { isOver } = props;
  const { palette, spacing } = props.theme;

  return {
    input: {
      display: 'none'
    },
    icon: {
      borderWidth: 0,
      borderTopWidth: isOver ? spacing.unit : 0,
      borderStyle: 'solid',
      borderColor: 'transparent',
      backgroundColor: isOver ? palette.disabledColor : 'transparent',
      borderRadius: 2
    }
  };
};

@withTheme()
class _DesktopFile extends PureComponent {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    onOpen: PropTypes.func.isRequired,
    saveAs: PropTypes.func.isRequired,

    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired
  };

  handleChange = event => {
    this.props.onOpen(Array.from(event.target.files));
  };

  render() {
    const { connectDropTarget } = this.props;

    const { input, icon } = getStyles(this.props, this.context);

    return connectDropTarget(
      <div>
        <input
          multiple
          type="file"
          style={input}
          ref={ref => ref && (this.input = ref)}
          onChange={this.handleChange}
        />
        <IconButton
          style={icon}
          onClick={() => this.input && this.input.click()}
        >
          <HardwareComputer />
        </IconButton>
      </div>
    );
  }
}

const spec = {
  drop(props, monitor, component) {
    const { files } = monitor.getItem();

    files.reduce((p, c) => {
      return p.then(() => component.props.saveAs(c));
    }, Promise.resolve());

    return {};
  }
};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver({ shallow: true })
});

const DesktopFile = DropTarget(DragTypes.File, spec, collect)(_DesktopFile);
export default DesktopFile;
