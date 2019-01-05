import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { style } from 'typestyle'
import TextField from '@material-ui/core/TextField'
import Checkbox from '@material-ui/core/Checkbox'

import EditableLabel from '../../jsx/EditableLabel'

const cn = {
  root: style({
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 12
  }),
  key: style({
    flex: '1 1 auto',
    maxWidth: 100
  }),
  value: style({
    flex: '1 1 auto',
    margin: '0 4px'
  }),
  tooltip: style({
    flex: '1 1 auto',
    fontSize: '.8em',
    maxWidth: 140
  }),
  checkbox: style({
    width: 40
  }),
  numberField: style({
    width: 100
  }),
  stringField: style({
    width: 200
  })
}

export default class EnvItem extends PureComponent {
  static propTypes = {
    item: PropTypes.array.isRequired,
    itemKey: PropTypes.any.isRequired,
    updateEnv: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired
  }

  changeKey = key => {
    const { itemKey, updateEnv } = this.props
    const [...item] = this.props.item

    updateEnv({
      [itemKey]: undefined,
      [key]: item
    })
  }

  changeValue = value => {
    const { itemKey, updateEnv } = this.props
    const [, type, tooltip] = this.props.item

    const item = [value, type, tooltip]
    updateEnv({ [itemKey]: item })
  }

  changeTooltip = tooltip => {
    const { itemKey, updateEnv } = this.props
    const [value, type] = this.props.item

    const item = [value, type, tooltip]
    updateEnv({ [itemKey]: item })
  }

  render() {
    const { itemKey, localization } = this.props
    const [value, type, tooltip] = this.props.item

    return (
      <div className={cn.root}>
        <EditableLabel
          id="tf1"
          className={cn.key}
          defaultValue={itemKey}
          tapTwiceQuickly={localization.common.tapTwiceQuickly}
          onEditEnd={this.changeKey}
        />
        <div className={cn.value}>
          <Configurable type={type} value={value} onChange={this.changeValue} />
        </div>
        <EditableLabel
          id="tf2"
          className={cn.tooltip}
          defaultValue={tooltip}
          tapTwiceQuickly={localization.common.tapTwiceQuickly}
          onEditEnd={this.changeTooltip}
        />
      </div>
    )
  }
}

const Configurable = props => {
  switch (props.type) {
    case 'boolean':
      return (
        <Checkbox
          className={cn.checkbox}
          defaultChecked={props.value}
          onCheck={(e, value) => props.onChange(value)}
        />
      )
    case 'number':
      return (
        <TextField
          id="tf"
          className={cn.numberField}
          defaultValue={props.value}
          // inputStyle={{ textAlign: 'right' }}
          onChange={e => {
            const float = parseFloat(e.target.value)
            if (!isNaN(float)) {
              props.onChange(float)
            }
          }}
        />
      )
    case 'string':
      return (
        <TextField
          multiLine
          id="tf"
          className={cn.stringField}
          defaultValue={props.value}
          onChange={e => props.onChange(e.target.value)}
        />
      )
    default:
      return null
  }
}

Configurable.propTypes = {
  type: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired
}
