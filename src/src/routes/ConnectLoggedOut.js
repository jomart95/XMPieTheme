import React from 'react'
import { useSearchParams } from 'react-router-dom'
import xmpieLogo from '$assets/images/xmpieLogo.svg'

const ConnectLoggedOut = () => {
  const [params] = useSearchParams()
  const containerStyle = {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'column',
    fontSize: 'var(--text-size-h4)'
  }
  const imageStyle = {
    marginTop: '100px',
  }

  return <div style={containerStyle}>

    <img style={imageStyle} src={xmpieLogo} width="200px" height="200px" alt="logout"/>
    <div>{params.get('message')}</div>
  </div>
}

export default ConnectLoggedOut
