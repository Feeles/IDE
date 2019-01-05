import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { style } from 'typestyle'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'

import { Abort } from './Buttons'

const cn = {
  div: style({
    textAlign: 'center'
  }),
  link: style({
    fontSize: '2rem'
  })
}

/**
 * HTML5 a要素のdownload属性が実装されていないブラウザのためのfallback
 */
export default class SaveDialog extends PureComponent {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    content: PropTypes.any,
    localization: PropTypes.object.isRequired
  }

  state = {
    contents:
      this.props.content instanceof Array
        ? this.props.content
        : [this.props.content],
    results: []
  }

  componentDidMount() {
    Promise.all(
      this.state.contents.map(
        item =>
          new Promise(resolve => {
            const reader = new FileReader()
            reader.onload = () =>
              resolve({
                name: item.name,
                href: reader.result
              })
            reader.readAsDataURL(item.blob)
          })
      )
    ).then(results => this.setState({ results }))
  }

  render() {
    const { onRequestClose, localization } = this.props

    return (
      <Dialog open onClose={onRequestClose}>
        <DialogTitle>{localization.saveDialog.title}</DialogTitle>
        <DialogContent>
          {this.state.results.map((item, i) => (
            <div key={i} className={cn.div}>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={item.href}
                className={cn.link}
              >
                {item.name}
              </a>
              <p>{localization.saveDialog.description(item.name)}</p>
            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <Abort
            key="cancel"
            primary
            onClick={onRequestClose}
            label={localization.saveDialog.cancel}
          />
        </DialogActions>
      </Dialog>
    )
  }
}
