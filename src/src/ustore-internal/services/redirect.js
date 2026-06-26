import {http, UStoreProvider} from '@ustore/core'
import {USER_ID_EXPIRATION_DAYS} from './initialLoad'
import themeContext from '$ustoreinternal/services/themeContext'
import {CookiesManager, storefrontCookies} from '$ustoreinternal/services/cookies'
import {getNextConfig, getBaseUrlComponents} from '$ustoreinternal/services/utils'
import location from '$ustoreinternal/services/locationProvider'

export const redirectToStoreErrorPage = () => {
  redirectToLegacy('ShowMessage.aspx?ErrorCode=0')
}
// TODO: As we make this function in charge of errors, it makes sense to rename it
export const redirectToGenericErrorPage = (err) => {
  if (err && err.TypeName === 'ResourceNotPermitted.Order') {
    redirectToLoginPage()
  } else {
    redirectToLegacy(`errorPage.aspx`)
  }
}

export const loginByUrlCall = async (publicRuntimeConfig, url) => {
  ['securityToken', 'storeBaseURL', 'storeID', 'FriendlyID'].forEach(key => themeContext.deleteKey(key))

  const currentUser = themeContext.get('userID') || CookiesManager.getCookie(storefrontCookies.userID)

  const loginResponse = await http.post(`${publicRuntimeConfig.apiUrl}/v1/store/loginByUrl`, {
    FullURL: url,
    UserID: currentUser
  }, {auth: false})

  if (!loginResponse.URL) {
    redirectToFullURL(loginResponse.URL)
  }

  if ((!loginResponse.Token || !loginResponse.Token.Token) && !loginResponse.URL) {
    // in case no new token returned, or API failed, redirect to logout.
    redirectToGenericErrorPage()
    return null
  }

  return loginResponse
}

export const returnToUrl = (loginResponse) => {
  let returnURL = loginResponse.URL

  if (returnURL) {
    returnURL += returnURL.includes('?') ? '&ShowRibbon=true' : '?ShowRibbon=true'
    // check if return URL is logout page, and if so, append the ShowRibbon=true
    if (returnURL.toLowerCase().includes('logout.aspx')) {
      returnURL += '&forceLogin=true'
    }

    redirectToFullURL(returnURL)
    return false
  }
  return true
}

export const setCookies = (storeBaseFromURL, shouldCookieRibbonBeShown, loginResponse) => {
  CookiesManager.setCookie({key: storefrontCookies.token, value: themeContext.get('securityToken')})
  CookiesManager.setCookie({key: storefrontCookies.storeID, value: themeContext.get('storeID')})
  CookiesManager.setCookie({key: storefrontCookies.storeBaseURL, value: storeBaseFromURL})
  CookiesManager.setCookie({key: storefrontCookies.cookieRibbonNotShownYet, value: shouldCookieRibbonBeShown})
  // need to save the user ID to the cookie, so that if he closes the browser and reopens he wont lose his data.
  CookiesManager.setCookie({
    key: storefrontCookies.userID,
    value: loginResponse.UserID,
    days: USER_ID_EXPIRATION_DAYS
  })
}

export const saveInfoFromApi = (loginResponse) => {
  // save info from API to context and cookie
  themeContext.set('storeBaseURL', undefined)
  themeContext.set('securityToken', loginResponse.Token.Token)
  themeContext.set('storeID', loginResponse.StoreID)
  themeContext.set('userID', loginResponse.UserID)
}

export const redirectToLegacy = (legacyURL) => {
  const {classicUrl} = themeContext.get()
  location.href = `${classicUrl}/${legacyURL}`

  return {}
}

export const redirectToFullURL = (newURL) => {
  location.href = newURL

}

export const loginByUrl = async (storeBaseFromURL, shouldCookieRibbonBeShown) => {
  const url = location.href | ''
  const publicRuntimeConfig = getNextConfig()
  const loginResponse = await loginByUrlCall(publicRuntimeConfig, url)
  if (loginResponse) {
    saveInfoFromApi(loginResponse)
    setCookies(storeBaseFromURL, shouldCookieRibbonBeShown, loginResponse)

    // raise the showRibbon flag, so if not redirecting to logout, NG will show the cookie ribbon.
    UStoreProvider.state.customState.set('showCookieRibbon', JSON.parse(shouldCookieRibbonBeShown))

    if (returnToUrl(loginResponse)) {
      location.reload()
    }
  }
}

export const redirectToLogout = async () => {
  const {securityToken, storeFriendlyID, storeID, languageCode, logoutUrl} = themeContext.get()
  const storeType = UStoreProvider && UStoreProvider.state.get().currentStore && UStoreProvider.state.get().currentStore.StoreType
  CookiesManager.deleteCookie(storefrontCookies.token)

  if (storeType === 3 && logoutUrl) {
    redirectToFullURL(decodeURIComponent(logoutUrl))
  } else if (!storeType || storeType === 2) {
    const res = getBaseUrlComponents(location.href)
    if (!res) return

    const {storeBaseURL: storeBaseFromURL} = res
    let shouldCookieRibbonBeShown = CookiesManager.getCookie(storefrontCookies.cookieRibbonNotShownYet) || ' true'

    await loginByUrl(storeBaseFromURL, shouldCookieRibbonBeShown)
  } else {
    redirectToLegacy(`logout.aspx?SecurityToken=${securityToken}&StoreGuid=${storeID}&storeid=${storeFriendlyID}ShowRibbon=false&forceLogin=true&NgLanguageCode=${languageCode}`)
  }
}

const redirectToLoginPage = () => {
  const { storeID, languageCode} = themeContext.get()
  redirectToLegacy(`login.aspx?StoreGuid=${storeID}&NgLanguageCode=${languageCode}ShowRibbon=false&forceLogin=true`)
}


