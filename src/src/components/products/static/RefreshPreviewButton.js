import React, { useEffect, useState } from 'react'
import { t } from '$themelocalization'
import './RefreshPreviewButton.scss'

const RefreshPreviewButton = ({showRefreshPreview, onProofPreviewClick, disabled}) => {
  const [isDisabled, setIsDisabled] = useState(false)

  useEffect(() => {
      setIsDisabled(disabled)
  }, [disabled])

  return showRefreshPreview ?
    <div className="button button-secondary refresh-preview" disabled={isDisabled} onClick={onProofPreviewClick}>
      {t('productProof.RefreshPreview')}
    </div>  : null
}

export default RefreshPreviewButton
