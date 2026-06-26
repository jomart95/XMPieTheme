import React, {useContext, useEffect, useState} from 'react'
import { Modal, ModalBody } from 'reactstrap-wc'
import { t, mt } from '$themelocalization'
import { Icon, Button } from '$core-components'
import { RootDocumentContext } from '$themeservices'
import './ConfirmDuplicationModal.scss'

const getDuplicationMessage = (entity) => {
  let messageKey = 'MayTakeAWhile'
  if (entity.hasUSAData || entity.isCOD) {
    messageKey = 'HasUSADataOrCOD'
  } else if (entity.hasItemsOffline) {
    messageKey = 'HasItemsOffline'
  }
  return mt(`Cart.Dialog.DuplicateConfirmation.${messageKey}`)
}

const ConfirmDuplicationModal = ({ onClose, entity, onDuplicate }) => {
  const [duplicateButtonText, setDuplicateButtonText] = useState(null)
  const {rootElement} = useContext(RootDocumentContext)()
  useEffect(() => {
    (async () => {
      setDuplicateButtonText(t('Cart.Dialog.DuplicateConfirmation.Duplicate', { count: await entity.eligibleItemsCount }))
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  const duplicationMessage = getDuplicationMessage(entity)

  if (!duplicateButtonText) return null

  return (
    <Modal isOpen={true}  modalClassName="confirm-list-duplication-modal" container={rootElement}>
      <div className="close-modal">
        <button className="close-button" onClick={onClose}>
          <Icon name="close_black.svg" width="14px" height="14px"/>
        </button>
      </div>
      <ModalBody>
        <p className="label">{duplicationMessage}</p>
        <p className="label">{t('Cart.Dialog.DuplicateConfirmation.Label2')}</p>
        <div className="action-buttons">
          <Button
            text={duplicateButtonText}
            className="button button-primary confirm-list-duplication-modal-mobile-confirm"
            onClick={() => onDuplicate(true)}
          />
          <Button
            text={duplicateButtonText}
            className="button button-primary confirm-list-duplication-modal-desktop-confirm"
            onClick={() => onDuplicate(false)}
          />
          <Button
            text={t('Cart.Dialog.DuplicateConfirmation.Cancel')}
            className="button button-secondary"
            onClick={onClose}
          />
        </div>
      </ModalBody>
    </Modal>
  )
}

export default ConfirmDuplicationModal
