import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { style, classes } from 'typestyle'
import Card from '@material-ui/core/Card'

const cn = {
  flex: style({
    display: 'flex'
  }),
  max: style({
    maxHeight: '100%'
  })
}
const getCn = props => ({
  root: style({
    position: 'relative',
    width: 0,
    order: props.order,
    boxSizing: 'border-box',
    maxWidth: '100%',
    maxHeight: '100%',
    height: '100%',
    direction: 'ltr',
    flex: '0 0 auto',
    flexBasis: props.visible ? '50%' : 0,
    padding: props.visible ? '16px 20px 16px 0' : 0,
    overflow: props.visible ? 'initial' : 'hidden'
  }),
  card: style({
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    position: 'relative',
    overflow: 'visible' // position: sticky のために必要
  })
})

export default class CardWindow extends PureComponent {
  static propTypes = {
    name: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    order: PropTypes.number.isRequired,
    cardProps: PropTypes.object.isRequired,
    fit: PropTypes.bool.isRequired,
    width: PropTypes.number.isRequired,
    showAll: PropTypes.bool.isRequired,
    footer: PropTypes.node
  }

  static defaultProps = {
    visible: false,
    fit: false,
    width: 480,
    footer: null
  }

  get cardProps() {
    const props = {
      ...this.props
    }
    for (const key in CardWindow.propTypes) {
      delete props[key]
    }
    return props
  }

  render() {
    const dcn = getCn(this.props)
    const { fit } = this.props

    return (
      <div
        id={this.props.name}
        className={classes(dcn.root, fit ? cn.flex : cn.max)}
      >
        <Card
          {...this.cardProps}
          className={classes(dcn.card, fit ? cn.flex : cn.max)}
        >
          {this.props.children}
        </Card>
        {this.props.footer || null}
        <div id={`${this.props.name}-BottomAnchor`} />
      </div>
    )
  }
}
