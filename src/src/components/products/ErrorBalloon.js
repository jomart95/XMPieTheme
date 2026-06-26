import React from 'react'
import './ErrorBalloon.scss'
import { Icon } from '$core-components'
import { usePDFViewer } from './upload/PDFViewerContext'

const ErrorBalloon = ({setErrorMessage, control = false, topArrow = false,  children, className }) => {

  const { setDefault } = usePDFViewer()
  const handleClose = () => {
    setErrorMessage('')
    setDefault && setDefault()
  }

  return <div className={`${control ? 'error-balloon-wrapper' : ''}`}>
  {topArrow && <div className="arrow"/>}
    <div className={`error-balloon ${className}`}>
      {control && <button className="close-error-balloon" onClick={() => handleClose()}>
        <Icon name="close_black.svg" width="10px" height="10px"/>
      </button>}
      <div className="error-balloon-container">
        <Icon name="error.svg" width="13px" height="13px"/>
        <div className="error-balloon-children-container">
          {children}
        </div>
      </div>
    </div>
  </div>
}

export default ErrorBalloon
