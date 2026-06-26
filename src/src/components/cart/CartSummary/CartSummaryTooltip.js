import React from 'react'
import { ReactComponent as ErrorIcon } from '$assets/icons/error.svg'
import { Icon } from '$core-components'
import { t } from '$themelocalization'
import './CartSummaryTooltip.scss'

const CartSummaryTooltip = ({ type, show, onOk, onCancel, isListModel }) => show ? (
  <div className="cart-tooltip">
    {type === 'error'
      ? (
        <div className="cart-tooltip-inner">
          <button className="close" onClick={() => onCancel()}>
            <Icon name="close_black.svg" width="10px" height="10px"/>
          </button>
          <div className="cart-error-message">
            <ErrorIcon width="15px" height="15px"/>
            {isListModel ? <span>{t('Cart.Summary.Warning.ExportErrorMessage')}</span> :
              <span>{t('Cart.Summary.Warning.ErrorMessage')}</span>}
          </div>
        </div>
      ) : (
        <div className="cart-tooltip-inner">
          <div className="warn-message">
            <span>{t('Cart.Summary.Warning.WarningMessage')}</span>
            <span>&nbsp;{t('Cart.Summary.Warning.ConfirmQuestion')}</span>
          </div>
          <div className="tooltip-btn-container">
            <div className="tooltip-btn cancel-btn" onClick={() => onCancel()}><span>{t('Cart.Summary.Warning.RejectMessage')}</span>
            </div>
            <div
              className="tooltip-btn continue-btn"
              onClick={() => onOk()}>
              <span>{t('Cart.Summary.Warning.ConfirmMessage')}</span>
            </div>
          </div>
        </div>
      )
    }
  </div>
) : null

export default CartSummaryTooltip
