import React from 'react'
import PropTypes from 'prop-types'
import { style } from 'typestyle'
import Button from '@material-ui/core/Button'
import HardwareKeyboardBackspace from '@material-ui/icons/KeyboardBackspace'
import Fullscreen from '@material-ui/icons/Fullscreen'
import FullscreenExit from '@material-ui/icons/FullscreenExit'
import Layers from '@material-ui/icons/Layers'
import LayersClear from '@material-ui/icons/LayersClear'
import Check from '@material-ui/icons/Check'
import Collapse from '@material-ui/core/Collapse'

import PlayMenu from './PlayMenu'
import CardFloatingBar from '../CardFloatingBar'
import { IconButton, withTheme } from '@material-ui/core'
import SelectTab from './SelectTab'

const cn = {
  blank: style({
    flex: '1 1 auto'
  }),
  icon: style({
    height: 44
  })
}

const getCn = props => ({
  icon: style({
    color: props.theme.typography.button.color
  }),
  editorMenuContainerClasses: {
    wrapperInner: style({
      display: 'flex',
      justifyContent: 'space-between',
      padding: props.isExpandingEditorCard ? 0 : props.theme.spacing.unit,
      paddingTop: 0
    })
  },
  button: style({
    marginRight: props.theme.spacing.unit,
    minWidth: 32
  })
})

@withTheme()
export default class MenuBar extends React.Component {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    localization: PropTypes.object.isRequired,
    getFiles: PropTypes.func.isRequired,
    href: PropTypes.string.isRequired,
    handleUndo: PropTypes.func.isRequired,
    runApp: PropTypes.func.isRequired,
    hasChanged: PropTypes.bool.isRequired,
    hasHistory: PropTypes.bool.isRequired,
    tabs: PropTypes.array.isRequired,
    filePath: PropTypes.string.isRequired,
    showLineWidget: PropTypes.bool.isRequired,
    setShowLineWidget: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    iconUrl: PropTypes.string.isRequired,
    filePathToBack: PropTypes.string.isRequired,
    globalEvent: PropTypes.object.isRequired,
    isExpandingEditorCard: PropTypes.bool.isRequired,
    setExpandingEditorCard: PropTypes.func.isRequired
  }

  toggleLineWidget = () => {
    const { showLineWidget } = this.props
    this.props.setShowLineWidget(!showLineWidget)
  }

  handleBack = () => {
    this.props.runApp()
    this.props.globalEvent.emit('message.editor', {
      data: { value: this.props.filePathToBack }
    })
  }

  toggleExpandingEditorCard = () => {
    this.props.setExpandingEditorCard(!this.props.isExpandingEditorCard)
  }

  render() {
    const dcn = getCn(this.props)
    const {
      filePath,
      filePathToBack,
      iconUrl,
      isExpandingEditorCard
    } = this.props

    const showBackButton = filePath !== filePathToBack

    return (
      <>
        <CardFloatingBar>
          {this.props.localization.editorCard.title}
          {iconUrl ? <img src={iconUrl} alt="" className={cn.icon} /> : null}
          <div className={cn.blank} />
          <Button
            variant={isExpandingEditorCard ? 'contained' : 'outlined'}
            color="primary"
            size="small"
            className={dcn.button}
            onClick={this.toggleExpandingEditorCard}
          >
            {isExpandingEditorCard ? <FullscreenExit /> : <Fullscreen />}
          </Button>
          {showBackButton ? null : (
            <SelectTab
              filePath={filePath}
              tabs={this.props.tabs}
              globalEvent={this.props.globalEvent}
              localization={this.props.localization}
              className={dcn.button}
            />
          )}
          {showBackButton ? (
            <Button
              variant="contained"
              size="small"
              color="primary"
              onClick={this.handleBack}
              className={dcn.button}
            >
              <Check />
              {this.props.localization.editorCard.stopEditing(this.props.label)}
            </Button>
          ) : null}
          <PlayMenu
            getFiles={this.props.getFiles}
            runApp={this.props.runApp}
            href={this.props.href}
            localization={this.props.localization}
            hasChanged={this.props.hasChanged}
          />
        </CardFloatingBar>
        <Collapse
          in={!isExpandingEditorCard}
          classes={dcn.editorMenuContainerClasses}
        >
          <Button
            variant="outlined"
            size="small"
            disabled={!this.props.hasHistory}
            onClick={this.props.handleUndo}
            className={dcn.button}
          >
            <HardwareKeyboardBackspace />
            {this.props.localization.editorCard.undo}
          </Button>
          <div className={cn.blank} />
          <IconButton onClick={this.toggleLineWidget}>
            {this.props.showLineWidget ? (
              <Layers className={dcn.icon} fontSize="small" />
            ) : (
              <LayersClear fontSize="small" />
            )}
          </IconButton>
        </Collapse>
      </>
    )
  }
}
