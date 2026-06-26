import { queryOrCookieStrToObj } from "./utils"
import location from './locationProvider'

export const storefrontCookies = {
    storeBaseURL: '_storeBaseURL',
    token: '_token',
    storeID: '_storeID',
    userID: '_userID',
    cartUrl: '_cartUrl',
    logoutUrl: '_logoutUrl',
    language: '_language',
    currencyID: '_currencyID',
    currencyGUID: '_currencyGUID',
    cookieRibbonNotShownYet: '_cookieRibbonNotShownYet',
    showThemeAsDraft: '_showThemeAsDraft'
}

export class CookiesManager {
    static _cookieType = {
        StrictlyNecessary: "T001",
        Preferences: "T002",
    }

    static _cookiePermission = {
        [this._cookieType.StrictlyNecessary]: true,
        [this._cookieType.Preferences]: true
    }

    static _strictlyNecessaryStorefrontCookies = [
        storefrontCookies.token,
        storefrontCookies.storeBaseURL,
        storefrontCookies.logoutUrl,
        storefrontCookies.cartUrl,
        storefrontCookies.storeID,
        storefrontCookies.userID,
        storefrontCookies.cookieRibbonNotShownYet,
        storefrontCookies.showThemeAsDraft
    ]

    static _preferencesStorefrontCookies = [
        storefrontCookies.language,
        storefrontCookies.currencyID,
        storefrontCookies.currencyGUID
    ]

    static isCookieAllowed = (key) => {
        const isStrictlyNecessary = (key) => this._strictlyNecessaryStorefrontCookies.findIndex(v => key === v) !== -1
        if (isStrictlyNecessary(key) && this._cookiePermission[this._cookieType.StrictlyNecessary]) {
            return true
        }

        const isPreferences = (key) => this._preferencesStorefrontCookies.findIndex(v => key === v) !== -1
        return !!(isPreferences(key) && this._cookiePermission[this._cookieType.Preferences]);


    }

    // Private method for the internal usage
    static _setCookie = (key, value, days, path) => {
        if (key === storefrontCookies.token) {
            window.sessionStorage.setItem(key, value)
            return
        }
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = `; expires=${date.toUTCString()}`;
        }

        let sameSite = "";
        if (location.protocol === "https:" && location !== window.parent.location) {
            sameSite = "; SameSite=None; Secure";
        }

        document.cookie = `${key}=${value || ""}${expires}; path=${path || "/"}${sameSite}`;
    }

    static setCookie = (cookieData) => {
        const { key, value, days, path } = cookieData
        if (this.isCookieAllowed(key)) {
            this._setCookie(key, value, days, path);
        }
    }

    static getCookie = (key) => {
        if (key === storefrontCookies.token) {
            return window.sessionStorage.getItem(key)
        }
        return queryOrCookieStrToObj(document.cookie, /[;]\s?/g)[key]
    }

    static deleteCookie = (key) => {
        if (key === storefrontCookies.token) {
            window.sessionStorage.removeItem(key)
            return
        }
        const cookieIndex = Object.values(storefrontCookies).findIndex(cookieName => cookieName === key);
        if (cookieIndex === -1) {
            console.log('Warning! Be sure that you use `cookies` object to manage cookies')
        }

        document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/`;
    }
}

export const reactCookiesForRibbon = [
    {
        name: storefrontCookies.token,
        expiration: { units: 'GdprRibbon.SessionCookieType' },
        description: 'CookieDescription_auth'
    },
    {
        name: storefrontCookies.language,
        expiration: { amount: '30', units: 'lblDays' },
        description: 'CookieDescription_language'
    },
    {
        name: storefrontCookies.storeID,
        expiration: { units: 'GdprRibbon.SessionCookieType' },
        description: 'CookieDescription_storeID'
    },
    {
        name: storefrontCookies.currencyID,
        expiration: { amount: '30', units: 'lblDays' },
        description: 'CookieDescription_currency'
    },
    {
        name: storefrontCookies.currencyGUID,
        expiration: { amount: '30', units: 'lblDays' },
        description: 'CookieDescription_currency'
    },
    {
        name: storefrontCookies.userID,
        expiration: { amount: '30', units: 'lblDays' },
        description: 'CookieDescription_userID'
    },
    {
        name: storefrontCookies.cartUrl,
        expiration: { units: 'GdprRibbon.SessionCookieType' },
        description: 'CookieDescription_navigation'
    },
    {
        name: storefrontCookies.logoutUrl,
        expiration: { units: 'GdprRibbon.SessionCookieType' },
        description: 'CookieDescription_navigation'
    },
    {
        name: storefrontCookies.storeBaseURL,
        expiration: { units: 'GdprRibbon.SessionCookieType' },
        description: 'CookieDescription_storeBaseURL'
    },
    {
        name: storefrontCookies.cookieRibbonNotShownYet,
        expiration: { units: 'GdprRibbon.SessionCookieType' },
        description: 'CookieDescription_cookieRibbonNotShownYet'
    },
    {
        name: storefrontCookies.showThemeAsDraft,
        expiration: { units: 'GdprRibbon.SessionCookieType' },
        description: 'CookieDescription_showThemeAsDraft'
    }
]

export const legacyCookiesForRibbon = [
    { name: 'LogoutURL', expiration: { units: 'GdprRibbon.SessionCookieType' }, description: 'CookieDescription_navigation' },
    {
        name: 'XXX_S_CustomerID',
        expiration: { amount: '30', units: 'lblDays' },
        description: 'CookieDescription_CustomerID'
    },
    {
        name: 'cultureID',
        expiration: { amount: '30', units: 'lblDays' },
        description: 'CookieDescription_language'
    },
    {
        name: 'CurrencyID',
        expiration: { amount: '30', units: 'lblDays' },
        description: 'CookieDescription_currency'
    },
    {
        name: 'sID',
        expiration: { units: 'GdprRibbon.SessionCookieType' },
        description: 'CookieDescription_storeID'
    },
    {
        name: 'encryptedOrderProductId',
        expiration: { units: 'GdprRibbon.SessionCookieType' },
        description: 'CookieDescription_encryptedOrderProductId'
    },
    {
        name: 'uStoreCustomerApp',
        expiration: { units: 'GdprRibbon.SessionCookieType' },
        description: 'CookieDescription_uStoreCustomerApp'
    },
    {
        name: 'ASP.NET_SessionID',
        expiration: { units: 'GdprRibbon.SessionCookieType' },
        description: 'CookieDescription_SessionID'
    },
    {
        name: '__AntiXsrfToken',
        expiration: { units: 'GdprRibbon.SessionCookieType' },
        description: 'CookieDescription_AntiXsrfToken'
    },
    {
        name: 'XXX_S_RegisteredCustomerID',
        expiration: { units: 'GdprRibbon.SessionCookieType' },
        description: 'CookieDescription_CustomerID'
    },
    {
        name: 'uStoreCustomerApp_SameSite',
        expiration: { units: 'GdprRibbon.SessionCookieType' },
        description: 'CookieDescription_SameSite'
    },
]

export const getCookiesForRibbon = (cookiesData = {
    initial: legacyCookiesForRibbon,
    additional: reactCookiesForRibbon
}) => {
    const { initial, additional } = cookiesData
    return initial
        ? additional
            ? [...initial, ...additional]
            : [...initial]
        : []
}
