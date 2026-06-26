const fs = require('fs')
const path = require('path')
const rpath = path.join.bind(path, __dirname)
const theme = process.env.THEME_PAGES || 'AquaBlue'
const {utils} = require("./publish")

const includes = (str, name) => {
  const re = new RegExp(`${name}$`, 'g')
  return re.test(str)
}

const applyFeaturesConfig = (nameArg = null) => {
  const xmpieBuild = fs.existsSync(rpath('../../../.xmpie'))
  const dotEnvExists = fs.existsSync(rpath('../../../.env'))

  const {
    name: configName,
    features
  } = require(rpath(xmpieBuild ? `../../${theme}/config.json` : '../../../../config.json'))
  const name = nameArg || configName

  const featuresFileName = xmpieBuild ? rpath(`../../${theme}/features.json`) : rpath(`../../features.json`)
  const dotEnvFileName = rpath('../../../.env')

  fs.writeFileSync(featuresFileName, JSON.stringify(features, null, '  '), {encoding: 'utf-8'})

  if (!xmpieBuild) {
    if (!dotEnvExists) {
      const dotEnvFileData = `REACT_APP_ASSET_PREFIX=/ustorethemes/${name} \nPORT=5000`
      fs.writeFileSync(dotEnvFileName, dotEnvFileData, {encoding: "utf-8"})
    } else {
      const data = fs.readFileSync(dotEnvFileName, "utf8",)
      const dotEnvObj = utils.covertEnvVarsToObj(data)

      if (!dotEnvObj.hasOwnProperty('REACT_APP_ASSET_PREFIX') || (dotEnvObj.hasOwnProperty('REACT_APP_ASSET_PREFIX') && !includes(dotEnvObj['REACT_APP_ASSET_PREFIX'], name))) {
        dotEnvObj['REACT_APP_ASSET_PREFIX'] = `/ustorethemes/${name}`
      }
      if (!dotEnvObj.hasOwnProperty('PORT') || (dotEnvObj.hasOwnProperty('PORT') && dotEnvObj['PORT'] !== '5000')) {
        dotEnvObj['PORT'] = '3000'
      }
      const envData = utils.convertObjToEnv(dotEnvObj)
      fs.writeFileSync(dotEnvFileName, envData, {encoding: "utf-8"})
    }
  }
}


module.exports = applyFeaturesConfig
