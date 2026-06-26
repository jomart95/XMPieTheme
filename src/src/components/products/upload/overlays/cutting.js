import { extractValues, getPropertyPreviewValue } from '../easyUploadUtils'
import { Overlay } from './Overlay'

export const Cutting = (property, key, viewerState) => {
  if (!property.value || property.value === 'NoCutting') return null
  const vAndHValues = extractValues(getPropertyPreviewValue(property))
  const classMap = {
    'short-landscape': 'horizontal',
    'long-landscape': 'vertical',
    'short-portrait': 'vertical',
    'long-portrait': 'horizontal',
    'short-': 'vertical',
    'long-': 'horizontal',
  }

  return <Overlay key={key} type="cutting" props={{ 'data-cutting': property.value }}>
    {vAndHValues['short'] ? <div className={classMap[`short-${viewerState.orientation}`]}>
      {Array(vAndHValues['short']).fill(0).map((_, i) => <div key={i}/>)}
    </div> : null}
    {vAndHValues['long'] ? <div className={classMap[`long-${viewerState.orientation}`]}>
      {Array(vAndHValues['long']).fill(0).map((_, i) => <div key={i}/>)}
    </div> : null}
  </Overlay>
}
