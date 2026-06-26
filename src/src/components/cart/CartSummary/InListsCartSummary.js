import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { t } from '$themelocalization'
import { Slot } from '$core-components'
import CartSummaryContent from './CartSummaryContent'
import CartSummaryButton from './CartSummaryButton'
import { CartSummaryError } from './CartSummaryError'
import CartSummaryExportSuccess from './CartSummaryExportSuccess'
import AssignToListModal, { ASSIGN_LIST_TYPE } from '../CartList/AssignToListModal'
import './InListsCartSummary.scss'
import CartSummaryExportError from './CartSummaryExportError'
import CartListModel from '../model/CartListModel'

const InListCartSummary = ({
  currencyState,
  model,
  loading,
  list
}) => {
  const [showAssignToListModal, setShowAssignToListModal] = useState(false)

  const handleAssignToListSave = async (value) => {
    setShowAssignToListModal(false)
    if (value.listType === ASSIGN_LIST_TYPE.EXISTING) {
      await list.reAssign(value.value, true)
    } else if (value.listType === ASSIGN_LIST_TYPE.NEW) {
      await list.reAssignToNew(value.value, true)
    }
  }

  const isEmptyListClass = list?.items?.length === 0 ? 'in-list-cart-summary-empty-list': ''
  const assignToItemCount = () => {
    if (model?.isListsMode && model?.openedList?.id === CartListModel.CART_LIST_TYPES.UNASSIGNED) {
      return model?.summary?.selectedItemsCount
    }
    return 0
  }

  return (
    <div className={`in-lists-cart-summary ${isEmptyListClass}`}>
      <CartSummaryContent
        currencyState={currencyState}
        model={model}
        loading={loading}
      />
      <CartSummaryButton model={model} loading={loading} setShowAssignToListModal={setShowAssignToListModal}/>
      <Slot name="cart_below_checkout_button" data={model}/>
      {model?.openedList?.exportSuccess
        && <CartSummaryExportSuccess list={list}/>}
      {currencyState.isSecondaryCurrency && <CartSummaryError message={t('Cart.Summary.Warning.PaymentInfo')} />}
      {model?.openedList?.exportError && <CartSummaryExportError model={model} message={t('Cart.Summary.ExportError')} />}
      {showAssignToListModal &&
        <AssignToListModal
          onClose={() => setShowAssignToListModal(false)}
          onSave={handleAssignToListSave}
          model={model}
          list={list}
          count={assignToItemCount()}
        />
      }
    </div>
  )
}

export default observer(InListCartSummary)
