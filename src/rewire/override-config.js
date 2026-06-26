process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const overrides = require('../config-overrides')
const webpackConfigPath = '../node_modules/react-scripts/config/webpack.config.js'
const webpackConfig = require(webpackConfigPath)
require.cache[require.resolve(webpackConfigPath)].exports = (env) => overrides(webpackConfig(env), env)
require(webpackConfigPath)
