import React, {useContext, useEffect, useRef, useState} from 'react'
import { Input, Modal, ModalBody } from 'reactstrap-wc'
import { t } from '$themelocalization'
import { RootDocumentContext } from '$themeservices'
import { Icon, Button } from '$core-components'
import './EditListNameModal.scss'

const EditListNameModal = ({onClose, onSave, value, model, list}) => {
  const [newValue, setNewValue] = useState(value);
  const [hasDuplicateName, setHasDuplicateName] = useState(false);
  const [disabledSave, setDisabledSave] = useState(false);
  const inputRef = useRef(null)
  const {rootElement} = useContext(RootDocumentContext)()

  useEffect(() => {
    setTimeout(() => inputRef.current.focus(), 0);
  }, [])

  const onNameChange = (e) => {
    setNewValue(e.target.value)

    const newValue = e.target.value.trim()

    if (model?.lists.filter(l => l.title !== list.title).some(l => l.title.toLowerCase() === newValue.toLowerCase())) {
      setHasDuplicateName(true)
      setDisabledSave(true)
      return
    }

    if (newValue === '') {
      setDisabledSave(true)
      return
    }

    setHasDuplicateName(false)
    setDisabledSave(false)
  }


  return (
    <Modal isOpen={true} modalClassName="edit-list-name-dialog" container={rootElement}>
      <div className="close-modal">
        <p className="title">{t('Cart.Dialog.EditListName.Title')}</p>
        <button className="close-button" onClick={onClose}>
          <Icon name="close_black.svg" width="14px" height="14px"/>
        </button>
      </div>
      <ModalBody>
        <p className="label">{t('Cart.Dialog.EditListName.ListNameTitle')}</p>
        <Input type="text" value={newValue} onChange={onNameChange} innerRef={inputRef}/>
        {hasDuplicateName && <p className="error">{t('Cart.Dialog.EditListName.DuplicateName')}</p>}
        <div className="action-buttons">
          <Button
            text={t('Cart.Dialog.EditListName.Cancel')}
            className="button button-secondary"
            onClick={onClose}
          />
          <Button
            text={t('Cart.Dialog.EditListName.Save')}
            className="button button-primary"
            onClick={() => onSave(newValue)}
            disabled={disabledSave}
          />
        </div>
      </ModalBody>
    </Modal>
  )
}

export default EditListNameModal
