import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import IconButton from '@material-ui/core/IconButton';
import ActionDelete from '@material-ui/core/icons/delete';
import NavigationArrowBack from '@material-ui/core/icons/arrow-back';
import DragTypes from '../../utils/dragTypes';

const getStyles = (props, state, context) => {
  const { isOver } = props;
  const { palette, spacing } = context.muiTheme;

  return {
    icon: {
      borderWidth: 0,
      borderTopWidth: isOver ? spacing.desktopGutterMini : 0,
      borderStyle: 'solid',
      borderColor: 'transparent',
      backgroundColor: isOver ? palette.disabledColor : 'transparent',
      borderRadius: 2
    }
  };
};

class _TrashBox extends PureComponent {
  static propTypes = {
    showTrashes: PropTypes.bool.isRequired,
    putFile: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,

    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  render() {
    const {
      showTrashes,
      onClick,

      connectDropTarget
    } = this.props;
    const { palette } = this.context.muiTheme;

    const { icon } = getStyles(this.props, this.state, this.context);

    return connectDropTarget(
      <div>
        <IconButton style={icon} onClick={onClick}>
          {showTrashes ? (
            <NavigationArrowBack color={palette.secondaryTextColor} />
          ) : (
            <ActionDelete color={palette.secondaryTextColor} />
          )}
        </IconButton>
      </div>
    );
  }
}

const spec = {
  drop(props, monitor) {
    const { putFile } = props;
    const { files } = monitor.getItem();

    files.forEach(file => {
      const options = Object.assign({}, file.options, {
        isTrashed: !file.options.isTrashed
      });
      putFile(file, file.set({ options }));
    });
    return {};
  }
};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver({ shallow: true })
});

const TrashBox = DropTarget(DragTypes.File, spec, collect)(_TrashBox);
export default TrashBox;
