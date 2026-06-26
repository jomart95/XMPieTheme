import React from 'react'
import DynamicProductApproval from './dynamic/DynamicProductApproval'
import ProductApproval from './static/ProductApproval'
import { productTypes } from '$themeservices'

const ProductApprovalModal = ({
  product,
  properties,
  onAddToCartClick,
  orderItem,
  productThumbnails,
  modalOpen,
  onCloseModal,
  continueButtonText,
  src,
  excelPricingEnabled,
  isUEdit = false
}) => {
  return product.Type === productTypes.DYNAMIC ? <DynamicProductApproval
    properties={properties}
    proofType={product?.Proof?.MimeType}
    onAddToCartClick={() => onAddToCartClick(true)}
    orderItem={orderItem}
    thumbnails={productThumbnails.Thumbnails}
    isModalOpen={modalOpen}
    onCloseModal={onCloseModal}
    addToCartBtnText={continueButtonText}
    checkboxText={
      product.Configuration &&
      product.Configuration.Proof &&
      product.Configuration.Proof.ProofApprovalText
        ? product.Configuration.Proof.ProofApprovalText
        : null
    }
    errorText={
      product.Configuration &&
      product.Configuration.Proof &&
      product.Configuration.Proof.ProofApprovalValidationMessage
        ? product.Configuration.Proof.ProofApprovalValidationMessage
        : null
    }
    isUEdit={isUEdit}
  /> : <ProductApproval
    isModalOpen={modalOpen}
    src={src}
    type={product.Proof && product.Proof.MimeType ? product.Proof.MimeType : ''}
    onCloseModal={onCloseModal}
    onAddToCartClick={() => onAddToCartClick()}
    addToCartBtnText={continueButtonText}
    checkboxText={
      product.Configuration &&
      product.Configuration.Proof &&
      product.Configuration.Proof.ProofApprovalText
        ? product.Configuration.Proof.ProofApprovalText
        : null
    }
    errorText={
      product.Configuration &&
      product.Configuration.Proof &&
      product.Configuration.Proof.ProofApprovalValidationMessage
        ? product.Configuration.Proof.ProofApprovalValidationMessage
        : null
    }
    excelPricingEnabled={excelPricingEnabled}
  />

}

export default ProductApprovalModal
