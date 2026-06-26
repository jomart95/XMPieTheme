import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { t } from '$themelocalization'
import { LoadingDots } from '$core-components'
import CartCheckbox from '../CartList/CartCheckbox'
import CartErrorModel from '../model/CartErrorModel'
import DisplayPrice from './DisplayPrice'
import CartItemActions from './CartItemActions'
import ProductName from './ProductName'
import ProductProperties from './ProductProperties'
import CartItemThumbnail from './CartItemThumbnail'
import CartItemAlert from './CartItemAlert'
import InfoMessage from './InfoMessage'
import './index.scss'
import { Nickname } from './Nickname'
import ItemQuantity from './ItemQuantity'
import IncludedProductsDetails from "./IncludedProductsDetails";

const Price = observer(({ currencyState, price, hasPricing }) =>
  price
    ? (<DisplayPrice
      price={price}
      hasPricing={hasPricing}
      isHighlighted
      currencyState={currencyState}
    />)
    : (
      <LoadingDots className="loading-dots"/>
    )
)

const CartItem = ({
  currencyState,
  item,
  showSelection = true,
}) => {
  const {
    orderItemId,
    checked,
    quantity,
    thumbnailUrl,
    quantityPerRecipient,
    numRecipients,
    product,
    errors,
    warnings,
    price,
    _listModel,
    _cartModel,
  } = item
  const [alertMessage, setAlertMessage] = useState('')

  const onDelete = () => {
    setAlertMessage(t('Cart.CartItemDeleted'))
    item.delete()
  }

  const handleTransitionEnd = (e) => {
    let target = e.target
    if (!target.classList.contains('cart-ng-confirmation-dialog-backdrop') && target.nextElementSibling?.classList.contains('cart-ng-confirmation-dialog-backdrop')) {
      target = target.nextElementSibling
    }
    if (target.classList.contains('cart-ng-confirmation-dialog-backdrop') && target.classList.contains('fade') && !target.classList.contains('show')) {
      onDelete()
    }
  }

  const editDisabled = item == null || errors.some(({ errorType }) => errorType === CartErrorModel.CART_ERROR_TYPES.ProductNotAvailable)
  const itemInListMode = !_listModel.isUnassigned && _cartModel.isListsMode

  return (
    <div
      className={`item-box-container ${_listModel.isOrderEdit ? 'item-order-edit' : ''} ${alertMessage ? 'close-item' : ''}`}
      onTransitionEnd={handleTransitionEnd}>
      <CartItemAlert message={alertMessage} className={alertMessage ? 'move-right' : ''}/>
      <div className={`item-box ${alertMessage ? 'move-right' : ''} ${showSelection ? 'has-selection' : ''} `}>
        <div className="mobile-title-container">
          <div className="mobile-product-name">
            {showSelection && (
              <div className="cart-item-checkbox-cell">
                <CartCheckbox
                  id={orderItemId}
                  name={orderItemId}
                  className="item-checkbox"
                  checked={checked}
                  onSelect={() => item.toggleSelect()}
                />
              </div>
            )}
            <ProductName item={item}/>
          </div>
          <div className="mobile-nickname">
            {item.nickname && <Nickname
              nickname={item.nickname}
              setNickname={(newNickname) => item.updateNickname(newNickname)}
            />}
          </div>
        </div>
        {showSelection && (
          <div className="cart-item-checkbox-cell">
            <CartCheckbox
              id={orderItemId}
              name={orderItemId}
              className="item-checkbox"
              checked={checked}
              onSelect={() => item.toggleSelect()}
            />
          </div>
        )}
        <CartItemThumbnail src={thumbnailUrl} onThumbnailClick={() => item.edit()} orderItemId={orderItemId}
                           editDisabled={editDisabled} proofInProgress={item.proof.Status === 1}
                           proofWarning={item.proof.Status === 3}
                           proofFailedMessage={warnings.find(warning => warning.errorType === 997)?.message}
        />
        <div className="item-description">
          <ProductName item={item}/>
          <Price
            price={price}
            hasPricing={product.hasPricing}
            currencyState={currencyState}
          />
          <IncludedProductsDetails includedProducts={item.subItems}/>
          <ProductProperties product={product} item={item}/>
          <div className="total"><span className="total-label">{t('Cart.Item.Total')}:</span>
            <ItemQuantity {...{product, numRecipients, quantityPerRecipient, quantity}} />
          </div>
        </div>
        <div className="item-actions">
          <Price
            price={price}
            currencyState={currencyState}
            hasPricing={product.hasPricing}
          />
          <div className="total"><span className="total-label">{t('Cart.Item.Total')}:</span>
            <ItemQuantity {...{ product, numRecipients, quantityPerRecipient, quantity }} />
          </div>
          <CartItemActions {...{ editDisabled, item, setAlertMessage }}
          />
        </div>
        {errors?.length || warnings?.length ? <div className={`cart-item-warning-error-messages ${itemInListMode ? 'warning-in-list-mode':''}`}>
          {errors?.length ? <InfoMessage type="error" messages={errors}/> : null}
          {warnings?.length ? <InfoMessage type="warning" messages={warnings}/> : null}
        </div> : null}
      </div>
    </div>
  )
}

export default observer(CartItem)
