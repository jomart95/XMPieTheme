import React, { useState } from 'react'
import { t } from '$themelocalization'
import { ReactComponent as ProofIcon } from '$assets/icons/static_product_view_proof.svg'

const Proof = ({ onToggle, hideLink, currentProduct, orderItemId, isMobile }) => {
  const [fileUrl] = useState(
    currentProduct && currentProduct.Proof ? `${currentProduct.Proof.Url}&OrderItemID=${orderItemId}` : null
  )
  const [isDownloadProof] = useState(
    currentProduct && currentProduct.Proof &&
      ((isMobile && !currentProduct.Proof.MimeType.startsWith('image/')) ||
          (!isMobile && currentProduct.Proof.MimeType !== 'application/pdf' &&
              !currentProduct.Proof.MimeType.startsWith('image/')))
  )

  const handleModalToggle = () => {
    onToggle()
  }

  if (hideLink) return null
    if (isDownloadProof) {
      return (
        <a download className="view-proof-wrapper" href={fileUrl} >
          <div className="view-proof">
            <ProofIcon className="view-proof-icon" width="20px" height="24px" />
            <div className="view-proof-title">{t('product.view_proof')}</div>
          </div>
        </a>
      )
    }

    return <span className="view-proof-wrapper" onClick={handleModalToggle} >
      <div className="view-proof">
        <ProofIcon className="view-proof-icon" width="20px" height="24px" />
        <div className="view-proof-title">{t('product.view_proof')}</div>
      </div>
    </span >

}

export default Proof
