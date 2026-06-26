if (process.argv.length <= 2 || (process.argv.indexOf('wc=1') > -1 && process.argv.length === 3)) {
    console.log('Applying features config...')
    const applyFeaturesConfig = require('../src/ustore-internal/scripts/applyFeaturesConfig.js')
    applyFeaturesConfig()
}
require('./override-config')
require('../node_modules/react-scripts/scripts/build.js')
