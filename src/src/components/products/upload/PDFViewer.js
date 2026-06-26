import React, { useEffect, useState } from 'react'
import { overlaysAdapter, uploadEasyUploadFile } from './overlays'
import stateAdapter from './stateAdapter'
import { PDFRenderer } from './PDFRenderer'
import { LoadingDots, Slot } from '$core-components'
import DocumentLoader from './DocumentLoader'
import './PDFViewer.scss'
import { UploadDocumentButton } from './UploadDocumentButton'
import { Paginator } from '../Paginatior'
import pdfLoader from './pdfLoader'
import { t } from '$themelocalization'
import { usePDFViewer } from './PDFViewerContext'
import { Bleed } from './overlays/Bleed'
import { useSwipeable } from 'react-swipeable'

export const PDFViewer = ({
  resetPopperError,
  setUploadError,
  properties,
  isMobile,
  orderItem,
  product,
  onFormChange,
  stickyPreview,
  isMobilePreview,
}) => {
  const [documentLoaded, setDocumentLoaded] = useState(false)
  const [overlays, setOverlays] = useState([])
  const [forceInputFile, setForceInputFile] = useState(false)
  const [dropZoneHidden, setDropZoneHidden] = useState(false)

  const {
    fileName,
    setDefault,
    setFileName,
    viewerState,
    setViewerState,
    isDocumentLoading,
    setIsDocumentLoading,
    uploadErrorMessage,
    setUploadErrorMessage
  } = usePDFViewer()
  const isEvenPage = viewerState.pageNumber % 2 === 0
  const isOddPage = !isEvenPage
  const isFirstPage = viewerState.pageNumber === 1
  const isDoubleSided = viewerState.doubleSidedPrinting > 1
  const isMultiPageDoubleSided = isDoubleSided && viewerState.totalPageNumber > 2
  const maxPages = viewerState.doubleSidedPrinting > 1 && viewerState.totalPageNumber % 2 !== 0 ? viewerState.totalPageNumber + 1 : viewerState.totalPageNumber
  const swipeDelta = viewerState.doubleSidedPrinting > 1 && viewerState.pageNumber  > 1 && (viewerState.pageNumber <= maxPages) ? 2 : 1

  useEffect(() => {
    if (orderItem.DocumentInfo) {
      const previewUrl = `${product.Proof.Url}&orderitemid=${orderItem.ID}`
      setUploadErrorMessage('')
      setViewerState({
        ...viewerState,
        previewUrl,
        metaData: orderItem.DocumentInfo.MetaData,
        pageNumber: 1,
        totalPageNumber: orderItem.DocumentInfo.MetaData.NumberOfPages,
      })
    } else {
      setUploadError && setUploadError(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderItem.ID, orderItem.DocumentInfo])

  useEffect(() => {
    if (!properties) return
    const getCode = (prop) => prop.custom?.code?.replace(/\s/igm, '')
    const notValidDependants = {};
    const newState = Object.entries(properties)
      .filter(([id, prop]) => !!stateAdapter[getCode(prop)])
      .filter(([id, prop]) => {
        if (prop.depended) {
          const valid = prop.depended?.condition?.enum?.some(depended => properties[prop.depended.parent].value === depended)
          if (!valid) {
            notValidDependants[getCode(prop).toUpperCase()] = true;
          }
          return valid;
        }
        return true
      })
      .map(([id, prop]) => stateAdapter[getCode(prop)](prop, properties))
      .reduce((acc, curr) => ({ ...acc, ...curr }), {})

    const mergedNewState = Object.entries({ ...viewerState, ...newState })
        .filter(([key]) => !notValidDependants[key.toUpperCase()])
        .reduce((acc, curr) => ({ ...acc, [curr[0]]: curr[1] }), {})

    setViewerState(mergedNewState)

    setOverlays(Object.entries(properties)
      .filter(([id, prop]) => !!overlaysAdapter[getCode(prop)])
      .filter(([id, prop]) => {
        if (prop.depended) {
          return prop.depended?.condition?.enum?.some(depended => properties[prop.depended.parent].value === depended)
        }
        return true
      })
      .filter(prop => prop[1]?.propertySchema?.enum)
      .map(([id, prop]) => (k, isBack, side) => overlaysAdapter[getCode(prop)](prop, k, mergedNewState, isBack, side, isMobilePreview)))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties, viewerState.pageNumber, documentLoaded])

  useEffect(() => {
    if (viewerState.pageNumber > 1 && (viewerState.pageNumber % 2 !== 0 || viewerState.pageNumber > viewerState.totalPageNumber))
    {
        setPage(viewerState.pageNumber - 1)
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerState.doubleSidedPrinting])

  useEffect(() => {
    const pdf = pdfLoader.pdf
    if (pdf) {
      setViewerState({
        ...viewerState,
        totalPageNumber: pdf.numPages,
        pageNumber: 1
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ documentLoaded])

  useEffect(() => {
    if (!viewerState.previewUrl && documentLoaded) {
      setDocumentLoaded(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerState.previewUrl])

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setPage(Math.min(viewerState.pageNumber + swipeDelta, maxPages)),
    onSwipedRight: () => setPage(Math.max(viewerState.pageNumber - swipeDelta, 1)),
  })

  const handlers = isMobile && documentLoaded ? swipeHandlers : {}

  if (!properties && !stickyPreview) return null

  const onPdfLoaded = (pdf) => {
    resetPopperError && resetPopperError()
    setUploadError && setUploadError(false)
    setDocumentLoaded(true)
    setIsDocumentLoading(false)
    setViewerState({
      ...viewerState,
      totalPageNumber: pdf.numPages,
      pageNumber: 1
    })
  }

  const setPage = (pageNumber) => setViewerState({ ...viewerState, pageNumber })
  const EasyUploadShowTrimMarks = !stickyPreview && product.Attributes.find((attr) => attr.Name === 'EasyUploadShowTrimMarks')
  const showBleed = viewerState?.metaData?.DocumentBoxes?.Trim && viewerState.pageSize === 'Auto' && EasyUploadShowTrimMarks?.Value?.toLowerCase() === 'true'
  const flipPage = viewerState.doubleSidedPrinting === 3 && isEvenPage && viewerState.pageNumber > 1 ? 'double-sided-flipped' : ''
  const pageStyle = () => {
    const result = {}
    if (viewerState.pageSize) {
      let width, height
      if (viewerState.pageSize === 'Auto') {
        [width, height] = [viewerState.metaData.Width, viewerState.metaData.Height]
        result['aspect-ratio'] = `${width}/${height}`
      } else {
        [width, height] = viewerState.pageSize.trim().split('X').map(b => parseFloat(b))
        result['aspect-ratio'] = viewerState.orientation === 'landscape' ? `${height}/${width}` : `${width}/${height}`
      }
    }
    if (viewerState.paperColor) {
      result['background-color'] = viewerState.paperColor
    }
    return result
  }

  const doubleSidedBackPage = viewerState.totalPageNumber === 2 && viewerState.pageNumber === 2 && viewerState.doubleSidedPrinting > 1

  const wrapperClasses = [
    'canvas-wrapper',
    viewerState.orientation,
    doubleSidedBackPage ? viewerState.corners.split(' ').join('-back ') + '-back' : viewerState.corners,
    viewerState.lamination,
    viewerState.pageSize
  ].filter(c => !!c).join(' ')

  const firstWrapperClasses = [wrapperClasses, flipPage, isEvenPage && viewerState.drilling ? 'drilling' : ''].join(' ')
  const sideTitle = t(`UploadDocument.${isOddPage ? 'Front' : 'Back'}`)
  const isCover = (pageNumber) => !stickyPreview && isMultiPageDoubleSided && (pageNumber === 1 || pageNumber > viewerState.totalPageNumber + viewerState.totalPageNumber % 2)
  const getCoverClass = (pageNumber) => `${isCover(pageNumber) ? 'cover' : ''}`

  const renderPageNumber = (pageNumber) => {
    if (!viewerState.doubleSidedPrinting || viewerState.doubleSidedPrinting <= 1 || stickyPreview) return null

    return <div className={`page-number ${isCover(pageNumber) ? 'cover' : ''}`}>
      {t('UploadDocument.PageNumber', { number: isFirstPage && pageNumber === 2 ? 1 : pageNumber })}
    </div>
  }

  return <>
    {viewerState.previewUrl && !stickyPreview && !isMobile &&
      <>
        <UploadDocumentButton
      {...{
        setDocumentLoaded, setFileName, fileName, onFormChange, orderItem, properties, product,
        setViewerState, viewerState, uploadErrorMessage, setIsDocumentLoading, setUploadErrorMessage,
        setUploadError, setForceInputFile, onPdfLoaded
      }}
        />
        <Slot name="ng_product_easy_upload_document_replace_button"
              data={{product, properties, errorMessage: uploadErrorMessage, fileName, orderItem, viewerState} }
              actions={{
                onFormChange, setIsDocumentLoading, setUploadError,setViewerState,setForceInputFile,
                setFileName, setErrorMessage: setUploadErrorMessage,setDocumentLoaded, onPdfLoaded}}
        />
      </>}
    <div className={`pdf-viewer-container ${stickyPreview ? 'sticky-preview' : ''} ${documentLoaded ? 'loaded' : ''}`}>
      <div className={`preview-wrapper ${viewerState.totalPageNumber === 1 ? 'one-page-document' : ''}`}>
        {isMobile && documentLoaded && uploadErrorMessage && <div className="upload-error-block">
          <p className="upload-error" dangerouslySetInnerHTML={{__html: uploadErrorMessage}}/>
        </div>}
        <div {...handlers}
             className={`canvas-container ${viewerState.pageSize} ${isMultiPageDoubleSided ? 'double-side-printing' : ''} ${showBleed ? "bleed" : ""}`}>
          {!viewerState.previewUrl && !dropZoneHidden && <DocumentLoader
                {...{
                  setDocumentLoaded, setFileName, fileName, onFormChange, setIsDocumentLoading, orderItem, properties,
                  viewerState, setViewerState, product, documentLoaded, setUploadError, forceInputFile, onPdfLoaded, setForceInputFile
                }}
                errorMessage={uploadErrorMessage}
                setErrorMessage={setUploadErrorMessage}
              />}
          <Slot name="ng_product_easy_upload_document_below_doc_area"
                data={{
                  product,
                  properties,
                  fileName,
                  orderItem,
                  viewerState,
                  documentLoaded,
                  pdfLoader
                }}
                actions={{
                  onFormChange, setIsDocumentLoading, setUploadError, setViewerState, setForceInputFile,
                  setFileName, setUploadErrorMessage, setDocumentLoaded, onPdfLoaded, uploadEasyUploadFile, setDefault, setDropZoneHidden
                }}/>

          {viewerState.previewUrl && isMobile && stickyPreview && isDoubleSided &&
            <div className="page-side-title">{sideTitle}</div>}
          {documentLoaded && <div className="preview-warning desktop">{t('UploadDocument.PreviewWarning')}</div>}
          <div className="pages-wrapper">
            {viewerState.previewUrl && <div
                className={isMultiPageDoubleSided ? `double-side-page ${viewerState.pageSize.toLowerCase()}` : 'single-side-page'}>
              <div
                  className={`${firstWrapperClasses} ${getCoverClass(viewerState.pageNumber)}`}
                  style={pageStyle()}>
                <PDFRenderer name={fileName}
                             stickyPreview={stickyPreview}
                             orderItemID={orderItem.ID}
                             state={viewerState}
                             setState={setViewerState}
                             onPdfLoaded={onPdfLoaded}
                             documentLoaded={documentLoaded}
                             setIsDocumentLoading={setIsDocumentLoading}
                             side="left"
                />
                {overlays && overlays.map((overlay, i) => overlay(i, isEvenPage && isDoubleSided, 'left'))}
              </div>
              {showBleed && <Bleed viewerState={viewerState}/>}
              {viewerState.totalPageNumber > 2 && renderPageNumber(viewerState.pageNumber)}
            </div>}
            {isMultiPageDoubleSided && viewerState.previewUrl && !stickyPreview &&
                <div
                    className={isDoubleSided ? `double-side-page ${viewerState.pageSize.toLowerCase()}` : 'single-side-page'}>
                  <div className={`${wrapperClasses} ${getCoverClass(viewerState.pageNumber + 1)}`}
                       style={pageStyle()}>
                    <PDFRenderer name={fileName}
                                 stickyPreview={stickyPreview}
                                 orderItemID={orderItem.ID}
                                 state={{
                                   ...viewerState,
                                   pageNumber: isFirstPage ? 1 : viewerState.pageNumber + 1
                                 }}
                                 setState={setViewerState}
                                 onPdfLoaded={isDoubleSided && isFirstPage ? onPdfLoaded : () => {}}
                                 documentLoaded={documentLoaded}
                                 setIsDocumentLoading={()=>{}}
                                 side="right"
                    />

                    {overlays && overlays.map((overlay, i) => overlay(i, false, 'right'))}
                  </div>
                    {showBleed && isDoubleSided && <Bleed viewerState={viewerState}/>}
                    {viewerState.totalPageNumber > 2 && renderPageNumber(viewerState.pageNumber + 1)}
                </div>
            }
          </div>
          {isDocumentLoading && <div className="pdf-viewer-loading-overlay mobile">
            <div className="pdf-viewer-loader-background"/>
            <LoadingDots/>
          </div>}
          {viewerState.previewUrl && !isMobile && viewerState.totalPageNumber > 1 && <Paginator
            viewerState={viewerState}
            stickyPreview={stickyPreview}
            setPage={setPage}
          />}
        </div>
        {viewerState.previewUrl && isMobile && viewerState.totalPageNumber > 1 && <Paginator
          viewerState={viewerState}
          stickyPreview={stickyPreview}
          setPage={setPage}
        />}
        {documentLoaded && <div className="preview-warning mobile">{t('UploadDocument.PreviewWarning')}</div>}
        {viewerState.previewUrl && isMobile && <UploadDocumentButton
          {...{
            setDocumentLoaded, setFileName, fileName, onFormChange, orderItem, properties, product,
            setViewerState, viewerState, uploadErrorMessage, setIsDocumentLoading, setUploadErrorMessage,
            setUploadError, setForceInputFile, onPdfLoaded
          }}
        />}
      </div>
    </div>
    {isMobile && !documentLoaded && uploadErrorMessage && <div className="upload-error-block-bottom">
      <p className="upload-error" dangerouslySetInnerHTML={{__html: uploadErrorMessage}}/>
    </div>}
    {isDocumentLoading && <div className="pdf-viewer-loading-overlay desktop">
      <div className="pdf-viewer-loader-background"/>
      <LoadingDots/>
    </div>}
  </>
}
