import React, { useEffect, useState } from 'react'
import './DynamicImageViewer.scss'
import Preview from '../Preview'

const DynamicImageViewer = ({ thumbnails, onChange, proofError, showLoaderDots }) => {
  const [images, setImages] = useState([])
  const [activeImage, setActiveImage] = useState(0)
  useEffect(() => {
    setImages(thumbnails)
    setActiveImage(0)
  },[thumbnails])

  useEffect(() => {
    if (onChange) {
      onChange(activeImage)
    }
  }, [activeImage, onChange])

  return <>
    {images?.length > 0 &&
      <div className="preview-image dynamic-product-approval">
        <Preview
            poofPreviewError={proofError}
            productApprovalThumbnails={thumbnails}
            showLoaderDots={showLoaderDots}
        />
      </div>}
  </>
}

export default DynamicImageViewer
