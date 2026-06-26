import React, {useState, useContext} from 'react'
import {Modal, ModalBody} from 'reactstrap-wc'
import {RootDocumentContext} from '$themeservices'
import {ImageZoom} from '$core-components'
import {t} from '$themelocalization'
import theme from '$styles/theme'
import './ProductApproval.scss'
import Preview from '../Preview'

const ProductApproval = ({
                           type,
                           isModalOpen,
                           onCloseModal,
                           src,
                           onAddToCartClick,
                           addToCartBtnText,
                           checkboxText,
                           errorText
                         }) => {
  const {rootElement} = useContext(RootDocumentContext)()
  const isMobile = document.body.clientWidth < parseInt(theme.lg.replace('px', ''))

  const isProofPdf = type === 'application/pdf'
  const isimage = type.startsWith('image/')
  const [approved, setApproved] = useState(false)
  const [showError, setShowError] = useState(false)

  const onAddClicked = () => {
    if (approved) {
      setShowError(false)
      onAddToCartClick()
    } else {
      setShowError(true)
    }
  }

  if (!src) {
    return null
  }
  return (
    <Modal toggle={onCloseModal} isOpen={isModalOpen} modalClassName="proof-approval" container={rootElement}>
      <div className={`${isProofPdf ? 'transparent' : ''} modal-close`}>
        <div className='close-btn' onClick={onCloseModal}>×</div>
      </div>
      <ModalBody>
        <div className={`approval-title mobile`}>
          {t('productProof.review_label')}
        </div>
        {isProofPdf && !isMobile &&
          <div className='approve-modal-pdf'>
            <object data={src + '&inline=true&#view=Fit'}
              type="application/pdf"
              width="100%"
              height="100%"
            >
            </object>
          </div>
        }
        {isimage && (
          !isMobile
            ? <div className="approval-image-wrapper"><ImageZoom src={src} /></div>
            : <div className="approval-image-wrapper mobile">
                <div className="proof-modal-image mobile">
                  <Preview
                      productApprovalThumbnails={[{Url: src}]}
                  />
                </div>
              </div>
        )
        }
        {((!isimage && !isProofPdf) || (isProofPdf && isMobile)) &&
          <div className={`approve-modal-pdf ${isMobile ? 'mobile' : ''}`}>

            <div className='download-pdf-wrapper'>
              <a download href={src}>{t('productProof.download')}</a>
            </div>
          </div>
        }
        <div className={`proof-approval ${isMobile ? 'mobile' : ''}`}>
          <div className="approval-title desktop">
            {t('productProof.review_label')}
          </div>
          <div className="approval-checkbox">
            <label>
              <input type="checkbox" onChange={() => { setApproved(prev => !prev) }} />
              <span className='checkbox-label'>{checkboxText || t('productProof.ProofIsApproved')}</span>
              <span className="required">*</span>
            </label>
          </div>
          {
            showError && <div className='proof-approval-required'>
              <span>{errorText || t('productProof.ConfirmProof')}</span>
            </div>
          }
          <div
            className='button button-primary add-to-cart-button'
            onClick={onAddClicked}
          >
            {addToCartBtnText}
          </div>
        </div>
      </ModalBody>
    </Modal >
  )
}

export default ProductApproval
