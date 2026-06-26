import React from 'react'
import { Icon } from '$core-components'

export const CartSummaryError = ({ message }) => {
  if (!message) return null

  return (
    <div className="cart-summary-payment-info">
      <Icon name="info2.svg" width="16px" height="16px" className="info-icon"/>
      {message}
    </div>
  )
}
