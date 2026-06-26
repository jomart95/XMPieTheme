import { UStoreProvider } from '@ustore/core'
import legacyIframeHandler from '$ustoreinternal/services/legacyIframeHandler'
import themeContext from '$ustoreinternal/services/themeContext'
import { CookiesManager, storefrontCookies } from '$ustoreinternal/services/cookies'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import location from '$ustoreinternal/services/locationProvider'
import {ScriptLoader} from '$themeservices'


export const switchCurrency= (selectedCurrency) => {
  UStoreProvider.state.culture.setCurrentCurrency(selectedCurrency)
  themeContext.set('currencyFriendlyID', selectedCurrency.FriendlyID)
  CookiesManager.setCookie({ key: storefrontCookies.currencyID, value: selectedCurrency.FriendlyID, days: 30 })
  CookiesManager.setCookie({ key: storefrontCookies.currencyGUID, value: selectedCurrency.ID, days: 30 })
  legacyIframeHandler.postMessage({
    type: '@CHANGE_CURRENCY',
    data: selectedCurrency.FriendlyID
  })

}

export const switchCulture = async (selectedCulture, params, navigate, rootElement) => {
  const newURL = urlGenerator.get({
    ...params,
    languageCode: selectedCulture.LanguageCode
  })
  if (process.env.REACT_APP_WEB_COMPONENT) {
    const script = new ScriptLoader({
      src: `${location.origin}/uStoreRestAPI/v1/store/resourceByUrl?url=${encodeURIComponent(location.origin + newURL)}&type=1&cultureCode=${selectedCulture.LanguageCode}&isDraft=false`,
      global: 'body'
    })
    await script.load()
    await UStoreProvider.state.culture.setCurrentCultureByLanguage(selectedCulture.LanguageCode)
    location.replace(location.origin + newURL + location.search + location.hash)
    navigate(newURL, {reload: true})
    return
  }
  location.replace(newURL+ location.search + location.hash)
}

export const getMobileMenuItems = (categoriesTree, cultures, currencies, currentCurrency, currentCulture) =>{

  const convertCategories = (categories, parent, depth) => {
    return categories.map((category) => {
      const id = `${!depth ? 'T' : ''}CT_${category.Category.FriendlyID}`
      const item = {
        id,
        value: id,
        name: category.Category.Name,
        parent,
        depth,
        hasProducts: category.Category.HasProducts
      }
      item.children = category ? convertCategories(category.SubCategories, item, depth + 1) : []
      return item
    })
  }

  const menuTree = []
  if (currencies) {
    menuTree.push({
      id: `TCR_${currentCurrency.ID}`,
      name: currentCurrency.Code,
      value: `TCR_${currentCurrency.ID}`,
      parent: null,
      depth: 0,
      sign: currentCurrency.Symbol,
      children: currencies?.map((model) => {
        const { ID, Symbol, Code } = model
        return ({
          id: `CR_${ID}`, sign: Symbol, name: Code, value: `CR_${ID}`, parent: menuTree, children: [], depth: 1, model
        })
      })
    })
  }

  if (cultures) {
    menuTree.push({
      id: `TCL_${currentCulture.ID}`,
      name: currentCulture.Name,
      value: `TCL_${currentCulture.ID}`,
      icon: `${currentCulture.CountryCode}.svg`,
      parent: null,
      depth: 0,
      children: cultures?.map((model) => {
        const { LanguageCode, CountryCode, Name } = model
        return ({
          id: `CL_${LanguageCode}`,
          icon: `${CountryCode}.svg`,
          name: Name,
          value: `CL_${LanguageCode}`,
          parent: menuTree,
          children: [],
          depth: 1,
          model,
        })
      })
    })
  }

  if (categoriesTree) {
    menuTree.push(...convertCategories(categoriesTree, menuTree, 0))
  }

  return [{
    id: 'menu',
    value: 'menu',
    children: menuTree
  }]
}
