import React from 'react'
import { UStoreProvider } from '@ustore/core'

import { CookiesManager, storefrontCookies } from '$ustoreinternal/services/cookies'
import CookiesConsent from "./CookiesConsent";
import CookiesPolicy from "./CookiesPolicy";
import './CookiesRibbon.scss'

const CookieRibbon = ({ showRibbon }) => {
    const [showCookiesPolicy, setShowCookiesPolicy] = React.useState(false)

    if (!showRibbon) {
        return null
    }

    const closeCookiesRibbon = () => {
        UStoreProvider.state.customState.set('showCookieRibbon', false)
        CookiesManager.setCookie({ key: storefrontCookies.cookieRibbonNotShownYet, value: 'false' })
    }
    const openCookiesPolicy = () => setShowCookiesPolicy(true)
    const closeCookiesPolicy = () => setShowCookiesPolicy(false)

    return (
        <div className="cookies-ribbon">
            {showCookiesPolicy
                ? <CookiesPolicy onCloseCookiesPolicyClicked={closeCookiesPolicy}/>
                : <CookiesConsent onCloseCookiesConsentClicked={closeCookiesRibbon}
                                  onCookiesPolicyClicked={openCookiesPolicy}/>}
        </div>
    )
}

export default CookieRibbon
