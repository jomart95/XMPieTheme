import React from 'react'
import { observer } from 'mobx-react-lite'
import { t } from '$themelocalization'
import { Dropdown, Icon } from '$core-components'
import DuplicateAction from '../duplucate/DuplicateAction'

const showDeleteAction = (list) => !list.isSingleListMode && (!list.isUnassigned || (list.isUnassigned && list.itemsCount > 0))
const showAssignTo = (list) => list.isUnassigned && list.itemsCount > 0
const showRename = (list) => !list.isUnassigned
const showDuplicate = (list) => !list.isUnassigned && !list._cartModel.isSingleListMode

export const MobileCustomListActions = observer((props) => {
  const { showItemsCount, list} = props
  const hasExportedItems = list.isExported

  const items = [
    showRename(list) && { name: t('Cart.ListBar.Rename'), value: 'onTitleEdit', icon: 'cart_edit.svg' },
    showDuplicate(list) && { name: t('Cart.ListBar.Duplicate'), value: 'onDuplicateList', icon: 'cart_duplicate.svg', disabled: list.allItemsOffline || list.itemsCount === 0 },
    showAssignTo(list) && { name: t('Cart.ListBar.AssignTo'), value: 'onAssignToList', icon: 'link.svg', width:'16px', height:'16px'},
    hasExportedItems && { value: 'onViewExported', component: () =>
        <div className="exported-list"><Icon name="exported_list.svg" width="18px" height="18px"
                                             wrapperClassName="cart-list-bar-export-icon" title={''}/>
          <a href={list.exportSuccess?.ExternalUrl} target="_blank"  rel="noreferrer">{t('Cart.ListBar.ViewExported')}</a></div>
    },
    showDeleteAction(list) && (showAssignTo(list)  || hasExportedItems) && { divider: true },
    showDeleteAction(list) && { name: t('Cart.ListBar.Delete'), value: 'onDelete', icon: 'delete.svg' },
  ].filter(i => !!i )

  const onChange = (selected) => {
    props[selected.value]()
  }

  const dropDownToggle = <Icon name="menu_2.svg" width="13px" height="16px"/>
  return <>
    {list.isModifiedAfterExport && <div className="cart-list-bar-mobile-export-icon-container">
      <Icon name="info.svg" width="18px" height="18px" wrapperClassName="cart-list-bar-export-icon" title={''}/>
    </div>}
    <div className="cart-list-bar-mobile-actions-drop-down">
      <span className="cart-items-count">{showItemsCount && `(${list.itemsCount})`}</span>
      <Dropdown {...{ items, onChange, dropDownToggle }} end disabled={list.isEmpty && list.isUnassigned}/>
    </div>
  </>
})

export const DesktopCustomListActions = observer(({ showItemsCount, list, onAssignToList, onDelete }) => {
  const hasExportedItems = list.isExported

  return <div className="cart-list-bar-desktop-actions-drop-down">
    {hasExportedItems &&
      <>
        {list.isModifiedAfterExport && <div className="cart-list-bar-export-icon-container">
          <Icon name="info.svg" width="18px" height="18px" wrapperClassName="cart-list-bar-export-icon" title={''}/>
          <div className="cart-list-bar-export-tooltip"> {t('Cart.ListBar.ThereWereChanges')}</div>
        </div>}
        <a className="exported-list" href={list?.exportSuccess.ExternalUrl} target="_blank"
           rel="noreferrer">{t('Cart.ListBar.ViewExported')}</a>
      </>
    }
    {showAssignTo(list) && <Icon name="link.svg" size="15px" wrapperClassName="cart-list-bar-link-icon"
                                 onClick={onAssignToList} title={t('Cart.Dialog.AssignToList.Label')} />}
    {!list.isUnassigned && <DuplicateAction list={list}  />}
    {showDeleteAction(list) && (
      <button className={`empty-custom-list-button`} onClick={onDelete}>
        <Icon wrapperClassName="empty-cart-button-icon" name="cart_delete.svg" width="14px" height="16px" title={t('Cart.DeleteTooltip')}/>
        &nbsp;<span className="cart-items-count">{showItemsCount && `(${list.itemsCount})`}</span>
      </button>
    )}
  </div>
})
