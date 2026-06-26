import React from 'react'

import { t } from '$themelocalization'
import CrossCloseButton from './CrossCloseButton'
import './CookiesConsent.scss'

const CookiesConsent = ({ onCookiesPolicyClicked, onCloseCookiesConsentClicked }) => {
  const localizeCookiesConsent = () => {
    const localizationString = t('GdprRibbon.Cookies_consent')
    const stringArray = localizationString.split('%{0}')
    stringArray.splice(1, 0, <span onClick={onCookiesPolicyClicked} onKeyDown={(e)=> e.key === 'Enter' && onCookiesPolicyClicked(e)} key="content-policy" tabIndex="0">{t('GdprRibbon.Cookie_policy')}</span>)
    return stringArray
  }

  return (
    <>
      <div role="dialog" className="cookies-consent-container">
        <div className="cookies-consent-title">{t('GdprRibbon.This_website_uses_cookies')}<span style={{opacity:'0'}}>.</span></div>
        <div className="cookies-consent-description">
          {localizeCookiesConsent()}
        </div>
        <CrossCloseButton className="consent"  onPress={onCloseCookiesConsentClicked}/>
      </div>

    </>
  )
}

export default CookiesConsent
