import React from 'react'

import { t } from '$themelocalization'
import CrossCloseButton from './CrossCloseButton'
import { getCookiesForRibbon } from '$ustoreinternal/services/cookies'
import location from '$ustoreinternal/services/locationProvider'
import './CookiesPolicy.scss'

const CookiesPolicy = ({ onCloseCookiesPolicyClicked }) => {
  return (
    <div className="cookies-policy-container">
      <CrossCloseButton className="policy"
        onPress={onCloseCookiesPolicyClicked}/>
      <div className="cookies-policy-title">{t('GdprRibbon.Cookie_policy')}</div>
      <div className="cookies-policy-description">
        <div className="cookies-explanation-title">
          {t('GdprRibbon.CookieExplanationHeader1')}
        </div>
        <div className="cookies-explanation-description">
          {t('GdprRibbon.CookieExplanationParagraph1_1')}
          <br/>
          {t('GdprRibbon.CookieExplanationParagraph1_2')}
        </div>
        <div className="cookies-necessary-title">
          {t('GdprRibbon.CookieExplanationHeader2')}
        </div>
        <div className="cookies-necessary-description">
          {t('GdprRibbon.CookieExplanationParagraph2_1')}
        </div>
        <div className="cookies-table-title">
          {t('GdprRibbon.Table_title')}
        </div>
        <div className="cookies-table">
          <table>
            <thead className="table-head">
              <tr className="cookie-row">
                <td><div>{t('lblName')}</div></td>
                <td><div>{t('lblDomain')}</div></td>
                <td><div>{t('lblExpiration')}</div></td>
                <td><div>{t('lblDescription')}</div></td>
              </tr>
            </thead>
            <tbody>
              {getCookiesForRibbon().map((cookie) => {
                const { name, expiration: { amount, units }, description } = cookie
                return (
                  <tr key={name} className="cookie-row">
                    <td><div>{name}</div></td>
                    <td><div>{location.hostname}</div></td>
                    <td><div>{amount && `${amount}`}{t(units)}</div></td>
                    <td><div>{t(description)}</div></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default CookiesPolicy
