import React, {useEffect, useRef, useState} from 'react'
import {Icon, MenuTrigger, ButtonAria} from '$core-components'
import {MobileMenuSwitcher, getMobileMenuItems} from './switchers'
import './MobileMenu.scss'

export const MobileMenu = ({
                             currentCulture,
                             currentCurrency,
                             currentUser,
                             categoriesTree,
                             cultures,
                             currencies,
                           }) => {
  const drawerRef = useRef()
  const [isOpen, setIsOpen] = useState(false)
  const [slideOut, setSlideOut] = useState(false)
  const [menuItems, setMenuItems] = useState(getMobileMenuItems(categoriesTree, cultures, currencies, currentCurrency, currentCulture))

  useEffect(() => {
    const onKeyUp = (e) => {
      if (e.key === 'Escape' && e.target.tagName === 'BODY') {
        closeDrawer()
      }
    }

    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useEffect(() => {
    setMenuItems(getMobileMenuItems(categoriesTree, cultures, currencies, currentCurrency, currentCulture))
  }, [categoriesTree, cultures, currencies, currentCurrency, currentCulture])

  useEffect(() => {

    if (drawerRef.current) {
      let options = {threshold: [0, 0.25, 0.5, 0.75, 1]}
      const callback = (entries) => {
        if (!entries[0].isIntersecting) {
          setIsOpen(false)
          setSlideOut(false)
          observer.disconnect()
          drawerRef.current = null
        }
      }

      let observer = new IntersectionObserver(callback, options)
      observer.observe(drawerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerRef.current])

  const openDrawer = () => setIsOpen(true)
  const closeDrawer = () => setSlideOut(true)
  const closeFromSignInAndOut = (e) => {
    if (e.key === 'Escape' &&
      (e.target.classList.contains('signin-button') || e.target.classList.contains('signout-button'))) {
      closeDrawer()
    }
  }

  const onAnimationEnd = (e) => {}//e.target.querySelector('[role="option"]').focus()

  return <>
    <MenuTrigger onOpenChange={(isOpen) => isOpen && openDrawer()} isOpen={isOpen}>
      <ButtonAria ariaLabel="Menu" className="menu-button" noTruncate={true} onClick={(e) => isOpen && openDrawer()}
                  onKeyUp={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      isOpen && openDrawer()
                    }
                  }}>
        <Icon name="homepage_header_menu_mobile.svg" width="23px" height="20px" className="menu-icon"
              wrapperClassName="menu-icon-container"/>
      </ButtonAria>
    </MenuTrigger>
    {isOpen && <div className="mobile-menu" onKeyUp={(e) => {
      if (e.key === 'Escape' && e.target.classList.contains('react-aria-Button')) {
        closeDrawer()
      }
    }}>
      <div className="drawer-overlay" onMouseDown={closeDrawer}/>
      <div onAnimationEnd={onAnimationEnd} className={`drawer-wrapper ${slideOut ? 'slide-out' : ''}`} ref={drawerRef}
           onKeyUp={closeFromSignInAndOut}
           onBlur={(e) => {
             if (!drawerRef.current.contains(e.relatedTarget)) {
               e.target.focus()
             }
           }}
      >
        <MobileMenuSwitcher items={menuItems[0].children} onClose={closeDrawer}/>
      </div>
    </div>}
  </>
}
