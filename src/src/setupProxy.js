const {resolve, join} = require('path')
const spawn = require('cross-spawn')
const {globSync} = require('glob')
const clc = require('cli-color')
const express = require('express')
const httpProxy = require('express-http-proxy')
const fs = require('fs')
const fetch = require('node-fetch')
const xmpieBuild = fs.existsSync('./.xmpie')
const { v4: uuidv4 } = require('uuid')
const { $assets, assetPrefix } = require(`../dev.config.js`)

const { getLocalWidgetsConfig, getWidgetsConfiguration, getLocalDevWidgetIds, getWidgetsConfig } = require('./widgetsProxyHelpers.js')

const argv = (str) => {
  const idx = process.argv.findIndex((a) => a.startsWith(str))
  if (idx > -1) {
    return process.argv[idx].substring(str.length + 1)
  }
  return null
}

const ducBuild = argv('ducbuild')
const ducsPath = ducBuild && resolve(ducBuild === '1' ? '../ducs' : ducBuild)
const securedServer = argv('server').startsWith('https://')

const ducsConfig = {
  root: ducsPath,
  dist_dev: ducBuild && join(ducsPath, 'dist_dev')
}

const widgetbuild = argv('widgetbuild')
const widgetsPath = widgetbuild && resolve(widgetbuild === '1' ? '../widgets' : widgetbuild)

const widgetsConfig = {
  root: widgetsPath,
  dist_dev: widgetbuild && join(widgetsPath, 'build')
}

const uStoreServerUrl = argv('server') || 'http://uStoreNG.xmpie.net'

const proxyDirectories = ['/ustore', '/uStore','/uStoreThemes/Global', '/uStoreThemeCustomizations', '/uStoreConnect']

if (!securedServer) {
  proxyDirectories.push('/uStoreRestAPI')
}

const getDucs = async () => {
  const res = await fetch(`${uStoreServerUrl.startsWith('http') ? '' : 'http://'}${uStoreServerUrl}/uStoreRestAPI/v1/system/properties/form/widgets`)
  return res.text()
}

const makeHttpProxy = (base) => httpProxy(`${uStoreServerUrl}`,
  {
    https: securedServer,
    proxyReqPathResolver: (req) => base + req.url,
    limit: '5mb',
  }
)

// Spins a process for compiling the DUC project.
if (ducBuild) {
  console.log(clc.green('Start DUC build process'))
  const npm = spawn('npm', ['--prefix', ducsConfig.root, 'start'])
  npm.stdout.on('data', (data) => {
    console.log(data.toString())
  })
  npm.stderr.on('data', (data) => {
    if (`${data}`.startsWith('[BABEL] Note: ')) {
      console.log(clc.gray(data))
    } else {
      console.log(clc.red(data))
    }
  });
  ['beforeExit', 'exit'].forEach(eventName => process.on(eventName, () => npm.kill(-9)))
}

// Spins a process for compiling the Widgets project.
if (widgetbuild) {
  console.log(clc.green('Start Widgets build process'))
  const npm = spawn('npm',  ['run', '--prefix', widgetsConfig.root, 'start:dev'], { env: process.env, PATH: process.env.PATH })
  npm.stdout.on('data', (data) => {
    console.log(data.toString())
  })
  npm.stderr.on('data', (data) => {
    if (`${data}`.startsWith('[BABEL] Note: ')) {
      console.log(clc.gray(data))
    } else {
      console.log(clc.red(data))
    }
  });
  ['beforeExit', 'exit'].forEach(eventName => process.on(eventName, () => npm.kill(-9)))
}

module.exports = function(app) {
  if (argv('wc')) {
    app.use('/static/media', httpProxy(`localhost:3002`,
      {
        proxyReqPathResolver: (req) => `/static/media${req.url}`,
        limit: '5mb',
      }))
  }
  //serve static files from the out directory
  app.use(`${assetPrefix}/assets`, express.static($assets))
  app.use(`${assetPrefix}/static`, express.static(join(__dirname, '/static')))
  app.use(`${assetPrefix}/static-internal`, express.static(join(__dirname, '/ustore-internal/static')))
  app.use(`${assetPrefix}/webcomponents`, express.static(join(__dirname, './webcomponents')))
  app.use(`${assetPrefix}/manifest.json`, express.static(join(__dirname, '../public/manifest.json')))
  app.use(`${assetPrefix}/sso.html`, express.static(join(__dirname, '../public/sso.html')))
  app.use(`${assetPrefix}/connect.html`, express.static(join(__dirname, '../public/connect.html')))
  if (ducBuild) {
    app.use('/ducs', express.static(ducsConfig.dist_dev))
    app.use('/uStoreRestAPI/v1/system/properties/form/widgets', async (req, res) => {
      const dirs = fs.readdirSync(ducsConfig.dist_dev)
      const ducs = dirs.filter(dir => dir !== 'Sample' || !xmpieBuild).map(dir => ({name: dir, baseUrl: `/ducs/${dir}`}))
      if (xmpieBuild) {
        res.send(`var xmpie_uStore_DUCs = ${JSON.stringify(ducs)}`)
      } else {
        const widgetScript = await getDucs()
        res.send(`${widgetScript}; xmpie_uStore_DUCs = [...xmpie_uStore_DUCs, ...${JSON.stringify(ducs)}];`)
      }
    })
  }
  if (widgetbuild) {
    try {
      const localWidgetsDirs = globSync('**/config.json', { cwd: widgetsConfig.root, ignore: ['**/node_modules/**', '**/build/**', '**/dist_dev/**'] })
      const localWidgetsList = localWidgetsDirs.map(dir => dir.replace(/[\/\\]config\.json$/, ''))
      const localWidgetsIds = getLocalDevWidgetIds(localWidgetsList)
      app.use('/widgets', express.static(join(widgetsConfig.dist_dev, 'dist_dev')))
      app.use('/uStoreThemeCustomizations/:id/Published/Widgets/widgetConfig.js', async (req, res) => {
        const localWidgetsConfig = getLocalWidgetsConfig(localWidgetsDirs)
        const widgetsConfigurations = await getWidgetsConfiguration(uStoreServerUrl, req.params.id)
        const window = {}
        // eslint-disable-next-line no-eval
        eval(widgetsConfigurations)
        localWidgetsIds.forEach((widgetId, widgetName) => {
          const localWidgetConfig = localWidgetsConfig.find(widget => widget.uniqueIdentifier === widgetName) || ''
          const buff = Buffer.from(localWidgetConfig.defaultConfiguration, 'utf-8');
          window.uStoreWidgetsConfiguration[widgetId] = buff.toString('base64')
        })
        let config = 'window.uStoreWidgetsConfiguration = window.uStoreWidgetsConfiguration || {};'
        Object.entries(window.uStoreWidgetsConfiguration).forEach(([key, value]) => {
          config += `window.uStoreWidgetsConfiguration['${key}'] = '${value}';`
        });
        res.set('Content-Type', 'application/x-javascript')
        res.send(config)
      })
      app.use('/uStoreRestAPI/v1/store/resourceByUrl', async (req, res, next) => {
        // Request for resource type 6 is the request for widgets config.
        if (req.query.type === '6') {
          const { configurationUrl, definitions, instances } = await getWidgetsConfig(argv, uStoreServerUrl, localWidgetsDirs, localWidgetsList, localWidgetsIds, req.query.url, req.query.cultureCode)
          res.set('Content-Type', 'application/x-javascript')
          res.send(`var xmpie_uStore_widgets = { configurationUrl: '${configurationUrl}', definitions: ${JSON.stringify(definitions)}, instances: ${JSON.stringify(instances)} }`)
        } else {
          next()
        }
      })
    } catch (e) {
      console.log(clc.red(e))
    }
  }
  proxyDirectories.forEach(p => app.use(p, makeHttpProxy(p)))
};
