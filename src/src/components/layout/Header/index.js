import React, { useEffect, useState, useRef } from 'react'
import { Icon, LinkAria, ButtonAria } from '$core-components'
import { getVariableValue } from '$ustoreinternal/services/cssVariables'
import themeContext from '$ustoreinternal/services/themeContext'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import { Slot } from '$core-components'
import { CultureSwitcher, CurrencySwitcher, ProfileSwitcher } from './switchers'
import Cart from './Cart'
import CategoriesNavbar from './CategoriesNavbar'
import { MobileMenu } from './MobileMenu'
import Search from './Search'
import theme from '$styles/theme'
import './Header.scss'

const getCartUrl = (currentStore) => {
  const { cartUrl } = themeContext.get()
  return (currentStore && currentStore.StoreType === 3 && cartUrl) ? cartUrl : ''
}

const Header = ({ customState, currencies, cultures, currentCulture, currentUser, currentCurrency, currentStore }) => {
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false)
  const [connectCartUrl, setConnectCartUrl] = useState(getCartUrl(currentStore))
  const searchButtonRef = useRef()

  useEffect(() => {
    setConnectCartUrl(getCartUrl(currentStore))
  }, [currentStore])

  if (!customState || !currentCulture || !currentCurrency) {
    return null
  }

  const { categoriesTree, userOrdersSummary } = customState

  const variableForLogoImg = window.matchMedia(`(min-width: ${theme.lg})`).matches ? '--logo-image' : '--logo-image-mobile'
  const currentLogo = getVariableValue(variableForLogoImg, require(`$assets/images/logo.png`), true)

  return (<div className="header">
      <Slot name="header_above"/>
      <div className="header-stripe">
        <div className="logo-wrapper">
          <MobileMenu {...{
            currentCulture,
            currentCurrency,
            currentUser,
            categoriesTree,
            userOrdersSummary,
            cultures,
            currencies,
          }} />
          <LinkAria to={urlGenerator.get({ page: 'home' })}>{currentLogo &&
            <img className="logo" src={currentLogo} alt="logo"/>}</LinkAria>
        </div>
        {categoriesTree?.length > 0 && <CategoriesNavbar categoriesTree={categoriesTree}/>}
        <Search className={mobileSearchVisible ? 'search-visible' : 'search-hidden'} onClose={() => {
          setMobileSearchVisible(false)
          searchButtonRef.current?.focus()
        }}/>
        <div className="right-icons">
          <ButtonAria className="header-mobile-search-button"
                  onPress={() => setMobileSearchVisible(!mobileSearchVisible)}
                  ref={searchButtonRef}
          >
            <Icon name="homepage_header_search_mobile.svg" width="20px" height="20px"/>
          </ButtonAria>
          <CultureSwitcher {...{ currentCulture, cultures }}/>
          <CurrencySwitcher {...{ currentCurrency, currencies }}/>
          {currentUser && <ProfileSwitcher {...{ currentUser, userOrdersSummary }}/>}
          <Cart connectCartUrl={connectCartUrl}/>
        </div>
      </div>
      <Slot name="header_below"/>
    </div>
  )
}

export default Header
