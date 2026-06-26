import React from 'react'
import { observer } from 'mobx-react-lite'
import { Icon } from '$core-components'
import './CartCheckbox.scss'

const CartCheckbox = ({ name, id, checked, label, onSelect }) => (
  <div className="cart-ng-checkbox-container">
    <input onClick={onSelect} type="checkbox" id={id} name={name}/>
    <label htmlFor={id}>
      <div className="cart-ng-checked-icon-container" style={{ display: checked ? 'inline-flex' : 'none' }}>
        <Icon
          width="22px"
          height="22px"
          name="check.svg"
        />
      </div>
      <span className="cart-list-label">{label}</span>
    </label>
  </div>
)

export default observer(CartCheckbox)
