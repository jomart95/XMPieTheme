import React from 'react'
import { observer } from 'mobx-react-lite'
import { t } from '$themelocalization'
import CartListModel from '../model/CartListModel'
import CartSummaryContainer from '../CartSummary/CartSummaryContainer'
import { Slot } from '$core-components'
import CartList from './index'
import WishList from './WishList'
import ListContainerSkeleton from './ListContainerSkeleton'
import './ListContainer.scss'
import CartDialogs from '../global-cart-dialogs'

const ListContainer = ({
  currencyState,
  model,
}) => {
  if (
    !model
    || (model.isWishListMode && !model[CartListModel.CART_LIST_TYPES.DEFAULT])
    || (model.isListsMode && !model[CartListModel.CART_LIST_TYPES.UNASSIGNED])
    || model.affectPricingLists.some((list) => list.loading)
  ) {
    return (<div className="skelaton-cart-list-container">
      <ListContainerSkeleton itemsCount={5} title={t('Cart.ShoppingCartTitle')}/>
      <ListContainerSkeleton itemsCount={5} title={t('Cart.Wishlist.WishListTitle')}/>
    </div>)
  }

  return (
    <div className="cart-list-container">
      <CartList currencyState={currencyState} model={model}/>
      {model.affectPricingItems.length > 0 && (
        <div className="cart-summary-mobile">
          <CartSummaryContainer
            model={model ?? null}
            loading={!model || model.loading.summary}
            currencyState={currencyState}
          />
        </div>
      )}
      {model.isWishListMode ? (
        <>
          <Slot name="cart_above_wishlist_section" data={model} />
          {model[CartListModel.CART_LIST_TYPES.WISH_LIST]
            ? <WishList
              key={CartListModel.CART_LIST_TYPES.WISH_LIST}
              currencyState={currencyState}
              model={model}
              list={model[CartListModel.CART_LIST_TYPES.WISH_LIST]}
            />
            : <ListContainerSkeleton itemsCount={0} title={t('Cart.Wishlist.WishListTitle')}/>
          }
        </>
      ) : null}
      <CartDialogs model={model}/>
    </div>
  )
}

export default observer(ListContainer)
