import React, { useEffect, useReducer, useRef, useState } from 'react'
import { UStoreProvider } from '@ustore/core'
import pages from '$themepages/index'
import { camelToPascal, dashToCamel } from '$ustoreinternal/services/utils'
import locationProvider from '$ustoreinternal/services/locationProvider'
import { initialLoad } from '$ustoreinternal/services/initialLoad'
import themeContext from '$ustoreinternal/services/themeContext'
import { CookiesManager, storefrontCookies } from '$ustoreinternal/services/cookies'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import legacyIframeHandler from '$ustoreinternal/services/legacyIframeHandler'
import { getVariableValue } from '$ustoreinternal/services/cssVariables'
import '$styles/index.scss'
import urlGenerator from '$ustoreinternal/services/urlGenerator'

const renewTokenIntervalSec = 60 * 20

export const Generic = () => {
  const [initialProps, setInitialProps] = useState({})
  const isWebComponent =  process.env.REACT_APP_WEB_COMPONENT
  const doRenewToken = useRef(null)
  // eslint-disable-next-line
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0)


  const location  = useLocation()
  const query = useSearchParams()
  const params = useParams()
  const navigate = useNavigate()

  params.page = params.page || 'Home'

  const apiUrl = UStoreProvider.contextService.getValue('apiUrl')

  useEffect(() => {
    themeContext.updateRouteParams(params)
    themeContext.init(params)

    if (isWebComponent) {
      forceUpdate()
    }

    /* eslint-disable react-hooks/exhaustive-deps */
  },[location])

  useEffect(() => {
    const run = async () => {
      await initialLoad(params, navigate)
      // In a B2C store when user is anonymous - do renew token every 20 minuts to keep the session alive
      const { currentStore, currentUser } = UStoreProvider.state.get()
      if (currentStore && currentStore.StoreType === 2 && currentUser.IsAnonymous && !doRenewToken.current) {
        doRenewToken.current = setInterval(async () => {
          // getting new token
          const newToken = await UStoreProvider.api.store.renewToken()
          // updating new token
          UStoreProvider.contextService.setValue('securityToken', newToken.Token)
          CookiesManager.setCookie({key: storefrontCookies.token, value: newToken.Token})
          themeContext.set('securityToken', newToken.Token)
        }, 1000 * renewTokenIntervalSec)
      }

      // type 3 is uStore Connect
      if (currentStore && currentStore.StoreType === 3) {
        const cartUrl = currentStore.Attributes.find((attribute) => attribute.Name === 'CartUrl')?.Value
        if (cartUrl) {
          themeContext.set('cartUrl', cartUrl)
        }
      }

      // If current url contains http and store is ssl, redirect to https
      const sslOption = currentStore && currentStore.Attributes.find((attribute) => attribute.Name === 'SslOption')
      if (locationProvider.href.indexOf('http://') === 0
          && sslOption && sslOption.Value === 'SecureAll'
          && locationProvider.href.indexOf('localhost') === -1) {
        console.log('redirecting to https')
        locationProvider.href = locationProvider.href.replace('http://', 'https://')
      }
    }

    const unsubscribe = UStoreProvider.state.subscribe(() => {
      // This prevents the storeFriendlyID from being null on reload in legacy page.
      if (UStoreProvider.state.get().currentStore) {
        themeContext.set('storeFriendlyID', UStoreProvider.state.get().currentStore.FriendlyID)
      }

      forceUpdate()
    })

    run()

    return () => {
      unsubscribe()
      if (!isWebComponent) {
      legacyIframeHandler.unmount()
        }
      if (doRenewToken.current) { clearInterval(doRenewToken.current) }
      UStoreProvider.dispose()
    }
  }, [])

  useEffect(() => {
    const favIcon = document.getElementById('favicon')
    if (favIcon) {
      favIcon.href = getVariableValue('--favicon-url', '', true)
    }

    const asPath = locationProvider.href

    // remove params added by legacy login page.
    // in order not to interfere with query params used by legacy pages like customization and finalize,
    // we dont remove all params, just the one being passed to us from login page.
    if (asPath.includes('?')) {
      let href = asPath

      href = href.replace(/(ShowRibbon|CurrencyID|SecurityToken|StoreGuid)=[a-zA-Z0-9-]*&?/ig, '')

      href = href.replace(/[&?]$/, '')

      if (asPath !== href) {
        let currentState = window.history.state
        // in Safari, history.state is NULL, so we need to replace it with an object.
        if (currentState === null || currentState === undefined) {
          currentState = { url: '', as: '', options: {} }
        }
        currentState.url = href
        currentState.as = href

        if (!isWebComponent) {
          window.history.replaceState(currentState, '', href)
        }
      }
    }
  })

  useEffect(() => {
    const run = async () => {
      if (params) {
        const pageComponentName = camelToPascal(dashToCamel(params.page))
        const pageComponent = pages[pageComponentName]
        if (pageComponent && pageComponent.getInitialProps) {
          const initialProps = await pageComponent.getInitialProps({ query: params })
          setInitialProps(initialProps || {})
        }
      }
    }

    if (UStoreProvider.contextService.getValue('apiUrl')) {
      run()
    }
  }, [params, apiUrl])

  const getPageComponentName = (params) => {
    return camelToPascal(dashToCamel(params.page === 'pages'? params.id : params.page))
  }

  // in client only will redirect when the url is missing the page name
  if ((locationProvider.pathname.match(/\//g) || []).length < 2) {
    if (locationProvider.pathname === '/') {
      navigate(urlGenerator.get({page:'home'}))
    } else {
      locationProvider.href = locationProvider.href + '/' + locationProvider.search
    }
  }

  // in client if security token is missing get it from the theme context
  if (!query.SecurityToken) {
    query.SecurityToken = themeContext.get('securityToken')
  }

  if (!params || !params.page) {
    return null
  }

  const pageComponentName = getPageComponentName(params)

  // modify state that is sent to the page with out modifying the state in the uStoreProvider
  const state = UStoreProvider ? UStoreProvider.state.get() : {}

  // create all properties needed from the page component
  const newProps = { state, customState: { ...initialProps, ...state.customState } }

  if (pageComponentName === 'ConnectLoggedOut') {
    return React.createElement(pages[pageComponentName], {})
  }

  if (state.initState) return null

  return React.createElement(pages[pageComponentName], newProps)
}
