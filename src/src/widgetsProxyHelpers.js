const fetch = require('node-fetch');
const {resolve} = require('path');
const fs = require('fs');
const clc = require('cli-color');
const {v4: uuidv4} = require('uuid');

const getWidgets = async (uStoreServerUrl, url, cultureCode) => {
    const res = await fetch(`${uStoreServerUrl.startsWith('http') ? '' : 'http://'}${uStoreServerUrl}/uStoreRestAPI/v1/store/resourceByUrl?url=${url}&type=6&cultureCode=${cultureCode}&isDraft=false`)
    return res.text()
}

const getWidgetsConfiguration = async (uStoreServerUrl, id) => {
    const res = await fetch(`${uStoreServerUrl.startsWith('http') ? '' : 'http://'}${uStoreServerUrl}/uStoreThemeCustomizations/${id}/Published/Widgets/widgetConfig.js`)
    return res.text()
}

const getDevJsonWidgetsConfig = (argv) => {
    const jsonArgv = argv('json')
    let config = {}
    const jsonPath = jsonArgv
    if (jsonPath) {
        const jsonPathResolved = resolve('../widgets', jsonPath)
        if (fs.existsSync(jsonPathResolved)) {
            config = JSON.parse(fs.readFileSync(jsonPathResolved, 'utf8'))
        } else {
            console.log(clc.red(`File ${jsonPathResolved} not found`))
        }
    }

    return config
}

const getDevParamsWidgetsConfig = (argv, widgetNames) => widgetNames.reduce((acc, widgetName) => {
    if (argv(widgetName)) {
        return {
            ...acc,
            [widgetName]: argv(widgetName)
        }
    } else {
        return acc
    }
}, {})

/**
 * Get widgets config from json file and/or command line params
 * If json config exists, it will take location config from there
 * If cli params exist together with json file, cli params will override json config
 * If no json config, cli params must be provided
 */
const getDevWidgetsConfig = async (argv, widgetNames) => {
    try {
        const jsonWidgetConfig = getDevJsonWidgetsConfig(argv)
        if (Object.keys(jsonWidgetConfig).length) {
            const widgetNames = Object.keys(jsonWidgetConfig)
            return {...jsonWidgetConfig, ...getDevParamsWidgetsConfig(argv, widgetNames)}
        } else {
            return getDevParamsWidgetsConfig(argv, widgetNames)
        }
    } catch (e) {
        console.log(clc.red(e))
    }
}

const getLocalWidgetsConfig = (localWidgetsDirs) => localWidgetsDirs.map((localWidgetsDir) => {
    if (!fs.existsSync(resolve('../widgets', localWidgetsDir))) {
        console.log(clc.red(`File ${localWidgetsDir} not found`))
        process.exit(1)
        return null
    }
    const localWidgetsConfig = fs.readFileSync(resolve('../widgets', localWidgetsDir), 'utf8')
    return JSON.parse(localWidgetsConfig)
})

const getLocalDevWidgetIds = (localDevWidgetsList) => {
    const localWidgetsIds = new Map()
    localDevWidgetsList.forEach(widget => {
        localWidgetsIds.set(widget, uuidv4())
    })
    return localWidgetsIds
}

const getWidgetsConfig = async (argv, uStoreServerUrl, localWidgetsDirs, localWidgetsList, localWidgetsIds, url, cultureCode) => {
    const widgetsRemoteConfig = await getWidgets(uStoreServerUrl, url, cultureCode) // get widgets config from uStore server as text
    const widgetsRemoteConfigJson = JSON.parse(widgetsRemoteConfig.replace('var xmpie_uStore_widgets = ', '')) // parse widgets config from uStore server as json
    const localWidgetsLocationConfig = await getDevWidgetsConfig(argv, localWidgetsList)
    const localWidgetsConfig = getLocalWidgetsConfig(localWidgetsDirs)
    const remoteWidgetsList = widgetsRemoteConfigJson.definitions.map(widget => widget.name)
    const fullWidgetsList = [...new Set([...remoteWidgetsList, ...localWidgetsList])]
    const arrLocalWidgetsLocationConfig = Object.entries(localWidgetsLocationConfig);
    const remoteWidgetConfig = widgetsRemoteConfigJson.instances.filter((widget) => fullWidgetsList.includes(widget.name));

    const findMissingWidgets = () => {
      // I use only widgetsRemoteConfigJson because we add existing widgets to widgets-slot-config.json
      // which have configs. We won't add widgets which are not in the widgets folders
      return fullWidgetsList.filter(existingWidget => !widgetsRemoteConfigJson.instances.some(
        (widgetRemoteConfig) => widgetRemoteConfig.name === existingWidget)
      );
    };

    const definitions = fullWidgetsList.map(widgetName => {
          return ({
              name: widgetName,
              baseUrl: localWidgetsConfig.find(widget => widget.uniqueIdentifier === widgetName) ? `/widgets/${widgetName}` : widgetsRemoteConfigJson.definitions.find(widget => widget.name === widgetName).baseUrl,
              modifiedDate: localWidgetsConfig.find(widget => widget.uniqueIdentifier === widgetName) ? new Date().toISOString() : widgetsRemoteConfigJson.definitions.find(widget => widget.name === widgetName).modifiedDate,
          })
      }
    )

    const instances = arrLocalWidgetsLocationConfig.length > 0
      ? arrLocalWidgetsLocationConfig.flatMap(([location, widgets]) =>
        widgets.map((widgetName) => ({
            id: localWidgetsIds.get(widgetName),
            name: widgetName,
            location,
        }))
      )
      : remoteWidgetConfig.length > 0
        ? remoteWidgetConfig
        : [];

    if ( instances.length === 0 ) {
        const missingWidgets = findMissingWidgets();
        console.log(clc.red(`Widget(s) ${missingWidgets.join(', ')} wasn't/weren't found in the widgets config`));
        process.exit(1);
    }

    return {
        configurationUrl: widgetsRemoteConfigJson.configurationUrl,
        definitions,
        instances,
    }
}

module.exports = {
    getLocalWidgetsConfig,
    getWidgetsConfiguration,
    getLocalDevWidgetIds,
    getWidgetsConfig
}