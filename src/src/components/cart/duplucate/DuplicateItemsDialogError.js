import React, {useContext} from 'react'
import { Modal, ModalBody } from 'reactstrap-wc'
import { t } from '$themelocalization'
import { RootDocumentContext } from '$themeservices'
import { Icon, Button } from '$core-components'

import './DuplicateItemsDialogError.scss'

const DuplicateItemsDialogError = ({ onClose, message }) => {
  const {rootElement} = useContext(RootDocumentContext)()

  return (
    <Modal isOpen={true} className="prompt-dialog" modalClassName="max-duplicate-items-dialog-container"
    container={rootElement}>
      <div className="close-modal">
        <button className="close-button" onClick={onClose}>
          <Icon name="close_black.svg" width="14px" height="14px"/>
        </button>
      </div>
      <ModalBody>
        <div className="body-content">
        <Icon name="error.svg" size="15px" wrapperClassName="duplicate-items-dialog-error-icon-desktop"/>
        <Icon name="error.svg" size="30px" wrapperClassName="duplicate-items-dialog-error-icon-mobile"/>
        <span className="label">{message}</span>
        </div>
        <div className="action-buttons">
          <Button
            text={t('Cart.Dialog.MaxDuplicateItems.Close')}
            className="button button-primary"
            onClick={onClose}
          />
        </div>
      </ModalBody>
    </Modal>
  )
}

export default DuplicateItemsDialogError
