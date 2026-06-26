import React, {useContext, useEffect, useRef, useState} from 'react'
import {Modal, ModalBody} from 'reactstrap-wc'
import {UStoreProvider} from '@ustore/core'
import {LoadingDots} from '$core-components'
import {convertProductPropertiesFormIntoArray} from '$themeservices/utils'
import {t} from '$themelocalization'
import {RootDocumentContext} from '$themeservices'
import './DynamicProductApproval.scss'
import DynamicImageViewer from './DynamicImageViewer'
import UeditProvider from './uedit/ueditProvider'

const DesktopProofPreview = ({ proof, images, showLoaderDots, proofError }) => proof && proof.Format === 1 && proof.Items?.length > 0 ? <object
      data={proof.Items[0].Url + '#view=Fit'}
      type="application/pdf"
      width="100%"
      height="100%"
    >
    </object> :
    <DynamicImageViewer proofError={proofError} thumbnails={images} showLoaderDots={showLoaderDots}/>

const MobileProofPreview =
  ({ isPDF, showLoaderDots, proof, onDownloadPDFClick, images, proofError }) => {

    if (isPDF) {
      return <>
        {showLoaderDots ? <div className="button button-secondary"><LoadingDots/></div> :
          <div className="button button-secondary download-pdf-proof" disabled={proofError}
               onClick={() => onDownloadPDFClick(proof.Items[0])}>
            {t('productProof.DownloadPreview')}
          </div>}
      </>
    }
    return  <>
      <DynamicImageViewer showLoaderDots={showLoaderDots} thumbnails={images} proofError={proofError}/>
    </>
}
const ProductApproval = ({
  thumbnails,
  isModalOpen,
  onCloseModal,
  onAddToCartClick,
  addToCartBtnText,
  checkboxText,
  errorText,
  orderItemID,
  orderItem,
  proofType,
  properties,
  excelPricingEnabled,
  isUEdit
}) => {
  const {rootElement} = useContext(RootDocumentContext)()
  const [proof, setProof] = useState(null)
  const [approved, setApproved] = useState(false)
  const [showError, setShowError] = useState(false)
  const [images, setImages] = useState([])
  const [showLoaderDots, setShowLoaderDots] = useState(true)
  const [proofError, setProofError] = useState(false)
  const isPDF = proofType && proofType.toLowerCase().endsWith('pdf')
  const addToCartRef = useRef()
  const currentPullTimeout = useRef()

  const waitForProof = (currentProof) => new Promise((resolve, reject) => {
    const pullProof = async (pullingProof) => {
      if (pullingProof.Status === 3) {
          reject({Message: ''})
          return
      }
      if (pullingProof.Status === 1) {
        try {
          pullingProof = await window.UStoreProvider.api.products.createProof(orderItem.ID)
        } catch (e) {
          if (e.Message?.toLowerCase() !== 'too much requests.') {
            reject(e)
            return
          }
        }
        currentPullTimeout.current = setTimeout(() => {
          pullProof(pullingProof)
        }, 2000)
        return
      }
      resolve(pullingProof)
    }

    pullProof(currentProof)
  })


  useEffect(() => {
    (async () => {
      try {
        if (isModalOpen && orderItem) {
          setShowLoaderDots(true)
          currentPullTimeout.current && clearTimeout(currentPullTimeout.current)
          await UStoreProvider.api.orders.updateProperties(orderItem.ID, convertProductPropertiesFormIntoArray(properties))
          await UStoreProvider.api.orders.updateOrderItem(orderItem.ID, {
            ...orderItem,
            Properties: properties && Object.keys(properties).length ? convertProductPropertiesFormIntoArray(
              properties,
              excelPricingEnabled
            ) : null
          })
          if (isUEdit) {
            let xlim = UeditProvider.getXLIM()
            const doc = new File([xlim], 'doc.xlim', { type: 'application/xml' })
            await UStoreProvider.api.products.replaceProductXLIM(orderItem.ID, [doc])
          }
          let proof = await window.UStoreProvider.api.products.createProof(orderItem.ID)
          proof = await waitForProof(proof)
          const fileNames = proof.Items.map((p) => ({ Url: p.Url.replace(/.*?fileName=(.*)$/, '$1') }))
          proof.Items = []
          let hasError = false
          for (const file of fileNames) {
            const fileBlob = await UStoreProvider.api.products.downloadProof(orderItem.ID, file.Url)
            if (fileBlob) {
              proof.Items = [...proof.Items, {
                Url: URL.createObjectURL(fileBlob),
                DisplayName: t('DynamicProof.Page', { pageNumber: proof.Items.length + 1 }),
                type: proof.Format === 1 ? 'pdf' : 'image',
                fileName: file.Url
              }]
              if (proof.Format === 2) {
                setImages(proof.Items)
              }
            } else {
              hasError = true
            }
          }
          setProof(proof)
          setShowLoaderDots(false)
          setProofError(hasError)
          addToCartRef.current?.scrollIntoView({behavior: 'smooth'})
        }
      } catch {
        setShowLoaderDots(false)
        setProofError(true)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderItemID, isModalOpen])

  useEffect(() => {
    if (proof?.Status !== 2) {
      setImages(thumbnails)
    }
  }, [thumbnails, proof])

  useEffect(() => {
    setTimeout(() => {
      addToCartRef.current?.scrollIntoView({behavior: 'smooth'})
    }, 50)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addToCartRef.current])

  const onAddClicked = () => {
    if (showLoaderDots) return
    if (approved) {
      setShowError(false)
      onAddToCartClick()
    } else {
      setShowError(true)
    }
  }

  if (!isModalOpen) {
    return false
  }

  const onDownloadPDFClick = (itemToDownload) => {
    if (proofError) {
      return
    }
    const downloadLink = document.createElement('a')
    downloadLink.href = itemToDownload.Url
    downloadLink.download = itemToDownload.fileName
    downloadLink.textContent = 'Download File'
    downloadLink.click()
  }

  const onCloseModalClick = (e) => {
    currentPullTimeout.current && clearTimeout(currentPullTimeout.current)
    onCloseModal(e)
  }

  return (
    <Modal toggle={onCloseModalClick} isOpen={isModalOpen} modalClassName="dynamic-proof-approval" container={rootElement}>
      <div className={`${proof?.Format === 1 ? 'transparent' : ''} modal-close`}>
        <div className="close-btn" onClick={onCloseModalClick}>×</div>
      </div>
      <ModalBody>
        <div className={`approval-title-mobile`}>
          {t('productProof.review_label')}
        </div>
        <div className="approval-preview">
          <DesktopProofPreview proofError={proofError} proof={proof} images={images} showLoaderDots={showLoaderDots}/>
        </div>
        <div className="mobile-approval-preview">
          <MobileProofPreview {...{ isPDF, showLoaderDots, proof, onDownloadPDFClick, images, proofError }} />
        </div>

        <div className="proof-approval">
          <div className="approval-title-desktop">
            {t('productProof.review_label')}
          </div>
          <div className="approval-checkbox">
            <label>
              <input type="checkbox" onChange={() => { setApproved(prev => !prev) }}/>
              <span className="checkbox-label">{checkboxText || t('productProof.ProofIsApproved')}</span>
              <span className="required">*</span>
            </label>
          </div>
          {
            showError && <div className="proof-approval-required">
              <span>{errorText || t('productProof.ConfirmProof')}</span>
            </div>
          }
          <div
            className="button button-primary add-to-cart-button"
            onClick={onAddClicked}
            ref={addToCartRef}
            disabled={showLoaderDots}
          >
            {addToCartBtnText}
          </div>
        </div>
      </ModalBody>
    </Modal>
  )
}

export default ProductApproval
