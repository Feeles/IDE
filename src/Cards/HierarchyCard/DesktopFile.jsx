import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import IconButton from '@material-ui/core/IconButton';
import { DropTarget } from 'react-dnd';
import HardwareComputer from '@material-ui/icons/Computer';

import DragTypes from '../../utils/dragTypes';

const cn = {
  input: style({
    display: 'none'
  })
};
const getCn = props => ({
  icon: style({
    borderWidth: 0,
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: 2,
    borderTopWidth: props.isOver ? props.theme.spacing.unit : 0,
    backgroundColor: props.isOver
      ? props.theme.palette.disabledColor
      : 'transparent'
  })
});

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
    const dcn = getCn(this.props);
    const { connectDropTarget } = this.props;

    return connectDropTarget(
      <div>
        <input
          multiple
          type="file"
          className={cn.input}
          ref={ref => ref && (this.input = ref)}
          onChange={this.handleChange}
        />
        <IconButton
          className={dcn.icon}
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
