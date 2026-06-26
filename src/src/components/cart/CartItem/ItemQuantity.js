import React from 'react';
import './ItemQuantity.scss'

const ItemQuantity = ({ numRecipients, quantityPerRecipient, quantity, product }) => {
  const totalQuantity = numRecipients && quantityPerRecipient ? numRecipients * quantityPerRecipient : quantity;

  return (
    <span className="item-quantity">
    {
      product.unit.packSingular ? (
        <>
          <span className="total-quantity">{totalQuantity}</span>
          <span className="quantity-units">{quantity > 1 ? product.unit.packPlural : product.unit.packSingular}</span>
          <span className="bracket-open">(</span>
          <span className="quantity">{product.unit.quantity}</span>
          <span className="quantity-base">{product.unit.quantity > 1 ? product.unit.plural : product.unit.singular}</span>
          <span className="dividing-slash">/</span>
          <span className="pack-singular">{product.unit.packSingular}</span>
          <span className="bracket-close">)</span>
        </>
      ) : (
        totalQuantity > 1 ? (
          <>
            <span className="total-quantity">{totalQuantity}</span>
            <span className="product-units-plural">{product.unit.plural}</span>
          </>
        ) : (
          <>
            <span className="total-quantity">{totalQuantity}</span>
            <span className="product-units-singular">{product.unit.singular}</span>
          </>
        )
      )
    }
    </span>
  );
};

export default ItemQuantity;
