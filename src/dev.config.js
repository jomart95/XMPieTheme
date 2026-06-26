const path = require('path')
const relpath = path.join.bind(path, __dirname)

module.exports = {
  assetPrefix: '/ustorethemes/McFaddinBase',
  apiUrl: '/uStoreRestAPI',
  classicUrl: '/ustore',
  themeCustomizationUrl: '/uStoreThemeCustomizations',
  serverDomain: 'http://localhost:3000',
  buildType: process.env.BUILD_TYPE,
  '$styles': relpath('./src/styles'),
  '$themepages': relpath('./src/routes'),
  '$themelocalization': relpath(`./src/localizations`),
  '$assets': relpath('./src/assets'),
  '$ustoreinternal': relpath(`/src/ustore-internal`),
  '$themeservices':  relpath(`/src/services`),
  '$themehooks':  relpath(`/src/hooks`),
  '$core-components': relpath(`./src/core-components`),
  '$routes': relpath('./src/routeList.js'),
  '$features': relpath(`./src/features.json`),
  'includeCssPaths': [relpath(`./src/styles`)]
}
