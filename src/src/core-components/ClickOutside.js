import React, { Component, createRef } from 'react'

class ClickOutside extends Component {
  constructor (props) {
    super(props)

    this.wrapperRef = createRef()
    this.handleClickOutside = this.handleClickOutside.bind(this)
  }

  componentDidMount () {
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentWillUnmount () {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  handleClickOutside (event) {
    if (this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
      this.props.trigger(event)
    }
  }

  render () {
    return <div className={this.props.className} ref={this.wrapperRef}>{this.props.children}</div>
  }
}

export default ClickOutside
