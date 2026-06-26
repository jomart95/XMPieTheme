import React from 'react'
import { observer } from 'mobx-react-lite'
import { UStoreProvider } from '@ustore/core'
import { t } from '$themelocalization'
import CartSummaryPriceBlock from './CartSummaryPriceBlock'
import { formatForCurrencyAndCulture } from '../model/utils'
import { Slot } from '$core-components'
import './CartSummaryContent.scss'

const SummaryTitle = observer(({ model }) => {
  const getSummaryTitle = () => {
    if (model?.isListsMode || model?.isSingleListMode) {
      if (model?.openedList?.id == null) {
        return (
          <div className="cart-summary-lists-subtitle">
            {t('Cart.Summary.NoListSelected')}
          </div>
        )
      }
      return (
        <>
          <div className="cart-summary-lists-title">
            {t('Cart.Summary.ListsTitle')}
          </div>
          <div className="cart-summary-lists-subtitle">
            {model?.openedList?.title}
          </div>
        </>
      )
    } else if (model?.isWishListMode) {
      return t('Cart.Summary.Title')
    }
  }

  return (
    <div className="cart-summary-title">{getSummaryTitle()}</div>
  )
})

const CartSummaryContent = ({
  currencyState,
  model,
  loading
}) => {
  const getSummaryTitle = () => {
    if (model?.summary?.totalItemsCount - model?.summary?.totalWishListItemsCount === 0) {
      return t('Cart.Summary.EmptyCartSummaryText')
    }
    if (model?.isWishListMode && model?.summary?.selectedItemsCount === 0) {
      return t('Cart.Summary.NoItemsSelected')
    }
    return t('Cart.Summary.Title')
  }
  let formatParams = {
    taxFormat: currencyState?.taxFormat,
    symbol: currencyState?.currencySymbol,
    code: currencyState?.currencyCode,
    currencyFormat: currencyState?.currencyFormat,
    decimalSeparator: currencyState?.decimalSeparator,
    decimalPlaces: currencyState?.decimalPlaces,
    languageCode: currencyState?.languageCode
  }

  const convertedPrice = !loading ? UStoreProvider.state.culture.getConvertedPrices({
    Price: parseFloat(model?.summary?.presentablePrices?.subtotal),
    Tax: parseFloat(model?.summary?.presentablePrices?.tax)
  }) : { price: 0, tax: 0, priceIncludingTax: 0 }

  if (!loading && formatParams.currencyFormat ) {
    convertedPrice.price = formatForCurrencyAndCulture(convertedPrice.price, formatParams)
    convertedPrice.tax = formatForCurrencyAndCulture(convertedPrice.tax, formatParams)
    convertedPrice.priceIncludingTax = formatForCurrencyAndCulture(convertedPrice.priceIncludingTax, formatParams)
  }

  return (
    model?.noPricing && !loading
    ? <div className="cart-summary-no-price">{t('Cart.Summary.CountSelected', { count: model?.summary?.selectedItemsCount })}</div>
    : (
      <div className="cart-summary-content-container">
        <SummaryTitle model={model} />
        <Slot name="cart_below_summary_title" data={model} />
        {model?.isWishListMode && !loading && (model?.summary?.totalItemsCount === 0 || model?.summary?.selectedItemsCount === 0)
          ? <h4 className="no-items">{getSummaryTitle()}</h4>
          : ((model?.isWishListMode && !model?.noPricing) || (model?.openedList != null && model.openedList.items.filter(item => item.checked).length > 0) ||
            (!model?.openedList?.isUnassigned && model?.openedList?.items.length > 0) || loading) && (
            <>
              <CartSummaryPriceBlock
                price={convertedPrice.price}
                loading={loading}
                currencyState={currencyState}
                title={t('Cart.Summary.Subtotal')}
              />
              {(model?.summary?.showTax ?? true) &&
                <>
                  <CartSummaryPriceBlock
                    price={convertedPrice.tax}
                    loading={loading}
                    currencyState={currencyState}
                    title={t('Cart.Summary.Tax')}
                  />
                  <div className="cart-summary-block cart-summary-line"/>
                  <CartSummaryPriceBlock
                    price={convertedPrice.priceIncludingTax}
                    loading={loading}
                    currencyState={currencyState}
                    title={`${t('Cart.Summary.Total')}${model?.summary?.showTax ? ` (${t('Cart.IncludingTax')})` : ''}`}
                    total
                  />
                </>
              }
          </>
          )
        }
        {model?.openedList?.items.filter(item => item.checked).length === 0 && model?.openedList?.isUnassigned && <div class="cart-summary-lists-no-items-selected">{ t('Cart.Summary.NoItemsSelected')}</div>}
      </div>
    )
  )
}

export default observer(CartSummaryContent)
