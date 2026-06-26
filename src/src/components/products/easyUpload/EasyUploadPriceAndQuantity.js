import React, { forwardRef } from 'react'
import { t } from '$themelocalization'
import Price from '../static/Price'
import ProductQuantity from '../ProductQuantity'

const EasyUploadPriceAndQuantity = forwardRef( ( props, ref ) => {
    const { isPriceCalculating, price, orderItem, product, handleQuantityChange } = props
    const { topPriceRef, easyUploadTopMarkerRef } = ref

    return (
      <div className="product-properties">
        <Price
          ref={topPriceRef}
          isPriceCalculating={isPriceCalculating}
          price={price}
          showMinimumPrice={!!price.IsMinimumPrice}
        />
        <div ref={easyUploadTopMarkerRef} className="easy-upload-price-top-marker"></div>
        <div className="product-instance-wizard">
          <div className="quantity">
            <span className="quantity-label">{t( 'product.quantity' )}</span>
            {orderItem?.Quantity && <ProductQuantity
              supportsInventory
              productModel={product}
              orderModel={orderItem}
              onQuantityChange={handleQuantityChange}
            />}
          </div>
        </div>
      </div>
    )
  },
)

export default EasyUploadPriceAndQuantity
