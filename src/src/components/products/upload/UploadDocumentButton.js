import React, { useLayoutEffect, useRef } from 'react'
import { t } from '$themelocalization'
import './UploadDocumentButton.scss'
import { UStoreProvider } from '@ustore/core'
import pdfLoader from './pdfLoader'
import { uploadEasyUploadFile } from './easyUploadUtils'
import { usePDFViewer } from './PDFViewerContext'

export const UploadDocumentButton = ({
  forceInputFile,
  setForceInputFile,
  setUploadError,
  setErrorMessage,
  viewerState,
  setViewerState,
  fileName,
  setFileName,
  upload,
  orderItem,
  properties,
  product,
  setIsDocumentLoading,
  setDocumentLoaded,
  onFormChange
}) => {

  const { setDefault } = usePDFViewer()
  const uploadButtonRef = useRef()

  const propertyKey = properties && Object.keys(properties).find(key => properties[key]?.custom?.code === 'FileAttachment')
  const propertyID = properties && properties[propertyKey]?.custom?.id
  const allowedExtensions = properties[propertyKey]?.uiSchema['ui:options']?.custom?.allowedExtensions?.map(type => `.${type.toLowerCase()}`).join(', ')

  const clickHandler = async (event) => {
    if (viewerState.previewUrl && !forceInputFile) {
      event.preventDefault()
      setUploadError(true)
      setDocumentLoaded(false)
      pdfLoader.clear()
      setDefault()
      let fileAttachmentPropData = Object.values(properties).find((prop) => prop?.custom?.code === "FileAttachment")
      if (fileAttachmentPropData?.value) {
        fileAttachmentPropData = JSON.parse(fileAttachmentPropData.value)
      }
      const deleteFileName = fileAttachmentPropData && fileAttachmentPropData[0] && fileAttachmentPropData[0].FileName
      const fileURIToDelete = deleteFileName && `fileNames=${encodeURIComponent(deleteFileName)}`
      deleteFileName && await UStoreProvider.api.orders.deleteFiles(orderItem.ID, propertyID, fileURIToDelete)
      onFormChange(propertyKey, [], [])
      setForceInputFile && setForceInputFile(true)
    }
  }

  useLayoutEffect(() => {
    if (forceInputFile && uploadButtonRef?.current) {
      uploadButtonRef.current.click()
    }
  }, [forceInputFile])

  const handleFileChange = async (event) => {
    const uploadedFile = event.target.files[0]
    setIsDocumentLoading(true)
    const response  = await uploadEasyUploadFile(setIsDocumentLoading, fileName, orderItem, propertyID, setUploadError, setDocumentLoaded, setErrorMessage, uploadedFile, setFileName, setViewerState, viewerState, product)
    if (response?.length && response[0].FileInfoList?.length) {
      delete response[0].FileInfoList[0].MetaData
    }
    onFormChange && onFormChange(propertyKey, response, [])
  }

  if (UStoreProvider.state.customState.get("externalImageLoaded")) return null

  return <div className={`pdf-viewer-upload-document-btn ${upload ? '' : 'replace-file'}`}>
    <label className={`button ${upload ? 'button-primary' : 'button-secondary'}`}
           htmlFor="fileInput">{t(upload ? 'UploadDocument.UploadButton' : 'UploadDocument.ReplaceButton')}
    </label>
    <input
      accept={allowedExtensions}
      ref={uploadButtonRef}
      id="fileInput"
      type="file"
      onChange={handleFileChange}
      className="fileInput"
      onClick={clickHandler}
    />
  </div>
}
