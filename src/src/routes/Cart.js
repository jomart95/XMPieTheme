import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { UStoreProvider } from '@ustore/core'
import themeContext from '$ustoreinternal/services/themeContext'
import CartModel from '../components/cart/model/CartModel'
import CartNG from '../components/cart/CartNG'
import Layout from '../components/layout'
import { Slot } from '$core-components'
import Legacy from './Legacy'
import './Cart.scss'
import { activityMonitor, getCartMode, CART_MODE } from '$themeservices'


const Cart = (props) => {
  const { state: { currentStore, currentCurrency, currentCulture, currencies } } = props
  const [currencyState, setCurrencyState] = useState(() => ({
    isSecondaryCurrency: currentCurrency.ID !== currentStore.PrimaryCurrencyID,
    showCurrencyCode: currentStore.ShowCurrencyCode,
    currencyCode: currentCurrency.Code,
    currencySymbol: currentCurrency.Symbol,
    primaryCurrencyName: currencies.find((currency) => currency.ID === currentStore.PrimaryCurrencyID).Name
  }))
  const { storeBaseUrl, languageCode, apiUrl } = themeContext.get()
  const [cartItemsCount, setCartItemsCount] = useState()
  const navigate = useNavigate()
  const cartModel = useRef()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    setCurrencyState({
      isSecondaryCurrency: currentCurrency.ID !== currentStore.PrimaryCurrencyID,
      showCurrencyCode: currentStore.ShowCurrencyCode,
      currencyCode: currentCurrency.Code,
      currencySymbol: currentCurrency.Symbol,
      taxFormat: currentStore.TaxFormat,
      currencyFormat: currentCulture.CurrencyFormat,
      decimalSeparator: currentCulture.DecimalSeparator,
      decimalPlaces: currentCulture.DecimalPlaces,
      languageCode: currentCulture.LanguageCode,
      primaryCurrencyName: currencies.find((currency) => currency.ID === currentStore.PrimaryCurrencyID).Name
    })
  }, [
    currentCurrency.Code,
    currentCurrency.ID,
    currentCurrency.Symbol,
    currentStore.ShowCurrencyCode,
    currentStore.PrimaryCurrencyID,
    currentCulture.CurrencyFormat,
    currentCulture.DecimalSeparator,
    currentCulture.DecimalPlaces,
    currentCulture.LanguageCode,
    currentStore.TaxFormat,
    currencies
  ]);


  const loadData = async () => {
    cartModel.current = new CartModel({
      cartMode: getCartMode(currentStore),
      UStoreProvider: UStoreProvider,
      storeBaseUrl,
      storeLanguageCode: languageCode,
      storeApiUrl: apiUrl,
      navigate,
      searchParams,
    })

    cartModel.current.init()

  }



  useEffect(() => {
    const setActivities = (activities) => cartModel.current.setActivities(activities)
    activityMonitor.subscribe(setActivities)

    if (getCartMode(currentStore) !== CART_MODE.Aspx) {
      loadData()
    }

    return () => {
      activityMonitor.unsubscribe(setActivities)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setCartItemsCount(props.state.cartItemsCount?.ItemsCount)
  }, [props.state.cartItemsCount?.ItemsCount])

  if (getCartMode(currentStore) !== CART_MODE.Aspx)
    return (
      <Layout className="cart-ng" {...props}>
        <Slot name="cart_under_header" data={cartModel} />
        <CartNG
          currencyState={currencyState}
          model={cartModel.current ?? null}
          itemsCount={
            !cartModel.current
              ? Math.min(props.state.cartItemsCount?.ItemsCount ?? 0, 10)
              : cartItemsCount
          }
        />
      </Layout>
    )

  return <Legacy {...props}/>
}

export default Cart
