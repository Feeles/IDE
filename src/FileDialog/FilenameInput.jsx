import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { style } from 'typestyle'
import TextField from '@material-ui/core/TextField'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'

const MimeTypes = {
  'text/javascript': '.js',
  'text/x-markdown': '.md',
  'application/json': '.json',
  'text/html': '.html',
  'text/css': '.css',
  'text/plain': '',
  'text/x-glsl': '.sort'
}

const getUniqueId = (i => () => ++i)(0)

const cn = {
  dropDown: style({
    height: 43
  })
}

export default class FilenameInput extends Component {
  static propTypes = {
    defaultName: PropTypes.string,
    defaultType: PropTypes.string,
    disabled: PropTypes.bool,
    style: PropTypes.object
  }

  state = {
    name: this.props.defaultName || 'filename',
    type: this.props.defaultType || 'text/javascript'
  }

  constructor(props) {
    super(props)

    this.id = 'FILENAME_INPUT_' + getUniqueId()
  }

  get value() {
    const { name, type } = this.state
    return name + MimeTypes[type]
  }

  get name() {
    return this.state.name
  }

  get type() {
    return this.state.type
  }

  handleNameChange = event => {
    this.setState({ name: event.target.value })
  }

  handleTypeChange = event => {
    this.setState({ type: event.target.value })
  }

  componentDidMount() {
    if (this.input) {
      this.timer = window.setTimeout(() => {
        this.input.focus()
        this.input.select()
      }, 100)
    }
  }

  componentWillUnmount() {
    if (this.timer) {
      window.clearTimeout(this.timer)
    }
  }

  render() {
    const { name, type } = this.state
    const { disabled } = this.props

    const style = this.props.style

    return (
      <div style={style}>
        <TextField
          id={this.id}
          ref={textField => (this.input = textField && textField.input)}
        >
          <input
            autoFocus={true}
            defaultValue={name}
            disabled={disabled}
            onChange={this.handleNameChange}
          />
        </TextField>
        <Select
          value={type}
          disabled={disabled}
          onChange={this.handleTypeChange}
          className={cn.dropDown}
        >
          {Object.keys(MimeTypes).map(type => (
            <MenuItem key={type} value={type}>
              {MimeTypes[type]}
            </MenuItem>
          ))}
        </Select>
      </div>
    )
  }
}
