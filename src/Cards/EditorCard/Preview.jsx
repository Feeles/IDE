import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { style } from 'typestyle'
import { scale } from 'csx'

const cn = {
  root: style({
    position: 'absolute',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    overflow: 'hidden',
    background: `linear-gradient(white, black)`,
    width: '100%',
    height: '100%'
  })
}

export default class Preview extends PureComponent {
  static propTypes = {
    file: PropTypes.object.isRequired,
    localization: PropTypes.object.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,
    getFiles: PropTypes.func.isRequired
  }

  state = {
    imageStyle: {}
  }

  componentDidMount() {
    const { file } = this.props
    if (file.is('image')) {
      const image = new Image()
      image.onload = () => {
        const ratio = size => Math.max(size.height, 1) / Math.max(size.width, 1)
        const screenRect = this.container.getBoundingClientRect()
        const val =
          ratio(screenRect) > ratio(image)
            ? screenRect.width / image.width
            : screenRect.height / image.height
        this.setState({ imageStyle: { transform: scale(val * 0.9) } })
      }
      image.src = file.blobURL
    }
  }

  render() {
    const { file } = this.props
    const { imageStyle } = this.state

    const content = file.is('image') ? (
      <img src={file.blobURL} alt={file.name} style={imageStyle} />
    ) : file.is('audio') ? (
      <audio src={file.blobURL} controls />
    ) : null

    return (
      <div className={cn.root} ref={ref => ref && (this.container = ref)}>
        {content}
      </div>
    )
  }
}
