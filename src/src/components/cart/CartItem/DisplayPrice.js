import React from 'react'
import { observer } from 'mobx-react-lite'
import { UStoreProvider } from '@ustore/core'
import { formatForCurrencyAndCulture } from '../model/utils'
import './DisplayPrice.scss'

const DisplayPrice = ({
  price,
  hasPricing,
  isHighlighted,
  currencyState,
  customPriceFormat
}) => {
  if (
    price.subtotal == null
    || !hasPricing
    || !currencyState
    || Number.isNaN(price?.subtotal)
    || Number.isNaN(price?.tax)
  )
    return ''

  let formatParams = {
    taxFormat: customPriceFormat || currencyState.taxFormat,
    symbol: currencyState.currencySymbol,
    code: currencyState.currencyCode,
    currencyFormat: currencyState.currencyFormat,
    decimalSeparator: currencyState.decimalSeparator,
    decimalPlaces: currencyState.decimalPlaces,
    languageCode: currencyState.languageCode
  }

  const { price: itemPrice, tax, priceIncludingTax } = UStoreProvider.state.culture.getConvertedPrices({
    Price: price?.subtotal,
    Tax: price?.tax
  })

  if (Number.isNaN(itemPrice) || Number.isNaN(tax) || Number.isNaN(priceIncludingTax))
    return ''

  // format the given price and tax amount to a string according to the tax, culture and currency definitions of models in state
  const priceDisplayString = formatParams.taxFormat
    .replace(/{Price}/g, formatForCurrencyAndCulture(itemPrice, formatParams))
    .replace(/{Tax}/g, formatForCurrencyAndCulture(tax, formatParams))
    .replace(/{PriceIncludingTax}/g, formatForCurrencyAndCulture(priceIncludingTax, formatParams))

  return (
    <p className={`price${isHighlighted ? ' highlight' : ''}`}>
      {priceDisplayString}
      {currencyState.showCurrencyCode && <span className="cart-ng-item-currency-code"> {formatParams.code}</span>}
    </p>
  )
}

export default observer(DisplayPrice)
