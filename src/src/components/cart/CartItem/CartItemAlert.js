import React from 'react'
import { Icon } from '$core-components'
import './CartItemAlert.scss'

const CartItemAlert = ({ message, className }) => (
  <div className={`delete-cart-item ${className}`}>
    <div className="content">
      <div className="cart-delete-icon">
        <Icon name="close_black.svg" width="14px" height="14px" />
      </div>
      <div className="text">{message}</div>
    </div>
  </div>
);

export default CartItemAlert
