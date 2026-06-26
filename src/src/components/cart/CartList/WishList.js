import React from 'react'
import { observer } from 'mobx-react-lite'
import { t } from '$themelocalization'
import ListBar from './ListBar'
import CartItem from '../CartItem'
import CartListModel from '../model/CartListModel'
import './List.scss'
import './WishList.scss'

const WishList = ({ model, list }) => (
  <div className="list-container wish-list" id={`wish-list-${CartListModel.CART_LIST_TYPES.WISH_LIST}`}>
    <div className={`cart-header ${list?.items.length === 0 ? 'list-is-empty' : ''}`}>
      <div className="list-title">
        {list.title} ({list.items.length})
      </div>
    </div>
    {list.items.length === 0 ? (
      <div className="list-empty">
        <div className="list-empty-title">{t('Cart.Wishlist.EmptyWishListText')}</div>
      </div>
    ) : (
      <>
        <ListBar
          key={`list-bar-${list.id}`}
          model={model}
          list={list}
          listTitle={t('Cart.Wishlist.ListBarTitle')}
          emptyAllText={t('Cart.Wishlist.EmptyButtonText')}
          sectionTitle={t('Cart.Wishlist.ListBarTitle')}
        />
        <div>
          {list.items.filter((item) => item.listId === list.id).map((item) => (
              <CartItem
                key={item.orderItemId}
                item={item}
                showSelection={false}
              />
            )
          )}
        </div>
      </>
    )}
  </div>
)

export default observer(WishList)
