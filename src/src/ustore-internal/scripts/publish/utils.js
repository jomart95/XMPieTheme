const injectTheme = (obj, themeName) => JSON.parse(JSON.stringify(obj).replaceAll('{themeName}', themeName))

const changeAssetPrefix = (themeName, fileContent) => fileContent
    .replaceAll('{{ASSET_PREFIX}}', themeName)
    .replace(/assetprefix\s*:\s*'\/ustorethemes\/(.*)/igm, `assetPrefix: '/ustorethemes/${themeName}',`)

const argv = (str) => {
  const idx = process.argv.findIndex((a) => a.startsWith(str))
  if (idx > -1) {
    return process.argv[idx].substring(str.length + 1)
  }
  return null
}

const covertEnvVarsToObj = (data) => {
  return data.split(/\r?\n/)
      .map(item => {
        if (item) {
          const splittedArray = item.split('=')
          return {
            [splittedArray[0]]: splittedArray[1]
          }
        }
        return null
      })
      .reduce((previousValue, currentValue) => ({...previousValue, ...currentValue}), {})
}

const convertObjToEnv = (data) => {
  return Object.entries(data).map(item => `${item[0]}=${item[1]}`).toString().replace(/,/g, '\n')
}

module.exports = {
  injectTheme,
  changeAssetPrefix,
  argv,
  covertEnvVarsToObj,
  convertObjToEnv
}
