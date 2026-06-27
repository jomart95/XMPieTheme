import React, { forwardRef } from 'react'
import { LoadingDots } from '$core-components'
import PriceDisplay from '../Price'

const Price = forwardRef(({ price, isPriceCalculating, showMinimumPrice, quantity, unitName }, ref) => {
  if (!price || !price.Price) return null

  // McFaddin: show a stable per-unit price (ProductPrice / quantity) instead of the
  // quantity-multiplied total, which duplicates the summary. Falls back to the total
  // when a unit price can't be derived (minimum/"From" pricing or missing data).
  const canShowUnit = quantity > 0 && price.ProductPrice != null && !price.IsMinimumPrice
  const unitModel = canShowUnit ? { Price: price.ProductPrice / quantity, Tax: 0 } : price.Price

  return (
    <div className='product-instance-price' ref={ref}>
      <div className='total-price' id='total-price-component'>
        {isPriceCalculating || !price
          ? <LoadingDots />
          : <div className='price-wrapper'>
            <PriceDisplay
              model={unitModel}
              showCurrency={!canShowUnit}
              isMinimumPrice={canShowUnit ? false : showMinimumPrice}
              overridePriceFormat={canShowUnit ? '{Price}' : ''}
            />
            {canShowUnit && unitName && <span className='mcf-unit-suffix'>/ {unitName}</span>}
          </div>
        }
      </div>
    </div>
  )
})

export default Price