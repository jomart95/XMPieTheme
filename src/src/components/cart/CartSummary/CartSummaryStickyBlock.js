import React, { useState } from 'react'
import { LoadingDots, Icon } from '$core-components'
import CartSummaryContent from './CartSummaryContent'
import CartSummaryButton from './CartSummaryButton'
import './CartSummaryStickyBlock.scss'

const CartSummaryStickyBlock = ({
  price,
  showCurrencyCode,
  currencyCode,
  currencySymbol,
  show,
  model,
  onAction,
  loading
}) => {
  const [showAll, setShowAll] = useState(false)

  const toggleArrow = () => {
    setShowAll(!showAll)
  }

  return (
    <>
      <div className={`sticky-cart-summary${show ? '' : ' hide'}`}>
        <div className="cart-summary-sticky-block">
          <div className={"sticky-summary-more-part" + (showAll ? " open" : "")}>
            {showAll &&
              <button className="close" onClick={() => toggleArrow()}>
                <Icon name="close_black.svg" width="10px" height="10px"/>
              </button>
            }
            <CartSummaryContent
              showCurrencyCode={showCurrencyCode}
              currencyCode={currencyCode}
              currencySymbol={currencySymbol}
              model={model}
              loading={loading}
            />
            <div className="bottom-line"/>
          </div>
          <div className="sticky-summary-less-part">
            <div className="sticky-total-price">
              {loading ?
                <LoadingDots className="summary-price-loader sticky-price-loader"/> : (
                  <>
                    {price}
                    {showCurrencyCode && <span className="cart-ng-summary-currency-code">&nbsp;{currencyCode}</span>}
                    <span onClick={toggleArrow}>
                      <Icon name={showAll ? 'cart_view_more.svg' : 'cart_view_less.svg'} width="13px" height="13px"/>
                    </span>
                  </>
                )
              }
            </div>
            <CartSummaryButton loading={loading} model={model} onAction={onAction}/>
          </div>
        </div>
      </div>
      {showAll && <div className="sticky-output-layout" onClick={toggleArrow}/>}
    </>

  )
}

export default CartSummaryStickyBlock
