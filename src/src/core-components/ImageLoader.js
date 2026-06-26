import React, { useEffect, useRef, useState } from 'react'
import './ImageLoader.scss'
import { debounce } from 'throttle-debounce'

const ImageLoader = ({
  zoomAllowed = false,
  className,
  src,
  setShowLoading,
  onClick = () => {},
  onMouseLeave = () => {},
  onDoubleClick = () => {},
  onMouseEnter = () => {},
  onMouseMove = () => {},
  alt = "",
}) => {
  const image = useRef()
  const refLoaderContainer = useRef()
  const [isLoaded, setIsLoaded] = useState(false)
  useEffect(() => {
    const img = image.current
    if (img && img.complete) {
      imageOnLoad()
    }
    window.addEventListener('resize', imageOnLoad)
    return () => window.removeEventListener('resize', imageOnLoad)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const imageOnLoad = debounce(50, () => {
    const img = image.current
    if (!img) return
    // reset the image size, it creates correct sizes for an image based on the screen size
    img.style.width = 'auto'
    img.style.height = 'auto'

    setIsLoaded(true)
    setShowLoading && setShowLoading(false)
    if (img) {
      const isKitItemList = img.parentElement.closest('.item-image')
      const isMultiThumbs = img.parentElement.closest('.multi-carousel-image')
      img.classList.remove('hide')
      let container = img.parentElement.closest('.mobile-approval-preview') ||
        img.parentElement.closest('.carousel-root') ||
        img.parentElement.closest('.carousel-slider') ||
        img.parentElement.closest('.image-wrapper') ||
        img.parentElement.closest('.image-loader')

      const borderWidth = parseInt(getComputedStyle(img).borderWidth, 10) * 2
      let adjustedContainerWidth = container.offsetWidth - borderWidth
      let adjustedContainerHeight = container.offsetHeight - borderWidth

      if (img.offsetHeight === 0) {
        setTimeout(() => {
          imageOnLoad()
        }, 0)

      }
      while (adjustedContainerWidth <= 0 || adjustedContainerHeight <= 0) {
        container = container.parentElement
        adjustedContainerWidth = container.offsetWidth - borderWidth
        adjustedContainerHeight = container.offsetHeight - borderWidth
      }
      const isMobileProofPreview = container.classList.contains('mobile-approval-preview')
      const paddingCorrection = isKitItemList ? 6 : isMultiThumbs ? 0 : (isMobileProofPreview ? 110 : 40)
      if (img.naturalWidth / img.naturalHeight > adjustedContainerWidth / adjustedContainerHeight) {
        img.style.width = `${adjustedContainerWidth - paddingCorrection}px`
        img.style.height = 'auto'
      } else {
        img.style.width = 'auto'
        img.style.height = `${adjustedContainerHeight - paddingCorrection}px`
      }
    }
  })

  const imageOnError = () => {
    const imageElem = image.current
    if (imageElem) {
      imageElem.src = require(`$assets/images/default.png`)
      imageElem.classList.remove('hide')
      imageElem.classList.add('show')
      imageElem.previousSibling.classList.remove('show')
      imageElem.previousSibling.classList.add('hide')
    }
  }

  return (
    <div className={`image-loader ${className ? className : ''}`}
         {...{onClick, onDoubleClick, onMouseLeave, onMouseEnter, onMouseMove}}
        ref={refLoaderContainer}>
      {!isLoaded && <div className="animated loading"/>}
      <div className={'inner-image-wrapper'}>
        <img
          style={{ display: isLoaded ? 'block' : 'none' }}
          alt={alt}
          ref={image}
          src={src}
          onError={imageOnError}
          onLoad={imageOnLoad}
          className="hide"
        />
      </div>
    </div>
  )
}

export default ImageLoader
