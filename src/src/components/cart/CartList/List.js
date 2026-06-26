import React, { useEffect, useState, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { debounce } from 'throttle-debounce'
import { t } from '$themelocalization'
import CartListModel from '../model/CartListModel'
import ListBar from './ListBar'
import CartItem from '../CartItem'
import { CART_MODE, proofThumbnailUpdater } from '$themeservices'
import InListsCartSummary from '../CartSummary/InListsCartSummary'

const getItemsCountForLoad = () => {
  const cartItemHeight = 165
  return Math.floor(window.innerHeight / cartItemHeight)
}

const getListTitle = (list) => {
  if (list.id === CartListModel.CART_LIST_TYPES.DEFAULT && (list._cartModel.hasEditOrApproval || list._cartModel.hasReorder)) return t('Cart.CartSectionTitle')
  return list.title
}

const List = ({ model, list, currencyState }) => {
  const [loadedItems, setLoadedItems] = useState(list?.items.slice(0, getItemsCountForLoad()))
  const [listOpen, setListOpen] = useState(model.openedList?.id === list.id || !model.isListsMode)
  const listContentRef = useRef(null)
  const showSummary = model.isListsMode
  const isEmptyList = list.itemsCount === 0 && (model.isListsMode || model.isSingleListMode)

  useEffect(() => {
    if (list.items) {
      setLoadedItems(list.items)
      const itemsToProofCheck = list.items.filter(item => item.proof.Status === 1).map(item => item.orderItemId)
      if (itemsToProofCheck.length) {
        proofThumbnailUpdater.run(itemsToProofCheck)
      }
      setTimeout(() => setMaxHeight(), 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.items])

  const setMaxHeight = () => {
    if (model.isListsMode && listContentRef.current) {
      if (model.openedList?.id === list.id) {
        setListOpen(true)
        listContentRef.current.style.maxHeight = listContentRef.current.scrollHeight + 'px'
      } else {
        setListOpen(false)
        listContentRef.current.style.maxHeight = '0px'
      }
    }
  }


  useEffect(() => {
    const setMaxHeightDebounced = debounce(100, setMaxHeight)
    if (model.isListsMode) {
      window.addEventListener('resize', setMaxHeightDebounced)
      const contentObserver = new MutationObserver(setMaxHeightDebounced)
      contentObserver.observe(listContentRef.current, { childList: true, subtree: true, attributes: true })
      return () => {
        window.removeEventListener('resize', setMaxHeightDebounced)
        contentObserver.disconnect()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (model._cartMode === CART_MODE.WishList && list.items.length === 0) return null

  const onTitleClick = () => {
    if (!model.isListsMode) {
      return
    }
    model.openList(list.id === model.openedList?.id ? null : list.id)
  }

  const getListClasses = () => {
    if (model?.isListsMode) {
      const classes = ['cart-lists-mode']
      if (list.id === CartListModel.CART_LIST_TYPES.UNASSIGNED){
        classes.push('unassigned-list')
      }
      if (list.id === model?.openedList?.id) {
        classes.push('list-is-open')
      }
      if (isEmptyList) {
        classes.push('empty-list')
      }
      return classes.join(' ')
    }
    if (list.id === CartListModel.CART_LIST_TYPES.DEFAULT || CartListModel.CART_LIST_TYPES.ORDER_APPROVAL) {
      return 'list-is-open'
    }

    return ''
  }

  const getListContentClasses = () => {
    const classes = ['list-content']
    if (!listOpen) {
      classes.push('closed-list')
    }
    return classes.join(' ')
  }

  const onTransitionEnd = (e) => {
    if (e.target !== listContentRef.current) return
    setMaxHeight()
  }

  return (
    <div className={getListClasses()}>
      <ListBar
        key={`list-bar-${list.id}`}
        model={model}
        list={list}
        emptyAllText={list.emptyAllText}
        listTitle={getListTitle(list)}
        onTitleClick={model.isListsMode ? onTitleClick : null}
      />
        <div className={getListContentClasses()} ref={listContentRef} onTransitionEnd={onTransitionEnd}>
          {
            isEmptyList
              ? <div className="cart-lists-empty-list">{t('Cart.EmptyListText')}</div>
              : loadedItems.map((item) => (
                <CartItem
                  key={item.orderItemId}
                  currencyState={currencyState}
                  item={item}
                  showSelection={model.isListsMode ?
                    list.isUnassigned :
                    (list.isDefault || list.isOrderApproval || list.isOrderEdit || list.isReorder)
                  }
                />
              ))
          }
          {showSummary && <InListsCartSummary
            currencyState={currencyState}
            model={model ?? null}
            loading={!model || model?.summary?.loading}
            list={list}
          />}
        </div>
    </div>
  )
}

export default observer(List)
