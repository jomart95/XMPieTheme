import {getConfig} from '../../ui.config'
import {getRoutes} from '$routes'
import logger from './logger'
import { pathToRegexp } from 'path-to-regexp'
import location from './locationProvider'

export const extractPage = (asPath) => asPath.substring(1).split('/')[0]

export const dashToCamel = (str) => str.replace(/\W+(.)/g, (x, chr) => chr.toUpperCase())

export const camelToPascal = (str) => str.replace(/^([a-z])/, (x, chr) => chr.toUpperCase())

export const decodeStringForURL = (string) => string ? string.replace(new RegExp(' ', 'g'), '-') : ''

export const queryOrCookieStrToObj = (str, splitter) => {
  const res = {}

  if (str && str !== '') {
    const splitBy = splitter ? splitter : /[&;]\s?/g

    str
      .replace(/^(.*)\?/, '')
      .split(splitBy)
      .forEach(pair => {
        const [key, value] = pair.split(/=(.+)/)
        res[key] = value
      })
  }

  return res
}

export const getHeader = (req, key) => !!req && req.headers ? queryOrCookieStrToObj(req.headers.cookie, /[;]\s?/g)[key] : null

export const extractPathParams = (routesArray, asPath) => {
  const query = {}
  routesArray.forEach(r => {
    const pathParams = []
    const pathParamsRegex = pathToRegexp(r, pathParams)
    const params = pathParamsRegex.exec(asPath)

    if (pathParams && pathParams.length && params && params.length) {
      pathParams.forEach((p, i) => {
        query[p.name] = params[i + 1]
      })
    }
  })

  return query
}

export const createContext = () => {
  const asPath = location.href.replace(location.origin, '')
  const query = extractPathParams(getRoutes(), asPath)

  return {
    query: Object.assign(queryOrCookieStrToObj(location.search), query),
    asPath: asPath
  }
}

export const formatNumByLocale = (amount, locale) => {
  try {
    return amount && locale ? new Intl.NumberFormat(locale).format(amount) : amount
  } catch (error) {
    logger.error('Error on formatting number, defaulting to "en-US". Error: ' + error)
    return amount && locale ? new Intl.NumberFormat('en-US').format(amount) : amount
  }
}

export const formatDateByLocale = (date, locale) => {
  if (!date) {
    return date
  }
  const utcDate = new Date(date)
  const options = { month: 'long', day: '2-digit', year: 'numeric' }
  try {
    return date ? new Intl.DateTimeFormat(locale, options).format(utcDate) : date
  }
  catch (error) {
    logger.error('Error on formatting date, defaulting to "en-US". Error: ' + error)
    return new Intl.DateTimeFormat('en-US', options).format(utcDate)
  }
}

export const cleanPath = (p, assetPrefix) => p.replace(assetPrefix, '').substring(0, p.indexOf('?') > 0 ? p.indexOf('?') : p.length).replace(/#|\?.*$/, '')

export const getCurrentCulture = (context = {}) => context.CultureCode

export const getNextConfig = () => {
  const { publicRuntimeConfig } = getConfig() || {
    publicRuntimeConfig: {
      serverDomain: 'http',
      apiUrl: 'http',
      themeCustomizationUrl: 'http'
    }
  }
  const settingToFix = ['apiUrl', 'themeCustomizationUrl']
  let domain = publicRuntimeConfig.serverDomain
  domain = location.protocol + '//' +  location.hostname + (location.port !== '' ? ':' + location.port : '')
  const baseUrl = /(.*)(\/[a-z]{2}-[A-Za-z]{2})/.exec(location.pathname)
  publicRuntimeConfig.baseUrl = baseUrl && baseUrl.length > 1 ? baseUrl[1] : ''

  settingToFix.forEach(k => {
    if (!publicRuntimeConfig[k].startsWith('http')) {
      publicRuntimeConfig[k] = `${domain}${publicRuntimeConfig[k]}`
    }
  })

  return publicRuntimeConfig
}

export const getBaseUrlComponents = (url) => {
  const reg = url.toLowerCase().includes('ustorethemes')
    ? /(.*?\/ustorethemes\/.*?\/\d+)(\/[a-z]{2}-[a-z]+[?/]|$)/i
    : /(.*?)(\/[a-z]{2}-[a-z]+[?/]|$)/i

  const res = reg.exec(url)

  if (!res) {
    return null
  }

  const storeBaseURL = res[1]
  const assetsPrefix = storeBaseURL.replace(/(http|https):\/\/.*?([?/]|$)/i,'/')

  return {
    assetsPrefix: assetsPrefix.length === 1 ? '' : assetsPrefix,
    storeBaseURL,
    cultureCode: res[2].replace(/\//g, '')
  }
}

export const replaceCultureCodeInURL = (url, newCultureCode) => {
  const { storeBaseURL, cultureCode } = getBaseUrlComponents(url)
  console.log(url,'==>',newCultureCode,'=>',url.replace(`${storeBaseURL}${cultureCode}`, `${storeBaseURL}/${newCultureCode}/`))
  return url.replace(`${storeBaseURL}/${cultureCode}/`, `${storeBaseURL}/${newCultureCode}/`)
}
