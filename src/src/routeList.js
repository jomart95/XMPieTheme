import location from '$ustoreinternal/services/locationProvider'
const USTORE_THEME_PREFIX = 'ustorethemes'

export function getRoutes() {
  let assetPrefix = ''
  let exec = null
  if (location.pathname.toLowerCase().includes(USTORE_THEME_PREFIX)) {
    exec = (/(.*?\/ustorethemes\/.*?)\//i).exec(location.pathname)
    assetPrefix = exec?.[1] ?? ''
  } else {
    exec = (/(^.*)\/[a-z]{2}-[a-z]{2}(\/)(.*)$/i).exec(location.pathname)
    assetPrefix = exec?.[1] ?? ''
    if (!exec) {
      exec = (/(^.*)\/[a-z]{2}-[a-z]{2}$/i).exec(location.pathname)
      if (exec?.[1] === '') {
        assetPrefix = ''
      }
    } else {
      assetPrefix = exec?.[1] ?? ''
    }
  }

  return assetPrefix.toLowerCase().includes(USTORE_THEME_PREFIX) ?
    [
      '',
      '/',
      `${assetPrefix}/:storeFriendlyID/:languageCode`,
      `${assetPrefix}/:storeFriendlyID/:languageCode/:page`,
      `${assetPrefix}/:storeFriendlyID/:languageCode/:page/:id`,
      `${assetPrefix}/:storeFriendlyID/:languageCode/:page/:id/:name`,
    ]
    :
    [
      '',
      '/',
      `${assetPrefix}/:languageCode`,
      `${assetPrefix}/:languageCode/:page`,
      `${assetPrefix}/:languageCode/:page/:id`,
      `${assetPrefix}/:languageCode/:page/:id/:name`,
    ]
}

const routes = getRoutes()
export default routes

