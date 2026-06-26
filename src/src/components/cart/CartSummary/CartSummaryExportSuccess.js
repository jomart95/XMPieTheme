import React, { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { Icon } from '$core-components'
import { t } from '$themelocalization'
import './CartSummaryExportSuccess.scss'
import {formatDate} from '../model/utils';

const CartSummaryExportSuccess = observer(({list}) => {
  const exportSuccess = list?.exportSuccess
  const exportDate = formatDate(exportSuccess?.ExportDate)
  const modifiedDate = formatDate(list.modificationDate)

  useEffect(() => {
    setTimeout(() => {
      list?.clearExportSuccessMessage()
    }, 3000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list?.exportSuccessMessage])

  return (
    <>
      <div className="cart-summary-success-export-info">
        {list.isModifiedAfterExport && <div className="cart-summary-success-export-modified-warn">
          {t('Cart.Summary.ModificationWarning', {date: modifiedDate})}</div>}
        {exportDate && <div>{t('Cart.Summary.ExportedOn', {date: exportDate})}</div>}
        <a href={exportSuccess?.ExternalUrl} target="_blank" rel="noopener noreferrer">{t('Cart.ListBar.ViewExported')}</a>
      </div>
      {list?.exportSuccessMessage && <div className="cart-summary-success-export">
        {t('Cart.Summary.SuccessExport')}
        <Icon name="checkmark_green.svg" width="16px" height="16px" className="success-icon"/>
      </div>}
    </>
  )
})

export default CartSummaryExportSuccess
