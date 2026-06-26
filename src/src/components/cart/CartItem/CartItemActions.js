import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Icon } from '$core-components'
import { t } from '$themelocalization'
import ConfirmationDialog from '../ConfirmationDialog'
import AssignToListModal, { ASSIGN_LIST_TYPE } from '../CartList/AssignToListModal'
import DuplicateAction from '../duplucate/DuplicateAction'

import './CartItemActions.scss'

const CartItemActions = ({
  editDisabled,
  item,
  setAlertMessage,
}) => {
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)
  const [showAssignToListModal, setShowAssignToListModal] = useState(false)



  const {  _cartModel, _listModel } = item
  const isListsMode  = _cartModel.isListsMode
  const isWishList = _listModel.isWishList
  const isSingleListMode = _cartModel.isSingleListMode
  const isDuplicateAllowed = !item.isUnassigned && !isWishList

  const onAssignToListSave = async (value) => {
    setShowAssignToListModal(false)
    if (value.listType === ASSIGN_LIST_TYPE.EXISTING) {
      await item.reAssign(value.value)
    } else if (value.listType === ASSIGN_LIST_TYPE.NEW) {
      await item.reAssignToNew(value.value)
    }
    setShowAssignToListModal(false)
  }

  return (
    <div className="actions-list">
      {item.affectsPricing &&
        <button
          className="action"
          disabled={editDisabled}
          onClick={() => item.edit()}
        >
          <Icon name="cart_edit.svg" width="20px" height="20px" title={t('Cart.EditTooltip')}/>
        </button>
      }
      {isListsMode &&
        <button
          className="action"
          onClick={() => setShowAssignToListModal(true)}
        >
          <Icon name="link.svg" width="20px" height="20px" wrapperClassName="cart-list-bar-link-icon" title={t('Cart.Dialog.AssignToList.Label')}/>
        </button>
      }
      {isDuplicateAllowed && <DuplicateAction item={item} showLargeIcon={true}/>}
      {item.affectsPricing && !isListsMode && !isSingleListMode &&
        <button
          className="action move-to-wishlist"
          onClick={() => {
            setAlertMessage(t('Cart.CartItemMoveToWishList'))
            item.moveItemToWishlist()
          }}
        >
          <Icon name="cart_wishlist.svg" width="20px" height="20px" title={t('Cart.MoveToWishList')}/>
      </button>}
      {isWishList &&
        <button className="action move-to-cart" onClick={() => {
          setAlertMessage(t('Cart.WishListItemMoveToCart'))
          item.moveItemToCart()
        }}>
          <Icon name="cart_backtocart.svg" width="20px" height="20px" title={t('Cart.MoveToCart')}/>
        </button>
      }
      <div className="divider"/>
      <button
        className="action"
        onClick={() => {
          if (!isWishList) {
            setShowConfirmationDialog(true)
          } else {
            setAlertMessage(t('Cart.CartItemDeleted'))
            item.delete()
          }
      }}>
        <Icon name="cart_delete.svg" width="20px" height="20px" title={t('Cart.DeleteTooltip')}/>
      </button>
      <ConfirmationDialog
        open={showConfirmationDialog}
        itemThumbnail={item.thumbnailUrl}
        confirmationText={t('Cart.Dialog.Delete.ConfirmDeleteItem')}
        confirmButtonText={t('Cart.Dialog.Delete.ConfirmDeleteButtonText')}
        rejectButtonText={t('Cart.Dialog.Delete.RejectButtonText')}
        onReject={() => setShowConfirmationDialog(false)}
        onConfirm={() => {
          setShowConfirmationDialog(false)
        }}
      />
      {showAssignToListModal &&
        <AssignToListModal
          onClose={() => setShowAssignToListModal(false)}
          onSave={onAssignToListSave}
          model={item._cartModel}
          list={item._listModel}
          assignSingleItem={true}
          count={1}
        />
      }
    </div>
  )
}

export default observer(CartItemActions)
