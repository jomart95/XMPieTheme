import React, {useContext, useState} from 'react'
import { Modal, ModalBody } from 'reactstrap-wc'
import { Button, Icon }from '$core-components'
import { RootDocumentContext } from '$themeservices'
import './ConfirmationDialog.scss'

const ConfirmationDialog = ({
  open,
  confirmationText,
  confirmButtonText,
  rejectButtonText,
  onReject,
  onConfirm,
  itemThumbnail
}) => {
  const [save, setSave] = useState(false)
  const {rootElement} = useContext(RootDocumentContext)()
  return (
    <Modal isOpen={open} className="cart-ng-confirmation-dialog"
           backdropClassName={save ? 'cart-ng-confirmation-dialog-backdrop' : ''}
            container={rootElement}>
      <div className="modal-close">
        <button className="close-btn" onClick={() => onReject()}>
          <Icon name="close_black.svg" width="14px" height="14px"/>
        </button>
      </div>
      <ModalBody className="cart-ng-dialog-body">
        {itemThumbnail && (
          <div className="thumbnail-wrapper">
            <img src={itemThumbnail} alt="item-thumbnail" className="cart-ng-confirmation-thumbnail"/>
          </div>
        )}
        <div className="cart-ng-confirmation-text">
          {confirmationText}
        </div>
        <div className="buttons-container">
          <Button
            className="button button-primary confirmation-button"
            onClick={() => {
              setSave(true)
              onConfirm()
            }}
            text={confirmButtonText}
          />
          <Button
            className="button button-secondary confirmation-button"
            onClick={() => onReject()}
            text={rejectButtonText}
          />
        </div>
      </ModalBody>
    </Modal>
  )
}

export default ConfirmationDialog
