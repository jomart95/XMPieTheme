import React, {forwardRef} from 'react'
import { LoadingDots } from '$core-components'
import PriceDisplay from '../Price'

const Price = forwardRef(({ price, isPriceCalculating, showMinimumPrice }, ref) => {
  if (!price || !price.Price) return null
  return (
    <div className='product-instance-price' ref={ref}>
      <div className='total-price' id='total-price-component'>
        {isPriceCalculating || !price
          ? <LoadingDots />
          : <div className='price-wrapper'>
            <PriceDisplay
              model={price.Price}
              showCurrency
              isMinimumPrice={showMinimumPrice}
            />
          </div>
        }
      </div>
    </div>
  )
})

export default Price
