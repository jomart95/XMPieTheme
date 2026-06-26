import React, {useEffect, useRef, useState, useContext} from 'react'
import {useNavigate} from 'react-router-dom'
import {Label} from 'react-aria-components'
import {Icon} from '$core-components'
import {RootDocumentContext} from '$themeservices'
import {useClickOutside} from '$themehooks'
import {t} from '$themelocalization'
import themeContext from '$ustoreinternal/services/themeContext'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import {redirectToLegacy} from '$ustoreinternal/services/redirect'
import {CookiesManager, storefrontCookies} from '$ustoreinternal/services/cookies'
import {CART_MODE, getCartMode} from '$themeservices'
import {UStoreProvider} from '@ustore/core'
import SignIn from '../SignIn'
import SignOut from '../SignOut'
import {Slot, ListBoxAria, OptionAria, SelectAria, ButtonAria, PopoverAria} from '$core-components'
import './ProfileSwitcher.scss'

export const ProfileSwitcher = ({currentUser, userOrdersSummary}) => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const triggerRef = useRef(null)
  const {rootElement} = useContext(RootDocumentContext)()

  useClickOutside(containerRef, () => setIsOpen(false), rootElement)

  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = ''
      document.documentElement.style.paddingRight = ''
      containerRef.current?.querySelector('.button-secondary')?.focus()
    }
  }, [isOpen])

  const pendingApprovalOrderCount = (userOrdersSummary) ? userOrdersSummary.PendingApprovalOrderCount : null
  const items = getItemList({userOrdersSummary, currentUser, pendingApprovalOrderCount})

  const onSelectionChange = (key) => {
    if (key === undefined || key === 'user_menu_top_slot' || key === 'user_menu_bottom_slot') {
      return
    }

    const {IsAnonymous, loginPage, pageTitle, additional} = items.find(item => item.id === key)
    if (IsAnonymous) {
      CookiesManager.deleteCookie(storefrontCookies.token)
      redirectToLegacy(createLink(IsAnonymous, loginPage, pageTitle, additional))
      return
    }
    triggerRef.current?.blur()
    navigate(createLink(IsAnonymous, loginPage, pageTitle, additional))
  }

  const topSlot = window.xmpie_uStore_widgets.instances.find(widget => widget.location === 'user_menu_top')
  const bottomSlot = window.xmpie_uStore_widgets.instances.find(widget => widget.location === 'user_menu_bottom')
  if (topSlot) {
    items.unshift({id: 'user_menu_top_slot', value: 'user_menu_top_slot'})
  }
  if (bottomSlot) {
    items.push({id: 'user_menu_bottom_slot', value: 'user_menu_bottom_slot'})
  }

  return (
    <>
      <ButtonAria onPress={() => setIsOpen(!isOpen)} className="profile-switcher-button" ref={triggerRef} noTruncate={true}>
        <Icon name="homepage_header_user.svg" width="20px" height="20px" className="profile-icon"/>
        {
          pendingApprovalOrderCount > 0 &&
          <div className="pending-approval-notification-icon">
            <Icon name="profile-notification.svg" width="20px" height="20px" className="profile-icon"/>
          </div>
        }
      </ButtonAria>
      <SelectAria className="profile-switcher" onSelectionChange={onSelectionChange} isOpen={isOpen}
                  onOpenChange={(v) => {
                    if (isOpen && !v) {
                      triggerRef.current?.focus()
                    }
                    setIsOpen(v)
                  }}
                  ref={containerRef}>
        <Label>{t('ProfileDropDownMenuLabel')}</Label>
        <PopoverAria
          className="profile-switcher-popup"
          shouldCloseOnInteractOutside={() => {
            return false
          }}
          triggerRef={containerRef}
          UNSTABLE_portalContainer={rootElement}
          placement="bottom"
          overlayRef={containerRef}
          isOpen={isOpen}
        >
          {
            currentUser.IsAnonymous
              ? <SignIn/>
              : <SignOut currentUser={currentUser} />
          }
          <ListBoxAria selectionMode="single" items={items}>
            {items.map((item) => <OptionAria key={item.key} value={item.value} item={item}>
              {['user_menu_top_slot', 'user_menu_bottom_slot'].includes(item.id) ?
                <Slot name={item.id.replace(/_slot$/i, '')}/> : <div>{item.pageName}</div>   }
            </OptionAria>)}
          </ListBoxAria>
        </PopoverAria>
      </SelectAria>
    </>
  )
}

function createLink(anonymous, loginURL, pageTitle, additional) {
  const {languageCode} = themeContext.get()
  const pageURL = urlGenerator.get({page: pageTitle})

  if (anonymous) {
    return `${loginURL}&returnNGURL=/${encodeURIComponent(pageURL.slice(pageURL.indexOf(languageCode)))}${additional ? '?' + additional : ''}`
  }

  return `${pageURL}${additional ? '?' + additional : ''}`
}

function getItemList({userOrdersSummary, currentUser, pendingApprovalOrderCount}) {
  const {userID, storeID, securityToken, storeFriendlyID, languageCode} = themeContext.get()
  const {currentStore} = UStoreProvider.state.get()
  const tempUserId = userID && currentUser.ID === userID ? userID : currentUser.ID
  const isSingleList = getCartMode(currentStore) === CART_MODE.SingleList
  const rejectedOrderCount = userOrdersSummary?.RejectedOrderCount || 0
  const loginPage = `/logout.aspx?tempUserId=${tempUserId}&SecurityToken=${securityToken}&StoreGuid=${storeID}&storeid=${storeFriendlyID}&NgLanguageCode=${languageCode}&forceLogin=true&ShowRibbon=false&SignIn=true`
  const isUStoreConnectEnterprise = currentStore.Attributes.find(attr => attr.Name === 'HomepageToCart')?.Value === 'True'
  const isNotWebComponent = !process.env.REACT_APP_WEB_COMPONENT
  const baseItem = {
    IsAnonymous: currentUser.IsAnonymous,
    loginPage
  }

  return [
    isNotWebComponent && !isSingleList && {
      id: 'my-orders',
      key: 'my-orders',
      pageName: t('Profile.My_orders'),
      pageTitle: 'order-history',
      additional: 'filter=0',
      ...baseItem,
    },
    userOrdersSummary && currentUser.Roles.Shopper && {
      id: 'rejected-orders',
      key: 'rejected-orders',
      pageName: t('Profile.Rejected_orders', {rejectedOrderCount}),
      pageTitle: 'order-history',
      additional: 'filter=2',
      ...baseItem,
    },
    userOrdersSummary && currentUser.Roles.Approver && {
      id: 'orders-to-approve',
      key: 'orders-to-approve',
      pageName: t('Profile.Orders_to_approve', {pendingApprovalOrderCount}),
      pageTitle: 'order-approval-list',
      ...baseItem,
    },
    isNotWebComponent && {
      id: 'draft-orders',
      key: 'draft-orders',
      pageName: t('Profile.Draft_orders'),
      pageTitle: 'drafts',
      ...baseItem,
    },
    isNotWebComponent && {
      id: 'recipient-list',
      key: 'recipient-list',
      pageName: t('Profile.Recipient_lists'),
      pageTitle: 'my-recipient-lists',
      ...baseItem,
    },
    isNotWebComponent && !isUStoreConnectEnterprise && {
      id: 'addresses',
      key: 'addresses',
      pageName: t('Profile.Addresses'),
      pageTitle: 'addresses',
      ...baseItem,
    },
    isNotWebComponent && !isUStoreConnectEnterprise && {
      id: 'personal-information',
      key: 'personal-information',
      pageName: t('Profile.Personal_information'),
      pageTitle: 'personal-information',
      ...baseItem,
    }
  ].filter(Boolean).map(item => ({...item, value: item.id}))
}
