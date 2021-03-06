import React from 'react'
import PropTypes from 'prop-types'
import { style, classes } from 'typestyle'
import { Button, Tooltip } from '@material-ui/core'

import findAssetButton from './findAssetButton'

const iconSize = 48
const padding = 2
export const assetLinkWidth = iconSize + padding * 2

export const cn = {
  button: style({
    minWidth: assetLinkWidth,
    padding
  }),
  icon: style({
    maxHeight: iconSize,
    width: iconSize
  })
}

export default class AssetLink extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    asset: PropTypes.any.isRequired,
    className: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired
  }

  state = {
    name: '',
    iconUrl: ''
  }

  static getDerivedStateFromProps(props, state) {
    if (props.name !== state.name) {
      // まだ計算されていない
      const assetButton = findAssetButton(props.asset, props.name)
      if (assetButton) {
        return {
          name: props.name,
          iconUrl: assetButton.iconUrl
        }
      }
    }
    return null
  }

  handleClick = () => {
    const { name, iconUrl } = this.state
    if (!name) return
    this.props.onClick({ name, iconUrl })
  }

  render() {
    const { name, className } = this.props
    const { iconUrl } = this.state

    return (
      <Tooltip title={this.props.localization.editorCard.edit(name)}>
        <Button
          variant="outlined"
          className={classes(className, cn.button)}
          disabled={!this.state.name}
          onClick={this.handleClick}
        >
          {this.state.iconUrl ? (
            <img src={iconUrl} alt={name} className={cn.icon} />
          ) : (
            <span className={cn.icon}>{name}</span>
          )}
        </Button>
      </Tooltip>
    )
  }
}
