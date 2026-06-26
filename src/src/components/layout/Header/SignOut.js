import './SignOut.scss'
import themeContext from '$ustoreinternal/services/themeContext'
import { t } from '$themelocalization'
import { UStoreProvider } from '@ustore/core'
import { storefrontCookies, CookiesManager } from '$ustoreinternal/services/cookies'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import {useNavigate} from 'react-router-dom'
import { useRef } from 'react'

const getAttribute = (name) => {
  return UStoreProvider.state.get().currentStore.Attributes.find(attr => attr.Name === name)?.Value
}

/**
 * This component represents the signout icon in the header
 * When clicking - the store redirects to the login page
 *
 * @param {object} currentUser - the current user connected to the store
 */
const SignOut = (props) => {
  const navigate = useNavigate()
  const connectEnterpriseLogoutURL = useRef(false)

  if (!props.currentUser) {
    return null
  }

  const { currentUser: { FirstName } } = props

  const { showThemeAsDraft, securityToken, storeID, classicUrl, languageCode, logoutUrl } = themeContext.get()
  const showRibbon = UStoreProvider.state.customState.get('showCookieRibbon')
  const deleteCookies = () => [storefrontCookies.token, storefrontCookies.storeID, storefrontCookies.language].forEach(cn => CookiesManager.deleteCookie(cn))
  const onLogoutClicked = () => {
    if (connectEnterpriseLogoutURL.current) {
      const connectEnterpriseLogoutURL = urlGenerator.get({page:'connect-logged-out'}) + `?message=${t('SignOut.LoggedOut')}`;
      deleteCookies()
      navigate(connectEnterpriseLogoutURL)
    } else {
      deleteCookies()
    }
  }

  const isDraft = showThemeAsDraft && showThemeAsDraft.toLowerCase() === 'true'

  const storeType = UStoreProvider && UStoreProvider.state && UStoreProvider.state.get().currentStore && UStoreProvider.state.get().currentStore.StoreType

  let sLogoutUrl = `${classicUrl}/logout.aspx?SecurityToken=${securityToken}&StoreGuid=${storeID}&NgLanguageCode=${languageCode}&ShowRibbon=${showRibbon}&forceLogin=true${isDraft ? '&showThemeAsDraft=true' : ''}`

  // uStore Connect
  if (storeType === 3 && logoutUrl) {
    sLogoutUrl = decodeURIComponent(logoutUrl)
  // uStore Connect Enterprise
  } else if (getAttribute('HomepageToCart') === 'True') {
    // eslint-disable-next-line
    sLogoutUrl = getAttribute('LogoutUrl') ? decodeURIComponent(getAttribute('LogoutUrl')) : 'javascript:void(0)'
    connectEnterpriseLogoutURL.current = true
  }

  return (
    <div className="signout">
      <div className="info">
        <div className="title">{t('Profile.My_Account')}</div>
        <div className="greeting truncate">{t('SignOut.Hello_Message', { FirstName })}</div>
      </div>
      <div className="btn-container d-flex align-items-center">
        <a onClick={onLogoutClicked} href={sLogoutUrl} className="button-secondary signout-button">{t('SignOut.SignOut')}</a>
      </div>
    </div>
  )
}
export default SignOut
