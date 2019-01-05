import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import EditorModeEdit from '@material-ui/icons/Edit'

export default class EditFile extends PureComponent {
  static propTypes = {
    filePath: PropTypes.string.isRequired,
    localization: PropTypes.object.isRequired,
    globalEvent: PropTypes.object.isRequired
  }

  handleEdit = () => {
    const { filePath, localization } = this.props

    if (confirm(localization.common.wantToOpen(filePath))) {
      this.props.globalEvent.emit('message.editor', {
        data: {
          value: filePath
        }
      })
    }
  }

  render() {
    const { localization } = this.props

    return (
      <Button variant="text" onClick={this.handleEdit}>
        <EditorModeEdit />
        {localization.common.editFile}
      </Button>
    )
  }
}
