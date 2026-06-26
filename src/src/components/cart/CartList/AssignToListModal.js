import React, {useContext, useEffect, useState} from 'react'
import { Input, Modal, ModalBody } from 'reactstrap-wc'
import { observer } from 'mobx-react-lite'
import { t } from '$themelocalization'
import { Icon, Button, Dropdown } from '$core-components'
import { RootDocumentContext } from '$themeservices'

import './AssignToListModal.scss'
import { useRef } from 'react'

export const ASSIGN_LIST_TYPE = {
  EXISTING: 'existing',
  NEW: 'new'
}

const AssignToListModal = ({ onClose, onSave, model, list, count }) => {
  const [selectedListType, setSelectedListType] = useState(ASSIGN_LIST_TYPE.EXISTING)
  const [newValue, setNewValue] = useState('');
  const [selectedList, setSelectedList] = useState(null);
  const newListInputRef = useRef(null)
  const {rootElement} = useContext(RootDocumentContext)()

  useEffect(() => {
    if (model.lists.length === 1 && list.isUnassigned) {
      setSelectedListType(ASSIGN_LIST_TYPE.NEW)
      setTimeout(() => newListInputRef.current.focus(), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model])

  useEffect(() => {
    if (model.lists.length > 0) {
      const firstValue = model.lists.filter((l) => l.id !== list.id && !l.isUnassigned)[0]
      if (firstValue) {
        setSelectedList({ name: firstValue.title, value: firstValue.id })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const noCustomLists = model.lists.length === 1 && (!model.openedList || model.openedList?.isUnassigned)
  const moreThan100Error = model.lists.length > 100
  const sameNameError = model.lists.some((l) => l.title.trim().toLowerCase() === newValue.trim().toLowerCase())
  const assignToButtonDisabled = (!newValue && selectedListType === ASSIGN_LIST_TYPE.NEW) ||
    (!selectedList && selectedListType === ASSIGN_LIST_TYPE.EXISTING) ||
    sameNameError
  const onTypeChange = (e) => {
    setSelectedListType(e.target.value)
    setNewValue('')
  }

  return (
    <Modal isOpen={true} modalClassName="assign-to-list-dialog" container={rootElement}>
      <div className="close-modal">
        <p className="title">{t('Cart.Dialog.AssignToList.Title',{count})}</p>
        <button className="close-button" onClick={onClose}>
          <Icon name="close_black.svg" width="14px" height="14px"/>
        </button>
      </div>
      <ModalBody>
        {noCustomLists
          ? <div className="assign-to-list-dialog-no-lists">
            <p className="label">{t('Cart.Dialog.AssignToList.Label')}</p>
            <Input type="text" value={newValue} onChange={(e) => setNewValue(e.target.value)} innerRef={newListInputRef}/>
          </div>
          : <div className="radio-group">
            <div className="assign-to-list-dialog-existing-list">
              <label className="radio-button">
                <input
                  type="radio"
                  name="assign-to-list"
                  value={ASSIGN_LIST_TYPE.EXISTING}
                  onChange={onTypeChange}
                  checked={selectedListType === ASSIGN_LIST_TYPE.EXISTING}
                />
                {t('Cart.Dialog.AssignToList.ExistingList')}
                <span className='radio-checkmark' />
              </label>
              <Dropdown
                items={
                  model.lists
                    .filter((l) => l.id !== list.id)
                    .map((l) => ({ name: l.title, value: l.id }))
                }
                selectedValue={selectedList}
                onChange={setSelectedList}
                disabled={selectedListType !== ASSIGN_LIST_TYPE.EXISTING}
                searchable
                className="assign-to-list-dialog-existing-list-dropdown"
                searchPlaceholder={t('Cart.Dialog.AssignToList.SearchPlaceholder')}
              />
            </div>
            <div className="assign-to-list-dialog-existing-new">
              <label className="radio-button">
                <input
                  type="radio"
                  name="assign-to-list"
                  value={ASSIGN_LIST_TYPE.NEW}
                  onChange={onTypeChange}
                  checked={selectedListType === ASSIGN_LIST_TYPE.NEW}
                  disabled={moreThan100Error}
                />
                {t('Cart.Dialog.AssignToList.NewList')}
                <span className='radio-checkmark' />
              </label>
              <Input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                disabled={selectedListType !== ASSIGN_LIST_TYPE.NEW}
                className={sameNameError || moreThan100Error ? 'assign-to-list-dialog-new-input-error' : ''}
              />
              {sameNameError && <div className="assign-to-list-dialog-new-error">{t('Cart.Dialog.AssignToList.NameExistsError')}</div>}
              {moreThan100Error && <div className="assign-to-list-dialog-new-error">{t('Cart.Dialog.AssignToList.NotMoreThan100Error')}</div>}
            </div>
          </div>
        }
        <div className="action-buttons">
          <Button
            text={t('Cart.Dialog.AssignToList.Cancel')}
            className="button button-secondary"
            onClick={onClose}
          />
          <Button
            disabled={assignToButtonDisabled}
            text={t('Cart.Dialog.AssignToList.Assign')}
            className="button button-primary"
            onClick={() => {
              onSave({listType: selectedListType, value: selectedListType === ASSIGN_LIST_TYPE.NEW ? newValue : selectedList.value})
            }}
          />
        </div>
      </ModalBody>
    </Modal>
  )
}

export default observer(AssignToListModal)
