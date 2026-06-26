const applyFeaturesConfig = require('../src/ustore-internal/scripts/applyFeaturesConfig.js')
applyFeaturesConfig()
require("./override-config")
require('../node_modules/react-scripts/scripts/start.js')
