import React, { Component, createRef } from 'react'
import HeadSEO from './HeadSEO'
import Header from './Header'
import Footer from './Footer'
import './Layout.scss'
import CookiesRibbon from "./CookiesRibbon";
import ResizeObserver from "resize-observer-polyfill"
import RouteChangeListener from './RouteChangeListener'

class Layout extends Component {
  constructor() {
    super();
    this.isConnectStore = false
    this.resizeObserver = null;
    this.resizeElement = createRef()
  }

  static currentHeight = 0

  _debounce = function (ms, fn) {
    var timer;
    return function () {
      clearTimeout(timer)
      var args = Array.prototype.slice.call(arguments)
      args.unshift(this)
      timer = setTimeout(fn.bind.apply(fn, args), ms)
    };
  };

  componentWillUnmount() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
  }

  render() {
    const { state, children, className } = this.props

    const storeType = (state && state.currentStore) ? state.currentStore.StoreType : null
    if (storeType === 3) {
      this.isConnectStore = true
    }

    if (this.isConnectStore) {
      if (this.resizeObserver) this.resizeObserver.disconnect();
      this.resizeObserver = new ResizeObserver(this._debounce(300, function (entries) {
        entries.forEach(entry => {
          if (Layout.currentHeight !== entry.contentRect.height) {
            Layout.currentHeight = entry.contentRect.height
            console.log('USTORE_CONNECT_RESIZE height: ' + entry.contentRect.height)
            window.parent.postMessage({
              type: '@USTORE_CONNECT_RESIZE',
              data: {
                height: entry.contentRect.height,
                width: entry.contentRect.width
              }
            }, '*')
          }
        })
      }))
      if (this.resizeElement.current) this.resizeObserver.observe(this.resizeElement.current);
    }

    let isPreviewMode = false
    let url = ''
    try {
      url = window.top.location.href
    } catch (error) { }

    if (url && (url.includes('MobilePreview.aspx') || url.includes('ThemeCustomization.aspx')))
      isPreviewMode = true

    const showHeaderFooter = storeType === 4 ?
      state.currentStore.Attributes.find(attr => attr.Name === 'ShowHeaderAndFooter' && attr.Value === 'True') :
      (!this.isConnectStore || isPreviewMode)

    // MCF base: utility bar content
    const currentStore = state && state.currentStore
    const storeUrl = (currentStore && (currentStore.Url || currentStore.Domain)) || (typeof window !== 'undefined' ? window.location.hostname : '')

return (
<div>
        <HeadSEO {...state} />
        <div className={`layout ${className ? className : ''} ${isPreviewMode ? 'preview' : ''} ${!showHeaderFooter ? 'connect' : ''}`}>
{showHeaderFooter &&
            <div className="mcf-utility-bar">
              <span className="mcf-utility-powered">
                Powered by <span className="mcf-utility-brand">McFaddin Marketing</span> — Automated Print Production
              </span>
              {storeUrl && <span className="mcf-utility-url">{storeUrl}</span>}
            </div>
          }          {showHeaderFooter && <Header {...state} />}
          <div className="main-content" ref={this.resizeElement}>
            {children}
          </div>
          {showHeaderFooter && <Footer />}
          {state.customState && state.currentStore && <CookiesRibbon showRibbon={state.customState.showCookieRibbon} />}
        </div>
        <RouteChangeListener/>
      </div>
    )
  }
}

export default Layout