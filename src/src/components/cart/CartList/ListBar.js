import React, { useState } from 'react'
import { t } from '$themelocalization'
import { observer } from 'mobx-react-lite'
import { Icon } from '$core-components'
import CartCheckbox from './CartCheckbox'
import EditListNameModal from './EditListNameModal'
import ConfirmationDialog from '../ConfirmationDialog'
import AssignToListModal, { ASSIGN_LIST_TYPE } from './AssignToListModal'
import ConfirmDuplicationModal from '../duplucate/ConfirmDuplicationModal'
import {MobileCustomListActions, DesktopCustomListActions} from './CustomListActions'
import './ListBar.scss'
import CartListModel from '../model/CartListModel'
import DuplicateItemsDialogError from '../duplucate/DuplicateItemsDialogError'
import CartErrorModel from '../model/CartErrorModel'

const CustomListTitle = ({ listTitle, onEdit, list, model }) => {
  return (
    <div className="cart-list-bar-custom-title">
      {!model.isSingleListMode && <Icon name="arrowDown.svg" width="13px" height="8px" className="cart-list-bar-arrow-down"/>}
      {listTitle.length > 80 ? listTitle.substring(0,79) + "..." : listTitle}
      {!list.isUnassigned &&
        <div className="cart-list-bar-edit" onClick={onEdit}><Icon name="cart_edit.svg" width="13px" height="13px" /></div>}
    </div>
  )
}

const CustomListActions = observer(({
  model,
  list,
  setShowDeleteAllConfirmation,
  setDeleteConfirmationText,
  showItemsCount,
  onAssignToList,
  onDeleteWithNoConfirmation,
  onTitleEdit,
  onDuplicateList,
}) => {
  const onDelete = () => {
    if (!list.isUnassigned && list.itemsCount === 0) {
      onDeleteWithNoConfirmation()
      return
    }
    setDeleteConfirmationText(list.isUnassigned ? t('Cart.Dialog.Delete.ConfirmEmptyUnassignedList') : t('Cart.Dialog.Delete.ConfirmDeleteList'))
    setShowDeleteAllConfirmation(true)
  }

  if (!model.isListsMode)
    return null

  return <div className="cart-list-bar-custom-list-actions">
    <DesktopCustomListActions {...{showItemsCount, list, onAssignToList, onDelete}}/>
    <MobileCustomListActions onViewExported={() => {}} {...{onDelete, showItemsCount, list, onAssignToList, onTitleEdit, onDuplicateList}}/>
  </div>
})

const ListBar = ({
  model,
  list,
  listTitle,
  emptyAllText,
  showItemsCount = true,
  onTitleClick,
}) => {
  const [showDeleteAllConfirmation, setShowDeleteAllConfirmation] = useState(false)
  const [showAssignToListModal, setShowAssignToListModal] = useState(false)
  const [showDuplicateListModal, setShowDuplicateListModal] = useState(false)
  const [showListNameEdit, setShowListNameEdit] = useState(false)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState(t('Cart.Dialog.Delete.ConfirmDeleteAllCart'))
  const [duplicateDialogMessage, setDuplicateDialogMessage] = useState('')

  if (!model) return (<div className="cart-list-bar list-is-open">
    <div/>
    <div className="empty-cart-button">
      <span className="empty-all-text">{emptyAllText}&nbsp;</span>
      <span className="cart-items-count">{showItemsCount && `(${list.itemsCount})`}</span>
    </div>
  </div>)

  const onTitleEdit = (e) => {
    e?.stopPropagation()
    setShowListNameEdit(true)
  }

  const onAssignToList = () => {
    setShowAssignToListModal(true)
  }

  const onDuplicateList = () => {
    setShowDuplicateListModal(true)
  }

  const onListNameSave = async (newName) => {
    setShowListNameEdit(false)
    await list.rename(newName)
  }

  const onAssignToListSave = async (value) => {
    setShowAssignToListModal(false)
    if (value.listType === ASSIGN_LIST_TYPE.EXISTING) {
      await list.reAssign(value.value)
    } else if (value.listType === ASSIGN_LIST_TYPE.NEW) {
      await list.reAssignToNew(value.value)
    }
  }

  const onDuplicateListSave = async () => {
    setShowDuplicateListModal(false)
    const res = await list.duplicate()
    if ([CartErrorModel.CART_ERROR_TYPES.ProductComponentNotAvailable, CartErrorModel.CART_ERROR_TYPES.ProductNotAvailable ].includes(res?.Type)) {
      setDuplicateDialogMessage(res.Message)
    }
  }

  const handleDeleteAllDialogConfirm = async () => {
    setShowDeleteAllConfirmation(false)
    if (model.isWishListMode || (model.isListsMode && list.isUnassigned)) {
      await list.emptyList()
    } else if (model.isListsMode) {
      await list.emptyList()
      if (!list.isUnassigned) {
        await list.deleteList()
      }
    }
  }

  const handleRevertModification = async () => {
    if (list.isWishList) {
      setDeleteConfirmationText(t('Cart.Dialog.Delete.ConfirmDeleteAllWishlist'))
      setShowDeleteAllConfirmation(true)
      return
    }
    if (list.isOrderEdit || (list.isDefault && model.hasEditOrApproval)) {
      setDeleteConfirmationText(t('Cart.Dialog.Delete.ConfirmDeleteAllLists'))
      setShowDeleteAllConfirmation(true)
      return
    }
    await model.revertModifications()
  }

  const getContainerClassList = () => {
    const classes = ['cart-list-bar']
    if (model.openedList?.id === list.id && (model.isListsMode || model.isSingleListMode)) {
        classes.push('list-open')
    }
    if (model?.hasEditOrApproval || model.isSingleListMode) {
      classes.push('highlight-bottom-border')
    }
    if (model.isSingleListMode) {
      classes.push('single-list-mode')
    }

    return classes.join(' ')
  }

  return (
    <>
      <div className={getContainerClassList()}>
        {list.isWishList ?  <p className="wish-list-label">{listTitle}</p> :
          (
            model.loading === false ? <div
              className={`${model.isListsMode ? 'cart-list-bar-clickable' : ''}`}
              onClick={() => model.isListsMode && onTitleClick()}
            >
              {model.isListsMode || model.isSingleListMode ?
                <CustomListTitle  model={model} listTitle={listTitle} onEdit={onTitleEdit} list={list}/>
                :
                <CartCheckbox
                  name={`cart-list-bar-checkbox-${list.originalOrderFriendlyId ?? list.id}`}
                  id={`cart-list-bar-checkbox-${list.originalOrderFriendlyId ?? list.id}`}
                  onSelect={() => list.toggleSelectAll()}
                  checked={list?.items?.length === list?.selected?.length && list?.items?.length > 0}
                  className="cart-list-bar-checkbox-wrapper"
                  label={listTitle}
                />
              }
            </div> : <div/>
          )}
        {model.isListsMode || model.isSingleListMode
          ? <CustomListActions
              {...{
                model,
                list,
                setShowDeleteAllConfirmation,
                setDeleteConfirmationText,
                showItemsCount,
                onAssignToList,
                onDuplicateList,
                onTitleEdit,
              }}
              onDeleteWithNoConfirmation={handleDeleteAllDialogConfirm}
            />
          : <div>
            {model.hasEditOrApproval ?
              <button
                className={`empty-cart-button empty-cart-order-approval ${list.isOrderEdit ? 'empty-cart-order-approval-icon' : ''}`}
                onClick={handleRevertModification}
              >
                {list.isOrderApproval && <Icon wrapperClassName="approval-empty-cart-button-icon" name="cart_delete.svg" width="20px" height="20px" title={emptyAllText}/>}
                {!list.isOrderApproval && <Icon wrapperClassName="empty-cart-button-icon" name="delete.svg" width="14px" height="16px" title={t('Cart.DeleteTooltip')}/>}
                {list?.id !== CartListModel.CART_LIST_TYPES.DEFAULT && <span className="empty-all-text">{emptyAllText}&nbsp;</span>}
                {!list.isOrderApproval && <>&nbsp;<span className="cart-items-count">{showItemsCount && `(${list.items.length})`}</span></>}
              </button>
              :
              <button
                className={`empty-cart-button ${list.isReorder ? '' : 'empty-cart-hide-icon'}`}
                onClick={() => {
                  if (list.isWishList) {
                    setDeleteConfirmationText(t('Cart.Dialog.Delete.ConfirmDeleteAllWishlist'))
                  } else {
                    setDeleteConfirmationText(t('Cart.Dialog.Delete.ConfirmDeleteAllCart'))
                  }
                  setShowDeleteAllConfirmation(true)
                }}
              >
                <Icon wrapperClassName="empty-cart-button-icon" name="cart_delete.svg" width="14px" height="16px" title={t('Cart.DeleteTooltip')}/>
                <span className="empty-all-text">{emptyAllText}&nbsp;</span>
                &nbsp;<span className="cart-items-count">{showItemsCount && `(${list.itemsCount})`}</span>
              </button>}
          </div>
        }
      </div>
      <ConfirmationDialog
        confirmationText={deleteConfirmationText}
        confirmButtonText={`${t('Cart.Dialog.Delete.ConfirmDeleteButtonText')} (${list.itemsCount})`}
        rejectButtonText={t('Cart.Dialog.Delete.RejectButtonText')}
        onConfirm={handleDeleteAllDialogConfirm}
        onReject={() => setShowDeleteAllConfirmation(false)}
        open={showDeleteAllConfirmation}
      />
      {showListNameEdit &&
        <EditListNameModal
          onClose={() => setShowListNameEdit(false)}
          onSave={onListNameSave}
          value={list.title}
          model={model}
          list={list}
        />
      }
      {showAssignToListModal &&
        <AssignToListModal
          onClose={() => setShowAssignToListModal(false)}
          onSave={onAssignToListSave}
          model={model}
          list={list}
          count={list.itemsCount}
        />
      }
      {showDuplicateListModal &&
        <ConfirmDuplicationModal
          onClose={() => setShowDuplicateListModal(false)}
          onDuplicate={onDuplicateListSave}
          entity={list}
        />
      }
      {duplicateDialogMessage && <DuplicateItemsDialogError message={duplicateDialogMessage} onClose={() => setDuplicateDialogMessage(null)} />}
    </>
  )
}

export default observer(ListBar)
