const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const clc = require("cli-color")
const archiver = require('archiver')
const copyThemeAssets = require('./copyThemeAssets')
const compileSharedScss = require('./compileSharedScss')
const relpath = path.resolve.bind(path, __dirname)
const applyFeaturesConfig = require('./applyFeaturesConfig.js')

const { execCommandInTheme, userIncludedFile, parseVariables, utils } = require('./publish')
const themePackage = require(`../../../package.json`)
const CWD = relpath('../../../../')

const serverCssFileToTCompile = [
  {
    file: `./src/styles/fonts.scss`,
    outFile: 'fonts.css'
  },
  {
    file: `./src/styles/variables.scss`,
    outFile: 'variables.css'
  }
]

// commands to compile a library
const publishLib = async (themeName, themeDisplayName) => {
  const baseFolder = relpath('../../../../dist/')
  const newDistFolderLocation = path.resolve(CWD, 'src', 'dist')
  const themeDistFolder = `${baseFolder}/${themeName}`

  console.log(clc.green('cleaning old files'))
  fse.removeSync(baseFolder)
  fse.removeSync(newDistFolderLocation)

  console.log(clc.green(`change package.json customization section from variables.scss`))
  const configJsonWithParsedVars = await parseVariables(path.resolve(`./src/styles/variables.scss`), path.resolve('../config.json'), themeName, themeDisplayName)

  console.log(clc.green(`build library`))
  const commands = [`npm run build -- name=${themeName} displayName=${themeDisplayName}`,  'npm run publish:wc']
  for (const cmd of commands) {
    await execCommandInTheme(cmd)
  }

  copyThemeAssets()

  console.log('compiling shared css files')
  compileSharedScss(serverCssFileToTCompile, relpath(`../../../out/assets`))

  themePackage.name = themeName

  console.log(clc.green('copying files to destination folder'))
  userIncludedFile.forEach(d => {
    const { name, dest, ignore, rename } = utils.injectTheme(d, themeName)
    console.log(clc.green('copying'), name)

    fse.copySync(
      relpath('../../../../', name),
      path.resolve(baseFolder, themeName, dest, rename || name), {
        filter: (src, target) => ignore.reduce((r, m) => !r ? r : !src.replaceAll('\\', '/').includes(m), true)
      }
    )
  })

  console.log(clc.green('copying web component files'))
  fse.copySync(relpath('../../../out_wc/static'), `${CWD}/dist/${themeName}/src/out/static`, { recursive: true })

  console.log(clc.yellow('removing web component build folder', relpath('../../../out_wc')))
  fse.removeSync(relpath('../../../out_wc'))


  console.log(clc.green(`Zip theme directory ${baseFolder}/${themeName}.zip`))
  const output = fs.createWriteStream(`${baseFolder}/${themeName}.zip`)

  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  })

  archive.pipe(output)
  archive.glob(`**/**`, {cwd: `${CWD}/dist/${themeName}/`, dot: true})

  console.log(clc.green(`change dev.config.js assetPrefix value to theme name`))
  const devConfigContent = fs.readFileSync( './dev.config.js', 'utf8')
  const nextDevWithAssetPrefix = utils.changeAssetPrefix(themeName, devConfigContent )
  archive.append( nextDevWithAssetPrefix, {name: 'src/dev.config.js'})

  console.log(clc.green(`change ui.config.js assetPrefix value to theme name`))
  const uiConfigContent = fs.readFileSync( './src/ui.config.js', 'utf8')
  const uiWithAssetPrefix = utils.changeAssetPrefix(themeName, uiConfigContent )
  archive.append( uiWithAssetPrefix, { name: 'src/src/ui.config.js' })

  archive.append(configJsonWithParsedVars, { name: '/config.json' })
  archive.append(JSON.stringify(themePackage, null, '  '), { name: '/src/package.json' })

  await archive.finalize()

  console.log(clc.yellow('removing theme build folder', themeDistFolder))
  fse.removeSync(themeDistFolder)

  fse.move(baseFolder, newDistFolderLocation, function (err) {
    if (err) throw err
    console.log(clc.green('Successfully moved /dist folder from root to /src!'))
  })
}

const nameArg = utils.argv('name')
const displayNameArg = utils.argv('displayName')

if (nameArg || displayNameArg) {
  if (!nameArg) {
    console.error('Error: package name is required.\n')
    process.exit(1)
  }

  if (!/^[a-zA-Z0-9_]{0,20}$/.test(nameArg)) {
    console.error('Error: Package name field can contain up to 20 characters which includes letters, numbers and underscore.\n')
    process.exit(1)
  }

  if (!displayNameArg) {
    console.error('Error: displayName parameter is required.\n')
    process.exit(1)
  }

  applyFeaturesConfig(nameArg)
  publishLib(nameArg, displayNameArg)
} else {
  console.error('Error: Both name and display name arguments are required')
}
