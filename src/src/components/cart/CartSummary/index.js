import React, {useContext, useEffect, useRef, useState} from 'react'
import { observer } from 'mobx-react-lite'
import { t } from '$themelocalization'
import { RootDocumentContext } from '$themeservices'
import CartSummaryContent from './CartSummaryContent'
import CartSummaryButton from './CartSummaryButton'
import { CartSummaryError } from './CartSummaryError'
import CartSummaryExportSuccess from './CartSummaryExportSuccess'
import CartSummaryExportError from './CartSummaryExportError'
import AssignToListModal, { ASSIGN_LIST_TYPE } from '../CartList/AssignToListModal'
import { Slot } from '$core-components'
import './index.scss'
import CartListModel from '../model/CartListModel'



const CartSummary = ({
  currencyState,
  model,
  loading,
  withSticky = false
}) => {
  const {documentRoot} = useContext(RootDocumentContext)()
  const summaryRef = useRef(null)
  const footerObserver = useRef(null)
  const [showAssignToListModal, setShowAssignToListModal] = useState(false)

  const observeCallback = (entries) => {
    entries.forEach((entry) => {
     if (entry.isIntersecting) {
       summaryRef.current.style.position = 'relative'
       summaryRef.current.style.marginTop = documentRoot.querySelector('.header').getBoundingClientRect().height + 'px'
     } else {
        summaryRef.current.style.position = 'fixed'
       summaryRef.current.style.marginTop = ''
     }
    })
  }

  useEffect(() => {
    if (withSticky) {
      const footerElement = documentRoot.querySelector('.footer')
      footerObserver.current = new IntersectionObserver(observeCallback, {
        root: null,
        rootMargin: '0px',
        threshold: 0.3,
      })
      if (footerElement) {
        footerObserver.current?.observe(documentRoot.querySelector('.footer'))
      }
    }
    return () => {
      if (withSticky) {
        footerObserver.current?.disconnect()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const handleAssignToListSave = async (value) => {
    setShowAssignToListModal(false)
    if (value.listType === ASSIGN_LIST_TYPE.EXISTING) {
      await model.openedList.reAssign(value.value, true)
    } else if (value.listType === ASSIGN_LIST_TYPE.NEW) {
      await model.openedList.reAssignToNew(value.value, true)
    }
  }

  const isExportErrorClass = model?.openedList?.exportError ? 'cart-summary-button-export-error' : ''

  const assignToItemCount = () => {
    if (model?.isListsMode && model?.openedList?.id === CartListModel.CART_LIST_TYPES.UNASSIGNED) {
      return model?.summary?.selectedItemsCount
    }
    return 0
  }

  return (
    <div className={`cart-summary ${isExportErrorClass}`} ref={summaryRef}>
      <CartSummaryContent
        currencyState={currencyState}
        model={model}
        loading={loading}
      />
      <Slot name="cart_above_checkout_button" data={model}/>
      {model?.isListsMode && model?.openedList == null ? null : (
        <CartSummaryButton model={model} loading={loading} setShowAssignToListModal={setShowAssignToListModal}/>
      )}
      <Slot name="cart_below_checkout_button" data={model}/>
      {model?.openedList?.exportSuccess
        && <CartSummaryExportSuccess list={model?.openedList}/>}
      {model?.openedList?.exportError &&
        <CartSummaryExportError model={model} message={t('Cart.Summary.ExportError')}/>}
      {currencyState.isSecondaryCurrency && <CartSummaryError message={t('Cart.Summary.Warning.PaymentInfo', { currency: currencyState.primaryCurrencyName })}/>}
      {model?.isWishListMode && model?.errors.filter(error => error.errorType === 15).map((error) => {
        return <CartSummaryError key={error} message={error.message}/>
      })}
      {showAssignToListModal &&
        <AssignToListModal
          onClose={() => setShowAssignToListModal(false)}
          onSave={handleAssignToListSave}
          model={model}
          list={model?.openedList}
          count={assignToItemCount()}
        />
      }
    </div>
  )
}

export default observer(CartSummary)
