import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { t } from '$themelocalization'
import Layout from '../components/layout'
import { UStoreProvider } from '@ustore/core'
import legacyIframeHandler from '$ustoreinternal/services/legacyIframeHandler'
import location from '$ustoreinternal/services/locationProvider'
import './Legacy.scss'

//Using https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
const Legacy = (props) => {
  const navigate = useNavigate()
  const handleResize = () => legacyIframeHandler.handleResize(!props.showScroll)
  const handleClickingIframe = () => legacyIframeHandler.handleClickingIframe()
  const handleFrameMessage = (e) => {
    const msg = e.data
    if (!msg || !msg.type) {
      return
    }

    const asPath = location.pathname + location.search

    // if the message is an info request message, just call the function to get the info and post the reposnse.
    if (msg.type === '@REQUEST_UI_INFO') {
      legacyIframeHandler.onRequestScrollPosition(msg)
      return
    }

    if (msg.type === '@NG_REDIRECT' || msg.type === '@CHANGE_NG_ROUTE') {
      legacyIframeHandler.onRedirectRequested(msg, asPath)
      return
    }

    if (msg.type === '@SCROLL_PARENT_DISABLE' || msg.type === '@SCROLL_PARENT_ENABLE') {
      legacyIframeHandler.onScrollParentRequested(msg)
      return
    }

    if (msg.type === '@APPROVAL_SUMMARY') {
      if (msg.data?.pendingApprovalCount && parseInt(msg.data.pendingApprovalCount) !== 0) {
        return
      }
       UStoreProvider.api.orders.getUserOrdersSummary()
        .then((userOrdersSummary) => {
          UStoreProvider.state.customState.set('userOrdersSummary', userOrdersSummary)

        })
      return
    }

    const { messageHandled: changeRouteOrDimensionsHandled } = legacyIframeHandler.changeRouteOrDimensions(msg, asPath)
    const messageHandled = changeRouteOrDimensionsHandled || legacyIframeHandler.handleScrolling(msg)

    if (!messageHandled && !(['START', 'STATE', 'ACTION', 'PARTIAL_STATE', 'INIT_INSTANCE', '@SCROLL_ON', '@SCROLL_OFF', '@SCROLL_TO', '@CHANGE_ROUTE', '__REACT_CONTEXT_DEVTOOL_GLOBAL_HOOK_EVENT', 'webpackWarnings', 'webpackClose'].includes(msg.type))) { UStoreProvider.state.dispatch(msg) }
  }

  useEffect(() => {
    legacyIframeHandler.setNavigate = navigate
  })

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    window.addEventListener('message', handleFrameMessage)
    window.addEventListener('blur', handleClickingIframe)

    legacyIframeHandler.adaptContainerToIframe()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('message', handleFrameMessage)
      window.removeEventListener('blur',handleClickingIframe)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Layout {...props}>
      {window.uStoreConfig?.uStoreRemoteServerUrl?.includes('https://') ?
        <div className="cant-show-secured-legacy">
        <h1>{t('LegacyPageCantShowSecuredInDev')}</h1>
        </div>:
      <div className="iframe-container" ref={e => legacyIframeHandler.iframeContainer = e} />}
    </Layout>
  )
}

export default Legacy
