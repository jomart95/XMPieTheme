import React, {useContext, useEffect} from 'react'
import { Modal, ModalBody } from 'reactstrap-wc'
import './ProductThumbnailsPreview.scss'
import ErrorBalloon from '../ErrorBalloon'
import { t } from '$themelocalization'
import { RootDocumentContext } from '$themeservices'
import Preview from "../Preview";

const ProofErrorBalloon = ({ show }) => show &&
  <ErrorBalloon
    className="mobile-preview-failure">{t('productProof.PreviewFailure')}</ErrorBalloon>

const ProductThumbnailsPreview = ({
  productThumbnails,
  isModalOpen,
  onCloseModal,
  modalClassName,
  onImageChange,
  poofPreviewError,
  onProofPreviewClick,
  isNewUpload,
  orderItem,
  isMobile,
  properties
}) => {
  const {rootElement} = useContext(RootDocumentContext)()

  useEffect(() => {
    if (isModalOpen)
    onProofPreviewClick()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen])

  return (
    <Modal toggle={onCloseModal} isOpen={isModalOpen} modalClassName={`${modalClassName}`} container={rootElement}>
      <div className="modal-close">
        <div className="close-btn" onClick={onCloseModal}>×</div>
      </div>
      <ModalBody>
        <div className="thumbnail-modal-image mobile">
          <ProofErrorBalloon show={poofPreviewError}/>
          <Preview
              isMobile={isMobile}
              orderItem={orderItem}
              poofPreviewError={poofPreviewError}
              productThumbnails={productThumbnails}
              changeStickyThumbnail={(id) => onImageChange(id)}
              isNewUpload={isNewUpload}
              properties={properties}
              isMobilePreview={true}
          />
        </div>
      </ModalBody>
    </Modal>
  )
}

export default ProductThumbnailsPreview
