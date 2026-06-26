import { extractValues, getPropertyPreviewValue } from '../easyUploadUtils'
import { Overlay } from './Overlay'

export const Folding = (property, key, viewerState) => {
  if (!property.value || property.value === 'No Fold') return null
  const vAndHValues = extractValues(getPropertyPreviewValue(property))
  const classMap = {
    'short-landscape': 'horizontal',
    'long-landscape': 'vertical',
    'short-portrait': 'vertical',
    'long-portrait': 'horizontal',
    'short-': 'vertical',
    'long-': 'horizontal',
  }

  return <Overlay key={key} type="folding" props={{ 'data-folding': property.value }}>
    {vAndHValues['short'] ? <div className={classMap[`short-${viewerState.orientation}`]}>
      {Array(vAndHValues['short']).fill(0).map((_, i) => <div key={i}/>)}
    </div> : null}
    {vAndHValues['long'] ? <div className={classMap[`long-${viewerState.orientation}`]}>
      {Array(vAndHValues['long']).fill(0).map((_, i) => <div key={i}/>)}
    </div> : null}
  </Overlay>
}
