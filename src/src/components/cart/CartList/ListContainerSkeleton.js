import React from 'react'
import { t } from '$themelocalization'
import ListBar from './ListBar'
import { CartItemSkeleton } from '../CartItem/CartItemSkeleton'
import './List.scss'

const ListContainerSkeleton = ({ itemsCount, title }) => {
  return (
    <div className="list-container">
      <div className="cart-list-container">
        <div className="cart-header">
          <div className="list-title">
            {`${title} `}
          </div>
        </div>
          <ListBar
            list={{ loading: true, items: new Array(itemsCount) , itemsCount}}
            emptyAllText={t('Cart.EmptyCartButton')}
          />
          {(new Array(itemsCount)).fill(1).map((_, index) => {
              return <CartItemSkeleton key={`item-skeleton-${index}`} />
          })}
      </div>
    </div>
  )
}

export default ListContainerSkeleton
