import React, {useContext, useState} from 'react'
import { Modal, ModalBody } from 'reactstrap-wc'
import { t } from '$themelocalization'
import { Icon , Button} from '$core-components'
import { RootDocumentContext } from '$themeservices'

import './PromptDialog.scss'

export const PromptDialog = ({ onClose, nickname, onChange }) => {
  const [newValue, setNewValue] = useState(nickname);
  const {rootElement} = useContext(RootDocumentContext)()

  const onSave = () => {
    onChange(newValue?.trim());
    onClose();
  }

  return (
    <Modal isOpen={true} className="prompt-dialog" modalClassName="nickname-dialog-container" container={rootElement}>
      <div className="close-modal">
        <p className="title">{t('Cart.Item.Dialog.Edit')}</p>
        <button className="close-button" onClick={onClose}>
          <Icon name="close_black.svg" width="14px" height="14px"/>
        </button>
      </div>
      <ModalBody>
        <p className="label">{t('Cart.Item.Dialog.Title')}</p>
        <input
          className="input"
          placeholder={t('Cart.NicknamePlaceholder')}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
        />
        <div className="action-buttons">
          <Button
            text={t('Cart.Dialog.EditNickname.Cancel')}
            className="button button-secondary"
            onClick={onClose}
          />
          <Button
            text={t('Cart.Dialog.EditNickname.Save')}
            className="button button-primary"
            onClick={onSave}
          />
        </div>
      </ModalBody>
    </Modal>
  )
}
