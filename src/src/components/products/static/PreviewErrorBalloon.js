import React from 'react'
import { t } from '$themelocalization'
import ErrorBalloon from '../ErrorBalloon'

const PreviewErrorBalloon = ({ poofPreviewError }) => poofPreviewError ?
  <ErrorBalloon className="proof-preview-failure">
    {t('productProof.PreviewFailure')}
  </ErrorBalloon> : null

export default PreviewErrorBalloon
