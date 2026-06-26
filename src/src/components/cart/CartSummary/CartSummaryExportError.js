import React, {useEffect} from 'react'
import { Icon } from '$core-components'
import './CartSummaryExportError.scss'


const CartSummaryExportError = ({model,  message }) => {
  useEffect(() => {
    setTimeout(() => {
      model?.openedList?.clearExportError()
    }, 5000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  return (
    <div className="cart-summary-export-error">
      <Icon name="warning.svg" width="12px" height="12px"/>{message}
    </div>
  )
}

export default CartSummaryExportError
