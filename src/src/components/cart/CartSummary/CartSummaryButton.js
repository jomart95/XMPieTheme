import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { t } from '$themelocalization'
import { Button, LoadingDots } from '$core-components'
import CartListModel from '../model/CartListModel'
import CartSummaryTooltip from './CartSummaryTooltip'

const CartSummaryButton = ({ model, loading, setShowAssignToListModal }) => {
  const [isWarningShown, setIsWarningShown] = useState(false)
  const [isErrorShown, setIsErrorShown] = useState(true)

  useEffect(() => {
    setIsErrorShown(model?.summary?.hasErrors)
  }, [model?.openedList, model?.summary?.hasErrors, model?.summary?.hasWarnings])

  const getCheckoutButtonText = () => {
    if (loading) {
      return <LoadingDots className="summary-checkout-loader"/>
    }
    if (model?.isListsMode && model?.openedList?.id === CartListModel.CART_LIST_TYPES.UNASSIGNED) {
      return t('Cart.Summary.ListsCheckoutButton', {count: model?.summary?.selectedItemsCount})
    }
    if ((model?.isListsMode || model?.isSingleListMode) && model?.openedList?.id !== CartListModel.CART_LIST_TYPES.UNASSIGNED) {
      return t('Cart.Summary.ExportButton', { count: model?.summary?.selectedItemsCount })
    }
    return t('Cart.Summary.CheckoutButtonText', { count: model?.summary?.selectedItemsCount })
  }
  const disabledStatus = model?.summary?.selectedItemsCount === 0 ||
    model?.summary?.totalItemsCount === 0 ||
    model?.summary?.hasErrors ||
    (model?.isListsMode && !model?.openedList?.isUnassigned && !model?.openedList?.isModifiedAfterExport && model?.openedList?.isExported) ||
    (model?.isSingleListMode && !model?.openedList?.isModifiedAfterExport && model?.openedList?.isExported)

  return (
    <div className="summary-btn-container">
      <Button
        className="button-primary checkout-btn"
        disabled={disabledStatus}
        text={getCheckoutButtonText()}
        onClick={async () => {
          if (model?.isListsMode && model?.openedList?.id === CartListModel.CART_LIST_TYPES.UNASSIGNED) {
            setShowAssignToListModal(true)
          } else if ((model?.isListsMode || model?.isSingleListMode) && model?.openedList?.id !== CartListModel.CART_LIST_TYPES.UNASSIGNED) {
            if (model?.summary?.hasWarnings) {
              setIsWarningShown(true)
              return
            }
            await model.openedList.export()
          } else if (model?.isWishListMode) {
            if ((model?.summary?.selectedItemsCount === 0 || model?.summary?.hasErrors || model?.summary?.totalItemsCount === 0)) {
              return
            }
            if (model?.summary?.hasWarnings) {
              setIsWarningShown(true)
              return
            }
            if (!model?.summary?.hasErrors) {
              model.checkout()
            }
          }
        }}
      />
      <CartSummaryTooltip
        onOk={() => {
          if (model?.isListsMode && model?.openedList?.id !== CartListModel.CART_LIST_TYPES.UNASSIGNED) {
            setIsWarningShown(false)
            model.openedList.export()
            return
          }
          if (model?.summary?.hasWarnings) {
            model.checkout()
          }
        }}
        show={isWarningShown || isErrorShown}
        type={model?.summary?.hasErrors ? 'error' : 'warning'}
        onCancel={() => {
          setIsWarningShown(false)
          setIsErrorShown(false)
        }}
        isListModel= {model?.isListsMode}
      />
    </div>
  )
}

export default observer(CartSummaryButton)
