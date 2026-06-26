import React from 'react'
import { observer } from 'mobx-react-lite'
import { t } from '$themelocalization'
import { ExpandableList } from './ExpandableList'
import './ProductProperties.scss'

const ProductProperties = ({ item, product }) => {
  const getPackSize = () =>
    `${product.unit.quantity} ${product.unit.quantity > 1 ? product.unit.plural : product.unit.singular} / ${product.unit.packSingular}`

  return (
    <div className="cart-item-properties">
      {item.properties.length > 0 ? <ExpandableList properties={item.properties}/> : null}
      {product.packSingular && <div className="property">({getPackSize()})</div>}
      {item.numRecipients > 1 && item.quantityPerRecipient && (
        // the condition numRecipients > 1 is there because we can't distinguish between product types
        // it was decided between @Nachman and @Oleksii 07/04/23
        <div className="recipients">
          <div className="property">{t('Cart.Item.Recipients')}: {item.numRecipients}</div>
          <div className="property">{t('Cart.Item.Quantity')}: {item.quantityPerRecipient}</div>
        </div>
      )}
    </div>
  )
}

export default observer(ProductProperties)
