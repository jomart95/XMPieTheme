import {
  queryOrCookieStrToObj, extractPathParams
} from '$ustoreinternal/services/utils'
import {getRoutes} from '$routes'
import { USER_ID_EXPIRATION_DAYS } from '$ustoreinternal/services/initialLoad'
import { CookiesManager, storefrontCookies } from '$ustoreinternal/services/cookies'
import location from '$ustoreinternal/services/locationProvider'
import { UStoreProvider } from '@ustore/core'
import { getConfig } from '../../ui.config'

const { publicRuntimeConfig } = getConfig()

class ThemeContext {
  constructor() {
    this.context = { ...publicRuntimeConfig, ...{ page: 'home' } }
  }

  get(key) {
    return key ? this.context[key] : this.context
  }

  set(key, value) {
    this.context[key] = value
  }

  deleteKey(key) {
    delete this.context[key]
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
  }

  updateRouteParams(params) {
    if (process.env.REACT_APP_WEB_COMPONENT) {
      if (params) {
        Object.keys(params).forEach((key) => {
          if (params[key] !== undefined && params[key] !== null) {
            this.set(key, params[key])
          }
        })
        return
      }
    }
    const asPath = location.pathname

    this.set('page', 'home')
    this.deleteKey('id')

    this.context = { ...this.context, ...extractPathParams(getRoutes(), asPath) }
  }

  // init the application context in the follow uses cases:
  // 1. in the client only from the query string
  // 2. in the client only from the cookies (cookies are using also inserted to the request header)
  init(params) {
    if (params) {
      if (params.languageCode) {
        this.context.languageCode = params.languageCode
      }
    }

    const searchStr = location.search.substring(1)

    if (searchStr) {
      const q = queryOrCookieStrToObj(searchStr)

      if (q.SecurityToken) {
        this.context.securityToken = q.SecurityToken
        CookiesManager.setCookie({ key: storefrontCookies.token, value: this.context.securityToken })
      }

      if (q.CultureCode) {
        this.context.languageCode = q.CultureCode
      }

      if (q.StoreGuid) {
        this.context.storeID = q.StoreGuid
        CookiesManager.setCookie({ key: storefrontCookies.storeID, value: this.context.storeID })
      }

      if (q.currencyFriendlyID) {
        this.context.currencyFriendlyID = q.currencyFriendlyID
      }

      if (q.UserID) {
        this.context.userID = q.UserID
        CookiesManager.setCookie({ key: storefrontCookies.userID, value: this.context.userID, days: USER_ID_EXPIRATION_DAYS })
      }

      if (q.ShowRibbon) {
        UStoreProvider.state.customState.set('showCookieRibbon', (q.ShowRibbon.toLowerCase() === 'true'))
        CookiesManager.setCookie({ key: storefrontCookies.cookieRibbonNotShownYet, value: q.ShowRibbon.toLowerCase() })
      }

      if (q.CurrencyID) {
        UStoreProvider.state.customState.set('currencyID', (q.CurrencyID))
        this.context.currencyID = q.CurrencyID
      }

      if (q.cartUrl) {
        UStoreProvider.state.customState.set('cartUrl', (q.cartUrl))
        this.context.cartUrl = q.cartUrl
        CookiesManager.setCookie({ key: storefrontCookies.cartUrl, value: q.cartUrl })
      }

      if (q.logoutUrl) {
        UStoreProvider.state.customState.set('logoutUrl', (q.logoutUrl))
        this.context.logoutUrl = q.logoutUrl
        CookiesManager.setCookie({ key: storefrontCookies.logoutUrl, value: q.logoutUrl })
      }
      if (q.SsoToken) {
        UStoreProvider.state.customState.set('ssoToken', q.SsoToken)
        this.context.ssoToken = q.SsoToken
      }
    }

    this.context.showThemeAsDraft =   CookiesManager.getCookie(storefrontCookies.showThemeAsDraft) || this.context.showThemeAsDraft
    this.context.securityToken =   CookiesManager.getCookie(storefrontCookies.token) || this.context.securityToken
    this.context.storeID =   CookiesManager.getCookie(storefrontCookies.storeID) || this.context.storeID
    this.context.currencyFriendlyID =   CookiesManager.getCookie(storefrontCookies.currencyID) || this.context.currencyFriendlyID
    this.context.userID =   CookiesManager.getCookie(storefrontCookies.userID) || this.context.userID

    this.context.CurrencyID =   CookiesManager.getCookie(storefrontCookies.currencyGUID) || this.context.CurrencyID
    this.context.cartUrl =   CookiesManager.getCookie(storefrontCookies.cartUrl) || this.context.cartUrl
    this.context.logoutUrl =   CookiesManager.getCookie(storefrontCookies.logoutUrl) || this.context.logoutUrl

    if (UStoreProvider.state.get() && UStoreProvider.state.get().currentUser) {
      this.context.userID = UStoreProvider.state.get().currentUser.ID
      CookiesManager.setCookie({ key: storefrontCookies.userID, value: this.context.userID, days: USER_ID_EXPIRATION_DAYS })
    }
    // analise the routes and extract the route variables (i.e ':page')
    if (process.env.REACT_APP_WEB_COMPONENT) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          this.set(key, params[key])
        }
      })
      return
    }
    const asPath = location.pathname
    this.context = {...this.context, ...extractPathParams(getRoutes(), asPath)}
  }
}

const themeContext = new ThemeContext()
export default themeContext
