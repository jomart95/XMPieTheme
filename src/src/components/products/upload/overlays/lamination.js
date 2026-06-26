import { getPropertyPreviewValue } from '../easyUploadUtils'
import { Overlay } from './Overlay'

export const Lamination = (property, key) => {
  const value = getPropertyPreviewValue(property)?.toLowerCase()
  if (!value || value.toLowerCase() === 'none') {
    return null
  }
  return <Overlay key={key} type="lamination" props={{ 'data-lamination': value }}/>
}
