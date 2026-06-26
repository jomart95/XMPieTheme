import React, { useRef, useState } from 'react'
import { NavHashLink } from 'react-router-hash-link'
import { observer } from 'mobx-react-lite'
import { t } from '$themelocalization'
import { Icon, Dropdown } from '$core-components'
import List from './List'
import CartListModel from '../model/CartListModel'
import { Slot } from '$core-components'
import './List.scss'
import themeVariables from '$styles/theme'
import CartModel from '../model/CartModel'

const CartList = ({ model, currencyState }) => {
  const sortDropDownItems = [
    { name: t('Cart.Sorting.SortByDefault'), value: CartModel.CART_SORT_BY.DATE, icon: 'check.svg' },
    { name: t('Cart.Sorting.NameAscending'), value: CartModel.CART_SORT_BY.NAME_ASC, icon: 'check.svg' },
    { name: t('Cart.Sorting.NameDescending'), value: CartModel.CART_SORT_BY.NAME_DESC, icon: 'check.svg' },
  ]

  const navHashLinkRef = useRef()
  const headerHeightDesktop = getComputedStyle(document.documentElement).getPropertyValue('--header-height-desktop')
  const [selectedSort, setSelectedSort] = useState(sortDropDownItems.find(item => item.value === model.sorting))

  const getHeaderOffset = () => {
    return window.innerWidth < parseInt(themeVariables.lg) && headerHeightDesktop ? 0 : parseInt(headerHeightDesktop)
  }

  const scrollWidthOffset = (el) => {
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - getHeaderOffset(), behavior: 'smooth' })
  }

  const setSorting = (newSorting) => {
    model.setSorting(newSorting.value)
    setSelectedSort(newSorting)
  }

  if (!model) return null

  return (
    <div className={`list-container ${model.isListsMode ? 'cart-lists-mode' : ''}`} id="cart-list">
      <div className="cart-header">
        <div className="list-title">
          {t('Cart.ShoppingCartTitle')} {model.affectPricingItems.length && model.isWishListMode ? `(${model.affectPricingItems.length})` : null}
        </div>
        {
          model.lists.some((list) => list.id === CartListModel.CART_LIST_TYPES.WISH_LIST) &&
          (
            <NavHashLink ref={navHashLinkRef} to={`#wish-list-${CartListModel.CART_LIST_TYPES.WISH_LIST}`}
                         scroll={el => scrollWidthOffset(el)}>
              <Icon name="Cart_DisplayWishList.svg" width="20px" height="20px" title={t('Cart.GoToWishList')} className="go-to-wishlist-icon"/>
            </NavHashLink>
          )
        }
      </div>
      {model.isListsMode && <div className="sort-list-container">
        <div className="sort-list-inner-container">
          <div className="sort-list-sort-by">
            {t('Cart.Sorting.SortBy')}
          </div>
          <Dropdown items={sortDropDownItems} onChange={(item) => {setSorting(item)}} selectedValue={selectedSort}/>
        </div>
      </div>}
      <Slot name="cart_under_title" data={model}/>
      {
        model.shoppingCartText &&
        <div className="list-text" dangerouslySetInnerHTML={{ __html: model.shoppingCartText }}/>
      }
      {
        model.affectPricingItems.length === 0 && model.isWishListMode &&
        <div className="list-empty">
          <div className="list-empty-title">{t('Cart.Wishlist.EmptyCartListText')}</div>
          <div className="list-empty-divider"/>
        </div>
      }
      {
        model.affectPricingLists.map((list) => (
          <List
            key={`list-${list.originalOrderFriendlyId ?? list.id}`}
            model={model}
            list={list}
            currencyState={currencyState}
          />
        ))
      }
    </div>
  )
}

export default observer(CartList)
