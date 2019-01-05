import React from 'react'
import PropTypes from 'prop-types'

export default class ErrorBoundary extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired
  }
  state = { hasError: false }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true })
    // You can also log the error to an error reporting service
    console.error(error)
    console.error(info)
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>
    }
    return this.props.children
  }
}
