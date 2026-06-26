import {
  dashToCamel,
  createContext,
  getNextConfig, queryOrCookieStrToObj, getBaseUrlComponents, replaceCultureCodeInURL
} from '$ustoreinternal/services/utils'
import themeContext from '$ustoreinternal/services/themeContext'
import location from '$ustoreinternal/services/locationProvider'
import { UStoreProvider, http } from '@ustore/core'
import pages from '$themepages/index'
import { initiateThemeState } from '$themeservices/initThemeState'
import { CookiesManager, storefrontCookies } from '$ustoreinternal/services/cookies'
import {
  redirectToFullURL,
  redirectToStoreErrorPage,
  redirectToGenericErrorPage,
  redirectToLogout,
} from './redirect'

export const USER_ID_EXPIRATION_DAYS = 30

const getUserInitialProps = async (initialPropsFunctionName, ctx) => {
  const routedPage = Object.keys(pages).filter(p => p.toLowerCase() === initialPropsFunctionName.toLowerCase())

  if (routedPage.length > 0 && pages[routedPage].getInitialProps) {
    return await pages[routedPage].getInitialProps({query: ctx})
  }

  return pages.Home.getInitialProps ? await pages.Home.getInitialProps({query: ctx}) : {}
}

export const initAndLogin = async (ctx, url, navigate = null) => {
  const isWebComponent = process.env.REACT_APP_WEB_COMPONENT
  const authChannel = new BroadcastChannel('xmpie_auth_channel');
  authChannel.addEventListener('message', (event) => {
    if (event.data.type === 'NEW_TAB_OPENED' && event.data.newUrl) {
      const currentStore = url.match(/^(.*?\/[a-zA-Z-]+)(?:\/|$)/)
      const newStore = event.data.newUrl.match(/^(.*?\/[a-zA-Z-]+)(?:\/|$)/)
      const token = sessionStorage.getItem(storefrontCookies.token);
      if (token && currentStore[1] && newStore[1] && currentStore[1] === newStore[1]) {
        authChannel.postMessage({ type: 'TOKEN', token });
      }
    } else if (event.data.type === 'TOKEN' && event.data.token && !sessionStorage.getItem(storefrontCookies.token)) {
      sessionStorage.setItem(storefrontCookies.token, event.data.token);
      redirectToFullURL(url)
    }
  });
  authChannel.postMessage({ type: 'NEW_TAB_OPENED', newUrl: url });
  const publicRuntimeConfig = getNextConfig()
  const res = getBaseUrlComponents(url)

  if (!res) return

  if (url.indexOf('connect-logged-out') > -1) {
    return
  }

  let securityTokenFromUrl = ''
  const { storeBaseURL: storeBaseFromURL, cultureCode: cultureCodeFromURL } = res
  const storedCultureCode = CookiesManager.getCookie(storefrontCookies.language)
  if (storedCultureCode && storedCultureCode !== cultureCodeFromURL) {
    redirectToFullURL(replaceCultureCodeInURL(url, storedCultureCode))
    return false
  }

  if (themeContext.get('ssoToken')) {
    const newSecurityToken = await UStoreProvider.api.store.loginBySSOToken(themeContext.get('ssoToken'), isWebComponent ? themeContext.get('serverDomain') : '')
    themeContext.set('securityToken', newSecurityToken.Token)
    securityTokenFromUrl = newSecurityToken.Token
    const currentUrl = new URL(location.href)
    currentUrl.searchParams.delete('SsoToken')
    if (!isWebComponent) {
      window.history.replaceState(window.history.state, '', currentUrl.href)
    } else {
      UStoreProvider.contextService.set('securityToken',newSecurityToken.Token)
      navigate(currentUrl.pathname + currentUrl.search)
    }
  }

  const storeBaseFromMem = themeContext.get('storeBaseURL') || CookiesManager.getCookie(storefrontCookies.storeBaseURL)
  let shouldCookieRibbonBeShown = CookiesManager.getCookie(storefrontCookies.cookieRibbonNotShownYet) || ' true'

  const searchStr = location.search.substring(1)

  if (searchStr) {
    const q = queryOrCookieStrToObj(searchStr)

    if (q.SecurityToken) {
      securityTokenFromUrl = q.SecurityToken
    }
    if (q.ShowRibbon) {
      shouldCookieRibbonBeShown = q.ShowRibbon.toLowerCase()
    }
  }

  const shouldCallLoginByUrl = !!url && !securityTokenFromUrl &&
    (themeContext.get('securityToken') === undefined || !themeContext.get('securityToken') ||
      (storeBaseFromMem && storeBaseFromURL !== storeBaseFromMem))
  const date = new Date();
  date.setTime(date.getTime() + (USER_ID_EXPIRATION_DAYS * 24 * 60 * 60 * 1000));

  if (shouldCallLoginByUrl) {
    ['securityToken', 'storeBaseURL', 'storeID', 'FriendlyID'].forEach(key => themeContext.deleteKey(key))

    const currentUser = themeContext.get('userID') || CookiesManager.getCookie(storefrontCookies.userID)

    let loginResponse = await http.post(`${publicRuntimeConfig.apiUrl}/v1/store/loginByUrl`, { FullURL: url, UserID: currentUser }, { auth: false })

    if ((!loginResponse.Token || !loginResponse.Token.Token) && !loginResponse.URL) {
      // in case no new token returned, or API failed, redirect to logout.
      redirectToGenericErrorPage(ctx)
      return false
    }

    // save info from API to context and cookie
    themeContext.set('storeBaseURL', undefined)
    themeContext.set('securityToken', loginResponse.Token.Token)
    themeContext.set('storeID', loginResponse.StoreID)
    themeContext.set('userID', loginResponse.UserID)

    CookiesManager.setCookie({ key: storefrontCookies.token, value: themeContext.get('securityToken') })
    CookiesManager.setCookie({ key: storefrontCookies.storeID, value: themeContext.get('storeID') })
    CookiesManager.setCookie({ key: storefrontCookies.storeBaseURL, value: storeBaseFromURL })
    CookiesManager.setCookie({ key: storefrontCookies.cookieRibbonNotShownYet, value: shouldCookieRibbonBeShown })
    // need to save the user ID to the cookie, so that if he closes the browser and reopens he wont lose his data.
    CookiesManager.setCookie({ key: storefrontCookies.userID, value: loginResponse.UserID, days: USER_ID_EXPIRATION_DAYS })

    // raise the showRibbon flag, so if not redirecting to logout, NG will show the cookie ribbon.
    UStoreProvider.state.customState.set('showCookieRibbon', JSON.parse(shouldCookieRibbonBeShown))

    let returnURL = loginResponse.URL

    if (returnURL) {
      returnURL += returnURL.includes('?') ? '&ShowRibbon=true' : '?ShowRibbon=true'
      // check if return URL is logout page, and if so, append the ShowRibbon=true
      if (returnURL.toLowerCase().includes('logout.aspx')) {
        UStoreProvider.contextService.clear()
        returnURL += '&forceLogin=true'
      }

      redirectToFullURL(returnURL)
      return false
    }
  }
  else {
    CookiesManager.setCookie({ key: storefrontCookies.token, value: themeContext.get('securityToken') })
    CookiesManager.setCookie({ key: storefrontCookies.storeID, value: themeContext.get('storeID') })
    CookiesManager.setCookie({ key: storefrontCookies.storeBaseURL, value: storeBaseFromURL })
    CookiesManager.setCookie({ key: storefrontCookies.cookieRibbonNotShownYet, value: shouldCookieRibbonBeShown })
    // need to save the user ID to the cookie, so that if he closes the browser and reopens he wont lose his data.
    CookiesManager.setCookie({ key: storefrontCookies.userID, value: themeContext.get('userID'), days: USER_ID_EXPIRATION_DAYS })

    UStoreProvider.state.customState.set('showCookieRibbon', JSON.parse(shouldCookieRibbonBeShown))
  }

  themeContext.set('storeBaseURL', storeBaseFromURL)

  await UStoreProvider.init(publicRuntimeConfig, {
    ...themeContext.get(),
    onAccessDenied: () => redirectToLogout(),
    onStoreNotAvailable: () => redirectToStoreErrorPage(),
    onGeneralError: (err) => redirectToGenericErrorPage(err),
  }).then(() => {
    initiateThemeState()
  })

  return true
}

export const initialLoad = async (ctxParam, navigate = null) => {
  const ctx = ctxParam || createContext()

  themeContext.updateRouteParams()

  const fullUrl = location.href
  let shouldContinue = await initAndLogin(ctx, fullUrl, navigate)

  // if should not continue, do not load further data.
  if (!shouldContinue) return {}
  // }

  const { page } = themeContext.get()
  const initialPropsFunctionName = dashToCamel(page)

  //sets the user initial props to custom state.
  const userInitialProps = await getUserInitialProps(initialPropsFunctionName, ctx)
  if (userInitialProps) {
    UStoreProvider.state.customState.setBulk(userInitialProps)
  }

  const userCustomState = { customState: { ...UStoreProvider.state.get().customState, ...userInitialProps } }

  // returns the state from the component to be rendered.
  return { state: { ...UStoreProvider.state.get(), ...userCustomState }, context: ctx.query }
}
