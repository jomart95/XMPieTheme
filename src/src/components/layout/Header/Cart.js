import { useEffect, useState } from 'react'
import { UStoreProvider } from '@ustore/core'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import { getCartMode, CART_MODE } from '$themeservices'
import { Icon, LinkAria } from '$core-components'
import { t } from '$themelocalization'

import './Cart.scss'

const Cart = ({ connectCartUrl = '' }) => {
  const storeItemsCount = UStoreProvider.state.get().cartItemsCount?.ItemsCount
  const [cartItemsCount, setCartItemsCount] = useState(storeItemsCount)
  const isCartLists = getCartMode(UStoreProvider.state.get().currentStore) === CART_MODE.Lists

  useEffect(() => {
    setCartItemsCount(UStoreProvider.state.get().cartItemsCount?.ItemsCount)
  }, [storeItemsCount])

  const getBadge = () => {
    if (isCartLists && cartItemsCount) {
      return <div className="cart-badge"/>
    }
    if (cartItemsCount) {
      return <div className="cart-badge">{cartItemsCount >= 100 ? '∞' : cartItemsCount}</div>
    }
    return null
  }

  const cartUrl = connectCartUrl ? decodeURIComponent(connectCartUrl) : urlGenerator.get({ page: 'cart' })

  const tPluralization = cartItemsCount === 1 ? `.One` : '.Many'

  return (
    <div className="cart">
      <LinkAria to={cartUrl} className="cart-icon-container" aria-label={t(`Cart.Title${tPluralization}`, { count: cartItemsCount })}>
        <Icon name="homepage_header_cart.svg" width="23px" height="21px" className="cart-icon" alt={'cart'}/>
        {getBadge()}
      </LinkAria>
    </div>
  )
}

export default Cart
