import { extractValues, getPropertyPreviewValue } from '../easyUploadUtils'
import { Overlay } from './Overlay'
import { ReactComponent as StaplePin } from '$assets/images/new-upload/staple-pin.svg'
import { ReactComponent as StaplePinBack } from '$assets/images/new-upload/staple-pin-back.svg'

export const StaplingSide = (property, key, viewerState, isBack, side, isMobilePreview) => {
  if (!property.value) return null
  const vAndHValues = extractValues(getPropertyPreviewValue(property))
  const page = viewerState.pageSize || 'Auto'
  const isInnerPage = viewerState.pageNumber > 1 && viewerState.pageNumber < viewerState.totalPageNumber

  const settings = pageSizes.find(d => {
    if (page === 'Auto' && d.page === 'Auto') return true
    const [w, h] = d.page.split('X').map(Number)
    const [width, height] = page.split('X').map(b => parseFloat(b))
    return w === width && h === height
  }) || createPageSize(page)

  if (settings?.page === 'Auto') {
    if (!viewerState.metaData) {
      return null
    }
    settings.width = viewerState.metaData.Width * 0.3527
    settings.height = viewerState.metaData.Height * 0.3527
  }

  const getStapleSize = (side) => {
    if (['left', 'right', 'topleft', 'topright', 'bottomleft', 'bottomright'].includes(side)) {
      return { height: `${10 / settings.height * 100}%` }
    }

    if (['top', 'bottom'].includes(side)) {
      const ratio = settings.width / settings.height > 1 ? settings.height / settings.width : settings.width / settings.height
      return { height: `${((10 / settings.height) + ratio) * 100}%` }
    }

    return {}
  }

  const getCornerMarking = (idx, side) => {
    if (isInnerPage) {
      return null
    }

    if (viewerState.pageNumber === viewerState.totalPageNumber ||
      (viewerState.doubleSidedPrinting > 1 && viewerState.pageNumber > viewerState.totalPageNumber)) {
      return <StaplePinBack key={idx} style={getStapleSize(side)}/>
    }

    return <StaplePin key={idx} style={getStapleSize(side)}/>
  }

  if (!isMobilePreview &&
    viewerState.doubleSidedPrinting > 1 &&
    viewerState.totalPageNumber > 2 &&
    ((viewerState.pageNumber === 1 && side === 'left') ||
      (viewerState.pageNumber === viewerState.totalPageNumber && side === 'right'))) {
    return null
  }

  const staplingBackground = viewerState.pageNumber === 1 || viewerState.pageNumber === viewerState.totalPageNumber ||
  (viewerState.doubleSidedPrinting > 1 && side === 'left' && viewerState.pageNumber - 1 === viewerState.totalPageNumber) ? { background: 'none' } : {}
  const innerPageClassForCorner = isInnerPage ? 'inner-page' : ''

  return <Overlay key={key} type="stapling" props={{ 'data-stapling': property.value, style: { display: 'grid' } }}>
    {Object.keys(vAndHValues).map((key) =>
      <div className={`wrapper stapling-${isBack ? isBackSwitch[key] : key} ${innerPageClassForCorner}`} key={key}
           style={staplingBackground}>
        {Array(vAndHValues[key])
          .fill(0)
          .map((_, idx) => getCornerMarking(idx, key))}
      </div>)}
  </Overlay>
}

const createPageSize = (page) => {
  if (/^\d+(\.\d+)?X\d+(\.\d+)?$/.test(page)) {
    const [width, height] = page.split('X')
    return { page, width: parseFloat(width), height: parseFloat(height) }
  }
}

const pageSizes = [
  { page: 'Auto', width: 'Auto', height: 'Auto' },
  { page: '297X420', width: 297, height: 420 },
  { page: '210X297', width: 210, height: 297 },
  { page: '148X210', width: 148, height: 210 },
  { page: '8.5X11', width: 215.9, height: 279.4 },
  { page: '8.5X14', width: 215.9, height: 355.6 },
  { page: '11X17', width: 279.4, height: 431.8 },
]

const isBackSwitch = {
  'left': 'right',
  'right': 'left',
  'top': 'top',
  'bottom': 'bottom',
  'topleft': 'topright',
  'topright': 'topleft',
  'bottomleft': 'bottomright',
  'bottomright': 'bottomleft',
}

