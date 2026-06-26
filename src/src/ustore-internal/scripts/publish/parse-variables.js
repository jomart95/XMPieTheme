const fse = require('fs-extra')

const parseVariables = async (variableFilePath, configFilePath, themeName, themeDisplayName) => {
  let variableFile = await fse.readFile(variableFilePath, 'utf8')
  //get the content of the curly braces
  variableFile = variableFile.match(/{([^}]*)}/)[1]
  //Eliminate comments
  variableFile = variableFile.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/g, '')
  //Eliminate \t\n\r
  variableFile = variableFile.replace(/[\r,\n,\t]/g, '')
  let variablesJson = {}
  variableFile.split(';').forEach((variable) => {
    const variableName = variable.split(':')[0]
    const variableValue = variable.split(':')[1]
    if (variableName && variableValue) {
      variablesJson[variableName] = variableValue.replace(/'/g, '').trim()
    }
  })
  const config = await fse.readJson(configFilePath)

  if (!config.customization) throw 'Customization section does not exists in config file'
  config.customization.variables = config.customization.variables.map((variable) => {
    variable.defaultValue = variablesJson[variable.cssVariableName] ? variablesJson[variable.cssVariableName] : variable.defaultValue
    return variable
  })

  config.name = themeName
  config.displayName = themeDisplayName

  return JSON.stringify(config, null, '  ')
}


module.exports = parseVariables
