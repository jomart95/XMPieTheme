import { UStoreProvider } from '@ustore/core'

export const prependServerDomain = (url) => {
  if (!process.env.REACT_APP_WEB_COMPONENT) {
    return url
  }
  if (url.startsWith('http')) {
    return url
  }
  const sep = url.startsWith('/') ? '' : '/'
  return `${UStoreProvider.configService.config.serverDomain}${sep}${url}`
}


export const prependThemePath = (url) => {
  if (process.env.REACT_APP_WEB_COMPONENT) {
    if (url.startsWith(UStoreProvider.configService.config.baseUrl)) {
      return url
    }
   return `${UStoreProvider.configService.config.baseUrl}${url}`
  }
  return url
}

export const prependAssetsPath = (url) => {
  if (process.env.REACT_APP_WEB_COMPONENT &&
    url.indexOf('static/media') !== -1 &&
    url.indexOf(UStoreProvider.configService.config.assetPrefix) === -1
  ) {
    return `${UStoreProvider.configService.config.assetPrefix}${url}`
  }
  return url
}

