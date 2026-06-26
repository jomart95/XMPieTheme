import React, {useContext} from 'react'
import { Modal, ModalBody } from 'reactstrap-wc'
import { t } from '$themelocalization'
import { Icon } from '$core-components'
import { RootDocumentContext } from '$themeservices'
import './RevertModificationDialog.scss'

const RevertModificationDialog = ({ closeDialog }) => {
  const {rootElement} = useContext(RootDocumentContext)()

  return (
    <Modal isOpen={true} className="cart-ng-revert-modification-dialog"
           modalClassName="cart-ng-revert-modification-dialog-container"
           backdropClassName="cart-ng-revert-modification-modal-backdrop"
           wrapClassName="cart-ng-revert-modification-progress-dialog-wrapper"
          container={rootElement}>

      <button className="cart-ng-revert-modification-process-close" onClick={() => closeDialog()}>
        <Icon name="close_black.svg" width="14px" height="14px"/>
      </button>

      <ModalBody className="dialog-content">
        <div className="cart-ng-revert-modification-success">
          <Icon name="success.svg" height="30px" width="33px"
                wrapperClassName="cart-ng-revert-modification-success-icon"/>
          <div className="dialog-text">
            {t('Cart.OrderApprovalRevertMessage')}
          </div>
        </div>
      </ModalBody>
    </Modal>
  )
}

export default RevertModificationDialog

