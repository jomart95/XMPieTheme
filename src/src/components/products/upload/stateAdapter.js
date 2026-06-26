import { getPropertyPreviewValue } from './easyUploadUtils'

const Color = (property) => ({ color: getPropertyPreviewValue(property)?.toLowerCase() === 'true' })

const Corners = (property) => {
  const previewValues = getPropertyPreviewValue(property)
  if (!previewValues) {
    return { corners: '' }
  }

  return ({ corners: previewValues.toLowerCase().split(';').map((corner) => `corners-${corner}`).join(' ') })
}

const Lamination = (property) =>{
  const valueMap = {
    'gloss': 'gloss',
    'matt': 'matt',
    'none': '',
    '':''
  }
  const value = valueMap[getPropertyPreviewValue(property)?.toLowerCase()]
  return ({ lamination: value ? `lamination-${value}` : '' })
}

const Sides = (property) => {
  const previewValueMap = {
    'Single': 1,
    'Double': 2,
    'Flip': 3,
  }
  return ({ doubleSidedPrinting: parseInt(previewValueMap[getPropertyPreviewValue(property)] || 0) })
}

const PaperSize = (property) => ({ pageSize: getPropertyPreviewValue(property) })

const Orientation = (property) => ({ orientation: getPropertyPreviewValue(property).toLowerCase() })

const DrillingType = (property) => ({ drilling: getPropertyPreviewValue(property) ? 'drilling' : '' })

const PaperColor = (property) => ({ paperColor: getPropertyPreviewValue(property) })

const states = {
  Color,
  Corners,
  Lamination,
  Sides,
  PaperSize,
  Orientation,
  Drilling: DrillingType,
  PaperColor,
}

export default states
