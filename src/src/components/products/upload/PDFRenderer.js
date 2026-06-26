import 'pdfjs-dist/build/pdf.worker.mjs'
import { useState, useEffect, useRef } from 'react'
import pdfLoader from './pdfLoader'
import { getImageBlobFromCanvas } from '../../../services'
import { prependServerDomain } from '$themeservices'
import { UStoreProvider } from '@ustore/core'
import FirstPageImage from '$assets/images/new-upload/first-page.svg'
import LastPageImage from '$assets/images/new-upload/last-page.svg'

export const PDFRenderer = ({
  name,
  state,
  onPdfLoaded,
  onlyFirstPage,
  orderItemID,
  stickyPreview,
  documentLoaded,
  setIsDocumentLoading,
  side
}) => {
  const canvasRef = useRef(null)
  const [pdf, setPDF] = useState(null)
  const [firstRender, setFirstRender] = useState(true)
  const [viewerState, setViewerState] = useState(state)
  const [isNewThumbnailLoaded, setIsNewThumbnailLoaded] = useState(false)

  useEffect(() => {
    (async () => {
      if (state.previewUrl) {
        await pdfLoader.clear()
        const newPdf = await pdfLoader.load(prependServerDomain(state.previewUrl))
        setPDF(newPdf)
        pdf && setFirstRender(true)
        !documentLoaded && onPdfLoaded && onPdfLoaded(newPdf)
        setViewerState({ ...state })
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.previewUrl, name, onlyFirstPage, state.doubleSidedPrinting])

  useEffect(() => {
    if (!pdf) return
    const fieldsToRefreshBy = ['pageNumber', 'scale', 'rotation', 'color', 'pageSize', 'doubleSidedPrinting']
    if (fieldsToRefreshBy.some(field => viewerState[field] !== state[field] || firstRender || onlyFirstPage)) {
      setFirstRender(false)
      setViewerState(state);
      (async () => {
        await render(state)
        setIsDocumentLoading && setIsDocumentLoading(false)
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, pdf, firstRender])

  const setCanvasSize = async ({ scale, rotation, page }) => {
    if (pdf && canvasRef?.current) {
      const canvas = canvasRef.current
      const canvasContext = await canvas.getContext('2d')
      const pageObj = await pdf.getPage(page)
      const viewport = await pageObj.getViewport({ scale, rotation, offsetX: 0, offsetY: 0 })
      canvas.height = viewport.height
      canvas.width = viewport.width
      canvasContext.clearRect(0, 0, canvas.width, canvas.height)
      return { page: pageObj, viewport, canvasContext, canvas }
    }
  }

  const renderImage = async (image, scale, rotation, side) => {
    const { canvasContext } = await setCanvasSize({ scale, rotation, page: 1 })
    await renderCoverPage(canvasRef, image, canvasContext, side)
  }

  const clearPage = async () => {
    const { canvasContext } = await setCanvasSize({ scale: 1, rotation: 0, page: 1 })
    await clearCanvas(canvasRef, canvasContext)
  }

  const render = async ({
    pageNumber,
    totalPageNumber,
    scale = 1,
    rotation = 0,
    color = true,
    doubleSidedPrinting
  }) => {
    try {
      if (pdf && canvasRef?.current) {
        if (side === 'right' && doubleSidedPrinting > 1 && pageNumber > totalPageNumber && totalPageNumber > 2  && !stickyPreview) {
          return renderImage(LastPageImage, scale, rotation, side)
        }
        if (side === 'left' && doubleSidedPrinting > 1 && pageNumber === 1 && totalPageNumber > 2 && !stickyPreview) {
          return renderImage(FirstPageImage, scale, rotation, side)
        }

        if (side === 'left' && doubleSidedPrinting > 1 && pageNumber > totalPageNumber && totalPageNumber > 2 && totalPageNumber % 2 ) {
          return clearPage()
        }

        const { page, viewport, canvasContext, canvas } = await setCanvasSize({
          scale,
          rotation,
          page: onlyFirstPage ? 1 : Math.min(pageNumber, totalPageNumber)
        })
        canvas.style[`margin-left`] = ''
        canvas.style[`margin-right`] = ''
        if (state.doubleSidedPrinting === viewerState.doubleSidedPrinting) {
          await page.render({ canvasContext, viewport }).promise
        }

        if (page && pageNumber === 1 && !isNewThumbnailLoaded && !stickyPreview) {
          const newThumbnailBlob = await getImageBlobFromCanvas(canvas)
          const newThumbnailFile = await new File([newThumbnailBlob], 'thumbnail.jpeg', { type: newThumbnailBlob.type })

          if (newThumbnailFile && !isNewThumbnailLoaded) {
            const isUpdated = await UStoreProvider.api.orders.replaceProductThumbnail(orderItemID, [newThumbnailFile])
            if (isUpdated) {
              setIsNewThumbnailLoaded(true)
            }
          }
        }

        if (!color) {
          const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            const grayscale = 0.3 * r + 0.59 * g + 0.11 * b
            data[i] = data[i + 1] = data[i + 2] = grayscale
          }
          canvasContext.putImageData(imageData, 0, 0)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }
  return <canvas ref={canvasRef}/>
}

function clearCanvas (canvasRef, context) {
  const canvas = canvasRef?.current
  const canvasWidth = canvas.width
  const canvasHeight = canvas.height
  context.clearRect(0, 0, canvasWidth, canvasHeight)
}

function renderCoverPage (canvasRef, coverImage, context, align) {
  const image = new Image()
  image.src = coverImage
  image.onload = () => {
    const canvas = canvasRef?.current
    const scaleFactor = 0.7 // 30%
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    context.clearRect(0, 0, canvasWidth, canvasHeight)

    let imgWidth = image.width
    let imgHeight = image.height

    if (imgWidth > imgHeight) {
      imgWidth = canvasWidth * scaleFactor
      imgHeight = (image.height / image.width) * imgWidth
    } else {
      imgHeight = canvasHeight * scaleFactor
      imgWidth = (image.width / image.height) * imgHeight
    }

    context.drawImage(image,
      align === 'left' ? (canvasRef?.current.width - imgWidth) : 0,
      (canvasRef?.current.height - imgHeight) / 2,
      imgWidth,
      imgHeight)
    canvas.style[`margin-${align}`] = 'auto'
  }
}
