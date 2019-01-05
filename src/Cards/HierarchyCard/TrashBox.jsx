import React, { PureComponent } from 'react'
import { withTheme } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { style, classes } from 'typestyle'
import { DropTarget } from 'react-dnd'
import IconButton from '@material-ui/core/IconButton'
import ActionDelete from '@material-ui/icons/Delete'
import NavigationArrowBack from '@material-ui/icons/ArrowBack'
import DragTypes from '../../utils/dragTypes'

const cn = {
  icon: style({
    borderWidth: 0,
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: 2
  })
}
const getCn = props => ({
  iconDragOver: style({
    borderTopWidth: props.theme.spacing.unit,
    backgroundColor: props.theme.palette.disabledColor
  })
})

@withTheme()
class _TrashBox extends PureComponent {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    showTrashes: PropTypes.bool.isRequired,
    putFile: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,

    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired
  }

  render() {
    const {
      showTrashes,
      onClick,

      connectDropTarget
    } = this.props

    const { isOver } = this.props

    return connectDropTarget(
      <div>
        <IconButton
          className={classes(cn.icon, isOver && getCn(this.props).iconDragOver)}
          onClick={onClick}
        >
          {showTrashes ? <NavigationArrowBack /> : <ActionDelete />}
        </IconButton>
      </div>
    )
  }
}

const spec = {
  drop(props, monitor) {
    const { putFile } = props
    const { files } = monitor.getItem()

    files.forEach(file => {
      const options = Object.assign({}, file.options, {
        isTrashed: !file.options.isTrashed
      })
      putFile(file, file.set({ options }))
    })
    return {}
  }
}

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver({ shallow: true })
})

const TrashBox = DropTarget(DragTypes.File, spec, collect)(_TrashBox)
export default TrashBox
