import React from 'react'
import Skeleton from 'react-loading-skeleton'

import './CartItemSkeleton.scss'

export const CartItemSkeleton = () => (
  <div className="cart-item-skeleton">
    <Skeleton className="skeleton thumbnail"/>

    <div className="description">
      <Skeleton className="skeleton name"/>
      <Skeleton className="skeleton description-1"/>
      <Skeleton className="skeleton description-2"/>
      <Skeleton className="skeleton description-3"/>
    </div>
  </div>
)

