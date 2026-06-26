import { UStoreProvider } from '@ustore/core'
import pdfLoader from './pdfLoader'

export const extractValues = (input) => {
  const regex = /(\d+);([A-Za-z]+)/g
  let result
  const output = {}

  while ((result = regex.exec(input)) !== null) {
    const location = result[2].toLowerCase()
    output[location] = parseInt(result[1], 10)
  }

  return output
}
export const addDownloadAttribute = (inputString) => inputString.replace(/(<a\s+href="[^"]*")(?!\s*download)/g, '$1 download')

export const getPropertyPreviewValue = (property) => {
  const indexOfValue = property.propertySchema.enum.indexOf(property.value)
  return property.propertySchema.previewValues[indexOfValue]
}

export const uploadEasyUploadFile = async (
  setIsDocumentLoading,
  fileName,
  orderItem,
  propertyID,
  setUploadError,
  setDocumentLoaded,
  setErrorMessage,
  uploadedFile,
  setFileName,
  setViewerState,
  viewerState,
  product,
) => {
  try {
    if (!fileName) {
      setUploadError(true)
      setDocumentLoaded(false)
      pdfLoader.clear()
      setViewerState({ ...viewerState, realSize: '' })
      const response = await UStoreProvider.api.orders.uploadFile(orderItem.ID, propertyID, [uploadedFile])
      if (response) {
        if (response[0]?.Type === 5 || response[0]?.Type === 6) {
          setErrorMessage(addDownloadAttribute(response[0].Message))
          setIsDocumentLoading(false)
          return null
        }
        if (response[0]?.FileInfoList) {
          setErrorMessage('')
          setUploadError(false)
          setFileName(response[0]?.Value)
          const totalPageNumbers = response[0].FileInfoList[0]?.MetaData?.NumberOfPages
          const previewUrl = `${product.Proof.Url}&orderitemid=${orderItem.ID}`
          const metaData = response[0].FileInfoList[0]?.MetaData
          setViewerState({
            ...viewerState,
            previewUrl,
            metaData: metaData,
            pageNumber: 1, totalPageNumber: totalPageNumbers,
            realSize: `${metaData.Width}X${metaData.Height}`
          })
        }
        return response
      }
    }
  } catch (e) {
    console.log(e)
    setIsDocumentLoading(false)
  }
}
