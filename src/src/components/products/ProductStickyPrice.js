import React, { forwardRef, useEffect, useState } from 'react'
import Price from './Price'
import { Icon, LoadingDots } from '$core-components'
import './ProductStickyPrice.scss'
import { PDFRenderer } from './upload/PDFRenderer'
import { usePDFViewer } from './upload/PDFViewerContext'

const ProductStickyPrice = forwardRef(({
  priceModel,
  addToCartBtnText,
  disabled,
  onClick,
  longPrice,
  isPriceLoading,
  showMinimumPrice,
  productThumbnails,
  onImageClick,
  lastViewImageId,
  isNewUpload,
  propertiesObject,
  orderItem,
  isUEdit,
}, ref) => {
  const image = (productThumbnails && productThumbnails.Thumbnails && productThumbnails.Thumbnails.length)
    ? productThumbnails.Thumbnails[lastViewImageId ? lastViewImageId : 0] : null
  const { viewerState, fileName } = usePDFViewer()
  const [internalProperties, setInternalProperties] = useState(null)

  const [animationClass, setAnimationClass] = useState('')
  const findChangedProperty = (prev, current) => Object.keys(prev).find((key) => current[key].value !== prev[key].value)

  useEffect(() => {
    if (!internalProperties) {
      const affectingProperties = Object.values(propertiesObject)
        .reduce((acc, prop) => (prop.custom && prop.custom.affectProof) ? {
          ...acc,
          [prop.id]: prop.value || ''
        } : acc, {})
      setInternalProperties(affectingProperties)
      return
    }

    const changedProperty = findChangedProperty(internalProperties, propertiesObject)

    if (changedProperty) {
      setAnimationClass('block-reload')
      setInternalProperties({
        ...internalProperties,
        [changedProperty]: {
          value: propertiesObject[changedProperty].value
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertiesObject])

  return (
    <div className="product-sticky-price">
      <div className="product-sticky-price-error-anchor"/>
      <div className="sticky-container">
        {image && !isUEdit && 
          <div onAnimationEnd={() => setAnimationClass('')} className="sticky-image-block" onClick={onImageClick}>
            <img className={`${animationClass}`} key={image.Url} height={50} src={image.Url} alt={image.DisplayName}/>
          </div>
        }
        {viewerState.previewUrl && !isUEdit && <div className="sticky-image-block" onClick={onImageClick}>
          <div onAnimationEnd={() => setAnimationClass('')} className={`canvas-wrapper ${animationClass}`}>
            <PDFRenderer
              state={{ ...viewerState, pageNumber: 1 }}
              name={fileName}
              orderItemID={orderItem.ID}
            />
          </div>
        </div>}
        <div className={`total-price${longPrice ? ' long-price' : ''}${!priceModel ? ' button-only' : ''}`}>
          {priceModel
            ?
            (<>
                  <span className={`${isPriceLoading ? 'text-hidden' : ''}`}>
                    <Price
                      showCurrency
                      model={priceModel.Price}
                      isMinimumPrice={showMinimumPrice}/>
                  </span>
              {isPriceLoading && <LoadingDots/>}
              <div className="filler"/>
            </>)
            : null
          }
          <div className="sticky-add-to-cart-icon-container">
            {image === null && viewerState.previewUrl === null && !isNewUpload &&
              <span className="add-to-cart-icon-wrapper"
                    onClick={() => !disabled ? onClick('sticky_add_button') : undefined}>
                      <Icon id="sticky-add-to-cart-icon" className="sticky-add-to-cart-icon" name="addToCart_sticy_banner_mobile_circle.svg"
                            width="40px"
                            height="40px"
                            />
                </span>
            }
            <div
              id="sticky-add-to-cart-button"
              className={'button button-secondary sticky-add-to-cart-button'}
              onClick={() => !disabled ? onClick('sticky_add_button') : undefined} ref={ref}>
              <span className={`${disabled ? 'text-hidden' : ''}`}>{addToCartBtnText}</span>
              {disabled && <LoadingDots/>}
            </div>
          </div>

        </div>
      </div>
      {(image || viewerState.previewUrl || isNewUpload)
        &&
        (<span className="add-to-cart-icon-wrapper">
          <Icon id="sticky-add-to-cart-icon" className="sticky-add-to-cart-icon" name="addToCart_sticy_banner_mobile_circle.svg"
                width="40px"
                height="40px"
                onClick={() => !disabled ? onClick('sticky_add_icon') : undefined}/>
        </span>)
      }
    </div>
  )
})

export default ProductStickyPrice
