import React, {useRef, useEffect} from 'react'
import { ReactComponent as ErrorIcon } from '$assets/icons/error.svg'
import './ItemDuplicateTooltip.scss'

const ItemDuplicateTooltip = ({  onClickOutside, desktopDuplicateButtonRef, message, isList }) => {
  const tooltipRef = useRef(null)

  const handleClickOutside = (e) => {
    if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
      onClickOutside()
    }
  }

  const handleScroll = (e) => {
    const {height, top, left} = desktopDuplicateButtonRef.current.getBoundingClientRect()
    const offset = isList ? 7 : 0
    tooltipRef.current.style.top = `${top + height + 15}px`
    tooltipRef.current.style.left = `${left + offset}px`
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)
    handleScroll()


    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  })

  return (
    <div ref={tooltipRef} className="cart-item-duplicate-tooltip">
      <div className="cart-item-duplicate-tooltip-inner">
        <div className="cart-error-message">
          <ErrorIcon width="15px" height="15px"/>
          <span>{message}</span>
        </div>
      </div>
    </div>
  )
}

export default ItemDuplicateTooltip
