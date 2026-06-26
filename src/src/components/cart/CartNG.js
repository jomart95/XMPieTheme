import React, { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { t } from '$themelocalization'
import ListContainer from './CartList/ListContainer'
import EmptyPage from './EmptyPage'
import CartSummaryContainer from './CartSummary/CartSummaryContainer'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import './CartNG.scss'
import CartDialogs from './global-cart-dialogs'
import { proofThumbnailUpdater } from '$themeservices'

const CartNG = ({
  currencyState,
  model,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    return () => proofThumbnailUpdater.stop()
  }, []);

  if (
    model?.initiated
    && ((model?.isWishListMode && model.items.length === 0 && model.affectPricingLists.length > 0)
    || (model?.isListsMode && model.listsItemsCount === 0 && model.lists.length === 1))
    && model.affectPricingLists.every((list) => !list.loading)
  ) {
    return <>
      <EmptyPage
        title={t('Cart.EmptyCartTitle')}
        text={t('Cart.EmptyCartText')}
        buttonText={t('Cart.EmptyCartButtonText')}
        buttonUrl={urlGenerator.get({ page: 'home' })}
        shoppingCartText={model?.shoppingCartText}
      />
      <CartDialogs model={model}/>
    </>
  }

  return (
    <div className="cart-container">
      <ListContainer
        currencyState={currencyState}
        model={model ?? null}
      />
      <div className="cart-summary-desktop">
        <CartSummaryContainer
          currencyState={currencyState}
          model={model ?? null}
          loading={!model || model?.summary?.loading}
          withSticky={true}
        />
      </div>
      <CartDialogs model={model}/>
    </div>
  )
}

export default observer(CartNG)
