import React, { forwardRef } from 'react'
import Price from './Price'
import { LoadingDots } from '$core-components'
import { t } from '$themelocalization'
import './ProductOrderSummary.scss'
import { Slot } from '$core-components'

const ProductOrderSummary = forwardRef(({
    currency,
    className,
    productModel,
    quantity,
    priceModel,
    isPriceCalculating,
    deliveryMethod,
    taxFormatType
  }, ref) => {

    if (!productModel || !priceModel || !productModel.HasPricing || priceModel.Price === null) return null

    const itemUnitName = productModel.Unit.PackType
      ? `(${quantity} ${quantity.toString() === '1' ? productModel.Unit.PackType.Name : productModel.Unit.PackType.PluralName})`
      : productModel.Unit.ItemType
        ? `(${quantity} ${quantity.toString() === '1' ? productModel.Unit.ItemType.Name : productModel.Unit.ItemType.PluralName})`
        : ''

    return <div className={`${className} product-order-summary`}>
      <Slot name="ng_product_above_summary" data={productModel}/>
      <div className="summary-header">{t('product.summary')}</div>

      <div className={`summary-table${taxFormatType === 3 ? ' custom-price' : ''}`}>
        {/* <div className={`summary-table`}> */}
        <div className="summary-table-row">
          <div className="summary-table-label">{t('productPrice.product_total', { itemUnitName })}  </div>
          <div className="summary-table-value">{isPriceCalculating ? <LoadingDots/>
            : priceModel.IsMinimumPrice ? <span>-</span> : <Price showCurrency={false}
                                                                  model={{ Price: priceModel.ProductPrice, Tax: 0 }}
                                                                  isMinimumPrice={false}
                                                                  overridePriceFormat={'{Price}'}/>}
          </div>
        </div>
        {deliveryMethod === 1 && <div className="summary-table-row">
          <div className="summary-table-label">{t('productPrice.shipping_message')}</div>
        </div>}
        {deliveryMethod === 2 && <div className="summary-table-row">
          <div className="summary-table-label">{t('productPrice.mailiing_fee')}</div>
          <div className="summary-table-value">{isPriceCalculating ? <LoadingDots/>
            : priceModel.IsMinimumPrice ? <span>-</span> : <Price showCurrency={false}
                                                                  model={{ Price: priceModel.MailingFee, Tax: 0 }}
                                                                  isMinimumPrice={false}
                                                                  overridePriceFormat={'{Price}'}/>}
          </div>
        </div>}
        {(taxFormatType === 3 || taxFormatType === 2) && <div className="summary-table-row">
          <div className="summary-table-label">{t('productPrice.tax')}</div>
          <div className="summary-table-value">{isPriceCalculating ? <LoadingDots/>
            : priceModel.IsMinimumPrice ? <span>-</span> : <Price showCurrency={false}
                                                                  model={{ Price: priceModel.Price.Tax, Tax: 0 }}
                                                                  isMinimumPrice={false}
                                                                  overridePriceFormat={'{Price}'}/>}
          </div>
        </div>}
        <div className="summary-table-row total-row" ref={ref}>
          <div className="summary-table-label total">{t('productPrice.total_price', { currency })}</div>
          <div className="summary-table-value total">{isPriceCalculating ? <LoadingDots/>
            : <Price showCurrency={false} model={priceModel.Price} isMinimumPrice={priceModel.IsMinimumPrice}/>}
          </div>
        </div>
      </div>
      <Slot name="ng_product_below_summary" data={productModel}/>
    </div>

  }
)

export default ProductOrderSummary
