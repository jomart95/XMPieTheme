export const getConfig = () => ({
  publicRuntimeConfig: {
    assetPrefix: window.uStoreConfig?.assetPrefix || '/ustorethemes/AquaBlue',
    apiUrl: `${window.uStoreConfig?.uStoreRemoteServerUrl}/uStoreRestAPI`,
    classicUrl: '/ustore',
    themeCustomizationUrl: '/uStoreThemeCustomizations',
    serverDomain: window.uStoreConfig?.uStoreRemoteServerUrl
  }
})
