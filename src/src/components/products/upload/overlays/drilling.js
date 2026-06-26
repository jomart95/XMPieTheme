import { getPropertyPreviewValue, extractValues } from '../easyUploadUtils'
import { Overlay } from './Overlay'

const drillHoleSpacing = [
  {page: 'Auto', spacing: 86, width: 'Auto', height: 'Auto', holeDiameter: 6, margin: 9},
  { page: '297X420', spacing: 86, width: 297, height: 420, holeDiameter: 6, margin: 9 },
  { page: '210X297', spacing: 86, width: 210, height: 297, holeDiameter: 6, margin: 9 },
  { page: '148X210', spacing: 86, width: 148, height: 210, holeDiameter: 6, margin: 9 },
  { page: '8.5X11', spacing: 76, width: 215.9, height: 279.4, holeDiameter: 6, margin: 9 },
  { page: '8.5X14', spacing: 76, width: 215.9, height: 355.6, holeDiameter: 6, margin: 9 },
  { page: '11X17', spacing: 76, width: 279.4, height: 431.8, holeDiameter: 6, margin: 9 },
]

export const DrillingType = (property, key, viewerState, isBack) => {
  if (!property.value) return null
  const vAndHValues = extractValues(getPropertyPreviewValue(property))

  const page = viewerState.pageSize || 'Auto'

  const createPageSize = (page) => {
    if (/^\d+(\.\d+)?X\d+(\.\d+)?$/.test(page)) {
      const [width, height] = page.split("X")
      return { page, spacing: 76, width: parseFloat(width), height: parseFloat(height), holeDiameter: 6, margin: 9 }
    }
  }

  const settings = drillHoleSpacing.find(d => {
    if (page === 'Auto' && d.page === 'Auto') return true
    const [w, h] = d.page.split('X').map(Number)
    const [width, height] = page.split('X').map(b => parseFloat(b))
    return w === width && h === height
  }) ||  createPageSize(page)

  if (settings?.page === 'Auto') {
    if (!viewerState.metaData) {
      return null
    }
    settings.width = viewerState.metaData.Width * 0.3527
    settings.height = viewerState.metaData.Height * 0.3527
  }


  const spacing = parseFloat(settings?.spacing)
  const width = viewerState.orientation === 'portrait' ? parseFloat(settings?.width) : parseFloat(settings?.height)
  const height = viewerState.orientation === 'portrait' ? parseFloat(settings?.height) : parseFloat(settings?.width)
  const margin = parseFloat(settings?.margin)
  const holeDiameter = parseFloat(settings?.holeDiameter)

  const getHoleSizeAndPosition = (holeIndex, side, holes) => {
    const orientation = viewerState.orientation || (settings.width > settings.height ? 'landscape' : 'portrait')
    const holeHeight = orientation === 'portrait' ? settings?.holeDiameter / settings?.height * 100 : settings?.holeDiameter / settings?.width * 100
    const holeWidth = orientation === 'portrait' ? settings?.holeDiameter / settings?.width * 100 : settings?.holeDiameter / settings?.height * 100
    let top = margin / height * 100
    let left = margin / width * 100

    const isBackSwitch = {
      'left': 'right',
      'right': 'left',
      'top': 'top',
      'bottom': 'bottom',
    }

    if (isBack) {
      side = isBackSwitch[side]
    }

    if (side === 'left' || side === 'right') {
      const drillSpacing = (spacing + holeDiameter) / height * 100
      top = ((100 - (drillSpacing * (holes - 1)) - holeHeight) / 2) + (drillSpacing * holeIndex)
      if (side === 'right') {
        left = (100 - holeWidth) - (margin / width * 100)
      }
    }

    if (side === 'top' || side === 'bottom') {
      const drillSpacing = (spacing + holeDiameter) / width * 100
      left = ((100 - (drillSpacing * (holes - 1)) - holeHeight) / 2) + (drillSpacing * holeIndex)
      if (side === 'bottom') {
        top = (100 - holeHeight) - (margin / height * 100)
      }
    }

    return {
      width: `${holeWidth}%`,
      height: `${holeHeight}%`,
      top: `${top}%`,
      left: `${left}%`,
    }
  }

  return <Overlay key={key} type="drilling" props={{ 'data-drilling': property.value }}>
    {Object.keys(vAndHValues).map((key) =>
      <div className={`wrapper drilling-${key}`} key={key}>
        {Array(vAndHValues[key]).fill(0).map((_, idx) => <div key={idx} className="drilling-hole"
                                                              style={getHoleSizeAndPosition(idx, key, vAndHValues[key])}/>)}
      </div>)}
  </Overlay>
}
