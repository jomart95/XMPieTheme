import './SignIn.scss'
import themeContext from '$ustoreinternal/services/themeContext'
import { CookiesManager, storefrontCookies } from '$ustoreinternal/services/cookies'
import { UStoreProvider } from '@ustore/core'
import { t } from '$themelocalization'
import { useEffect, useRef } from 'react'
import location from '$ustoreinternal/services/locationProvider'

const SignIn = ({ showTitle = true }) => {
  const signInRef = useRef(null)

  useEffect(() => {
    setTimeout(() => signInRef.current?.focus())
  },[])

  const goToUrl = () => {
    const { storeID, classicUrl, securityToken, storeFriendlyID, languageCode, userID, showThemeAsDraft } = themeContext.get()
    const showRibbon = UStoreProvider.state.customState.get('showCookieRibbon')

    const userIDfromStore = UStoreProvider.state.get().currentUser.ID

    const tempUserId = (!userID || (userIDfromStore && userIDfromStore !== userID)) ? userIDfromStore : userID

    const isDraft = showThemeAsDraft && showThemeAsDraft.toLowerCase() === 'true'

    const pageURL = location.href

    CookiesManager.deleteCookie(storefrontCookies.token)
    location.href = `${classicUrl}/logout.aspx?SecurityToken=${securityToken}&StoreGuid=${storeID}&storeid=${storeFriendlyID}&NgLanguageCode=${languageCode}&forceLogin=true&SignIn=true&ShowRibbon=${showRibbon}${isDraft ? '&showThemeAsDraft=true' : ''}&tempUserId=${tempUserId}&returnNGURL=/${encodeURIComponent(pageURL.slice(pageURL.indexOf(languageCode)))}`
  }

  const enterHandler = (e) => {
    if (e.key === "Enter") goToUrl();
  }

  return (
    <div className="signin">
      <div className="signin-info">
        {showTitle && <div className="signin-title">{t('Profile.My_Account')}</div>}
      </div>
      <div className="btn-container d-flex align-items-center">
        <span role="button" tabIndex="0" onKeyDown={enterHandler} onClick={goToUrl} className='button-secondary signin-button' ref={signInRef}>{t('SignIn.SignIn')}</span>
      </div>
    </div>
  )
}
export default SignIn
