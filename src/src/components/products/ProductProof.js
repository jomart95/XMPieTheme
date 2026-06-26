import React, {useContext, useEffect} from 'react'
import { Modal, ModalBody } from 'reactstrap-wc'
import { RootDocumentContext } from '$themeservices'
import { t } from '$themelocalization'
import { ImageZoom } from '$core-components'
import './ProductProof.scss'
import Preview from './Preview'

const preloadImage = async src =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = (e) => resolve(image)
    image.onerror = reject
    image.src = src
  })

const ProductProof = ({ type, src, isModalOpen, onCloseModal, modalClassName = 'product-proof-modal', isMobile = false }) => {
  const [isProofPdf, setIsProofPdf] = React.useState(type === 'application/pdf')
  const [imageSrc, setImageSrc] = React.useState(null)
  const {rootElement} = useContext(RootDocumentContext)()

  useEffect(() => {
    (async () => {
      try {
        if (!src) {
          return
        }
        const loadedSrc = await preloadImage(src)
        setImageSrc(loadedSrc.src)
      } catch (err) {
        setImageSrc(src)
        setIsProofPdf(true)
      }
    })()
  }, [src])


  if (!imageSrc) {
    return null
  }

  return (
    <Modal toggle={onCloseModal} isOpen={isModalOpen} modalClassName={`${modalClassName} product-proof-modal`}
      container={rootElement}>
      <div className='modal-close'>
        <div className='close-btn' onClick={onCloseModal}>×</div>
      </div>
      <ModalBody>
        {isProofPdf &&
          <div className='proof-modal-pdf'>
            <object data={imageSrc + '&inline=true&#view=Fit'}
              type="application/pdf"
              width="100%"
              height="100%">
              <div className='download-pdf-wrapper'>
                <a href={imageSrc}>{t('productProof.download')}</a>
              </div>
            </object>
          </div>}
        {!isProofPdf && !isMobile &&
          <div className="proof-modal-image"><ImageZoom src={imageSrc} /></div>
        }
        {!isProofPdf && isMobile &&
          <div className="proof-modal-image mobile">
              <Preview
                  productApprovalThumbnails={[{Url: imageSrc}]}
              />
          </div>
        }
      </ModalBody>
    </Modal>
  )
}

export default ProductProof
