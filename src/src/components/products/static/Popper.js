import React, {useCallback, useContext, useEffect, useRef, useState} from 'react'
import { ReactComponent as ErrorIcon } from '$assets/icons/error.svg'
import { t } from '$themelocalization'
import { useClickOutside } from '$themehooks'
import {RootDocumentContext} from '$themeservices'
import './Popper.scss'

const popperPositions = {
  topPrice: {
    refElementSelector: '#total-price-component.total-price',
    location: {
      top: '50px',
      left: '0'
    },
    tipPosition: {
      bottom: '95%',
      left: '10%',
      rotation: '225deg'
    }
  },
  stickyPriceError: {
    refElementSelector: '.sticky-add-to-cart-icon-container',
    location: {
      bottom: '72px',
      right: '0px'
    },
    tipPosition: {
      bottom: 'calc(0% - 6px)',
      left: '50%',
      rotation: '45deg'
    }
  },
  uploadError: {
    refElementSelector: '.product-sticky-price-error-anchor',
    location: {
      bottom: '7px',
      transform: "translateX(-50%)"
    },
    tipPosition: {
      bottom: 'calc(0% - 6px)',
      left: '50%',
      rotation: '45deg'
    }
  },
  stickyPriceWarning: {
    refElementSelector: '.product-sticky-price .price-display',
    location: {
      bottom: '72px',
      right: '0px'
    },
    tipPosition: {
      bottom: 'calc(0% - 6px)',
      left: '50%',
      rotation: '45deg'
    }
  },
  bottomPrice: {
    refElementSelector: '.summary-table-row.total-row',
    location: {
      bottom: '35px',
      right: '0px'
    },
    tipPosition: {
      bottom: 'calc(0% - 6px)',
      left: '85%',
      rotation: '45deg'
    }
  },
  addToCartButton: {
    refElementSelector: '.add-to-cart-button',
    location: {
      bottom: '56px',
      left: '50%',
      transform: 'translateX(-50%)'
    },
    tipPosition: {
      bottom: 'calc(0% - 6px)',
      left: '48%',
      rotation: '45deg'
    }
  }
}

const isInViewport = (el, top = 140) => {
  const rect = el.getBoundingClientRect()
  return (
    rect.top >= top && // header height + tooltip height
      rect.left >= 0 &&
      rect.bottom - rect.height <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

const setPopperPosition = (popperData, popperWrapper, stickPriceRef, topPriceRef, bottomPriceRef, forceAddToCartButton, isNewUpload, rootDocument) => {
  if (!popperWrapper || !stickPriceRef|| !topPriceRef|| !bottomPriceRef) {
    return
  }
  const getPosition = () => {
    const stickyPanel = stickPriceRef.current
    if ((!stickyPanel || stickyPanel.style.height === '0px') && forceAddToCartButton) {
      return popperPositions.addToCartButton
    }
    if (popperData.errorType === 'error' && forceAddToCartButton && stickyPanel && stickyPanel.style.height !== '0px') {
      return isNewUpload ? popperPositions.uploadError : popperPositions.stickyPriceError
    }
    if (popperData.errorType === 'warning' && stickyPanel && stickyPanel.style.height !== '0px') {
      return popperPositions.stickyPriceWarning
    }
    if (topPriceRef?.current && isInViewport(topPriceRef.current)) {
      return popperPositions.topPrice
    }
    if (bottomPriceRef?.current && isInViewport(bottomPriceRef.current)) {
      return popperPositions.bottomPrice
    }
    return null
  }

  const position = getPosition()
  if (position && popperWrapper.current) {
    const refElement = rootDocument.querySelector(position.refElementSelector)
    if (refElement) {
      refElement.appendChild(popperWrapper.current)
      refElement.style.setProperty('position', 'relative')
      popperWrapper.current.setAttribute('style', '')
      Object.keys(position.location).forEach((locationPoint) => {
        popperWrapper.current.style.setProperty(locationPoint, position.location[locationPoint])
      })
      if (position.tipPosition && Object.keys(position.tipPosition).length) {
        popperWrapper.current.style.setProperty('--tip-position-bottom', position.tipPosition.bottom)
        popperWrapper.current.style.setProperty('--tip-position-left', position.tipPosition.left)
        popperWrapper.current.style.setProperty('--tip-rotation', position.tipPosition.rotation)
      }
    }
  }

}

const Popper = ({ errorCode, forceAddToCartButton, resetError, popperAffectedSections, stickPriceRef, topPriceRef, bottomPriceRef, isNewUpload }) => {
  const {documentRoot, rootElement} = useContext(RootDocumentContext)()
  const [popperData, setPopperData] = useState({})
  const popperWrapper = useRef(null)
  const handleClose = () => {
    setPopperData({})
    resetError()
  }

  useClickOutside(popperWrapper, handleClose, rootElement)

  const setPosition = useCallback(() => {
    setPopperPosition(popperData, popperWrapper, stickPriceRef, topPriceRef, bottomPriceRef, forceAddToCartButton, isNewUpload, documentRoot)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popperData, popperWrapper, stickPriceRef, topPriceRef, bottomPriceRef, forceAddToCartButton])

  const setPositionCallbackRef = useRef(setPosition)
  useEffect(() => {
    setPositionCallbackRef.current = setPosition
  }, [setPosition]);

  useEffect(() => {
    const handleScroll = () => {
      setPositionCallbackRef.current()
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.addEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    const errors = {
      'SOMETHING_WENT_WRONG': {
        type: 'error',
        message: t('product.error_something_went_wrong')
      },
      'GET_PRICE': {
        type: 'error',
        message: t('product.price_is_not_valid')
      },
      'PRICE_CAN_NOT_BE_UPDATED': {
        type: 'warning',
        message: t('product.price_cannot_be_updated')
      },
      'VALIDATION_ERROR': {
        type: 'error',
        message: t('product.validation_error')
      },
      'SECTION_ERROR': {
        type: 'error',
        message: t('Product.SectionError', {sections: `\n${popperAffectedSections.slice(0, 5).join('\n')}` })
      },
      'FILE_MUST_BE_UPLOADED': {
        type: 'error',
        message: t('UploadDocument.FileNotUploaded')
      }
    }

    if (errorCode) {
      const newPopperData = { errorType: errors[errorCode].type, errorMessage: errors[errorCode].message }
      setPopperData(newPopperData)
      setPopperPosition(newPopperData, popperWrapper, stickPriceRef, topPriceRef, bottomPriceRef, forceAddToCartButton, isNewUpload, documentRoot)
      if (popperWrapper.current) {
        popperWrapper.current.style.setProperty('display', 'block')
        popperWrapper.current.children[0].style.setProperty('display', 'flex')
      }
      const handleCloseTimeoutID = setTimeout(handleClose, 5_000)
      return () => {
        clearTimeout(handleCloseTimeoutID)
      }
    } else if (errorCode === null) {
      setPopperData({})
      if (popperWrapper.current) {
        popperWrapper.current.style.setProperty('display', 'none')
        popperWrapper.current.children[0].style.setProperty('display', 'none')
      }
      const popperElement = documentRoot.getElementById('popper')
      if (popperElement) {
        const popperParentElement = popperElement.parentElement
        popperParentElement.removeChild(popperElement)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorCode, popperAffectedSections])

  return (
    <div ref={popperWrapper} className={`popper-tooltip ${popperData.errorType}`} id="popper" style={{ display: 'none' }}>
      <div className='popper-tooltip-inner' style={{ display: 'none', paddingRight: `${isNewUpload ? '10px' : ''}` }}>
        <div className='error-icon'>
          <ErrorIcon width='15px' height='15px'/>
        </div>
        <div className='popover-message'>{popperData.errorMessage}</div>
      </div>
      <span className='arrow'/>
    </div>
  )
}

export default Popper
