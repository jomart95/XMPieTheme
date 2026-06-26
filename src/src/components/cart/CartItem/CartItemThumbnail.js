import React, { useState, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import LazyLoad from 'react-lazy-load'
import Skeleton from 'react-loading-skeleton'
import './CartItemThumbnail.scss'

const CartItemThumbnail = ({ onThumbnailClick, src, orderItemId, editDisabled, proofInProgress, proofWarning, proofFailedMessage = ''}) => {
  const [thumbnailLoading, setThumbnailLoading] = useState(true);
  const thumbnailRef = useRef();
  const [isImageVertical, setIsImageVertical] = useState(false)

  const defineImageOrientation = () => {
    const parentRect = thumbnailRef?.current?.closest('.product-image-container')?.getBoundingClientRect();
    if (parentRect && thumbnailRef?.current?.width/parentRect.width < thumbnailRef?.current?.height/parentRect.height) {
      setIsImageVertical(true)
    }
    setThumbnailLoading(false)
  }
  return (
    <div className="product-image-container">
      {src && <LazyLoad className={`loadWrapper ${proofInProgress ? 'proof-in-progress' :''} ${proofWarning? 'proof-failed' :''}`}>
        <img
          style={{ height: `${isImageVertical ? '100%' : 'auto'}`, width: `${isImageVertical ? 'auto' : '100%'}` }}
          alt="product_image"
          src={src}
          ref={thumbnailRef}
          onClick={(e) => !editDisabled && onThumbnailClick(e)}
          onLoad={() => defineImageOrientation()}
          className={`product-image ${thumbnailLoading && 'hide'} ${editDisabled && 'disabled'}`}
        />
      </LazyLoad>}
      {thumbnailLoading && src && (
        <Skeleton className="skeleton thumbnail-loader" width={100} height={100} />
    )}
    </div>
  )
}

export default observer(CartItemThumbnail)
