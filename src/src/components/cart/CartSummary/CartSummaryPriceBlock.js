import React from 'react'
import { observer } from 'mobx-react-lite'
import { LoadingDots } from '$core-components'
import './CartSummaryPriceBlock.scss'

const CartSummaryPriceBlock = ({
  price,
  loading,
  currencyState,
  total,
  title,
}) => {
  return (
    <div className={'cart-summary-block' + (
      total ? ' block-total' : ''
    )}>
      <div className="block-title">{title}</div>
      <div className="block-value">
        {loading ?
          <LoadingDots className="summary-price-loader"/> : (
            <>
              {price}
              {currencyState?.showCurrencyCode && <span className="cart-ng-summary-currency-code"> {currencyState?.currencyCode}</span>}
            </>
          )
        }
      </div>
    </div>
  )
}

export default observer(CartSummaryPriceBlock)
