import React from 'react'
import Icon from '$core-components/Icon'

import './CrossCloseButton.scss'

const CrossCloseButton = ({ onPress, className }) => {
  return (
    <div onClick={onPress} onKeyDown={(e) => e.key === 'Enter' && onPress(e)}   tabIndex="0" role="button" aria-label="Close"
      className={`cross-close-button-container ${className || ''}`}>
      <Icon name="close_black.svg" width="15px" height="15px" className="cross-close-button" role="presentation"/>
    </div>
  )
}

export default CrossCloseButton
