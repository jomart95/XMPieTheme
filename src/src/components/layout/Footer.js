import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UStoreProvider } from '@ustore/core'
import { prependThemePath } from '$themeservices'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import { decodeStringForURL } from '$ustoreinternal/services/utils'
import { Slot } from '$core-components'
import './Footer.scss'

/**
 * Store footer — built as real theme markup (not slot-filled).
 * Structure + copy baked once; branding flows from the footer tokens.
 *
 * Per-client data resolved at runtime:
 *   - store name -> wordmark + blurb + copyright (VERIFY field, same as hero)
 *   - top categories -> Products column (live links)
 *
 * Placeholder items (My Store + Support secondary) are <button>s styled as links
 * until their route URLs are confirmed — then they become real <a> links.
 * <Slot name="footer" /> is kept at the bottom for any Back Office injected content.
 */

const MCFADDIN_URL = 'https://www.mcfaddinmarketing.com'

const Footer = () => {
  const navigate = useNavigate()
  const [storeName, setStoreName] = useState('')
  const [categories, setCategories] = useState([])

  const goTo = (url) => {
    if (!url) return
    if (url.startsWith('http')) {
      window.location.href = url
    } else {
      navigate(prependThemePath(url))
    }
  }

  useEffect(() => {
    try {
      const store = UStoreProvider.state.get().store
      if (store && store.Name) {
        setStoreName(store.Name)
      }
    } catch (e) {
      // leave blank -> generic fallback copy
    }

    ;(async () => {
      try {
        const { Count, Categories } = await UStoreProvider.api.categories.getTopCategories(1, 200)
        if (!Count || !Categories || Categories.length === 0) {
          return
        }
        setCategories(
          Categories.slice(0, 6).map((c) => ({
            id: c.ID,
            name: c.Name,
            url: urlGenerator.get({
              page: 'category',
              id: c.FriendlyID,
              name: decodeStringForURL(c.Name)
            })
          }))
        )
      } catch (e) {
        // leave empty -> Products column simply renders no links
      }
    })()
  }, [])

  const year = new Date().getFullYear()

  return (
    <div className="footer">
      <div className="mcf-footer__grid">
        <div className="mcf-footer__col mcf-footer__col--brand">
          <div className="mcf-footer__wordmark">{storeName || 'Print Store'}</div>
          <div className="mcf-footer__tag">Print Store — Powered by McFaddin Marketing</div>
          <p className="mcf-footer__desc">
            Brand-approved print ordering{storeName ? ` for ${storeName}` : ''} — produced in Louisville, shipped nationwide.
          </p>
        </div>

        <div className="mcf-footer__col">
          <div className="mcf-footer__head">Products</div>
          <ul className="mcf-footer__links">
            {categories.map((c) => (
              <li key={c.id}>
                <a
                  href={prependThemePath(c.url)}
                  onClick={(e) => { e.preventDefault(); goTo(c.url) }}
                >
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mcf-footer__col">
          <div className="mcf-footer__head">My Store</div>
          {/* TODO: swap to <a> with real hrefs once route URLs confirmed */}
          <ul className="mcf-footer__links">
            <li><button type="button" className="mcf-footer__linkbtn">My Account</button></li>
            <li><button type="button" className="mcf-footer__linkbtn">Order History</button></li>
            <li><button type="button" className="mcf-footer__linkbtn">Track Order</button></li>
            <li><button type="button" className="mcf-footer__linkbtn">Saved Proofs</button></li>
          </ul>
        </div>

        <div className="mcf-footer__col">
          <div className="mcf-footer__head">Support</div>
          <ul className="mcf-footer__links">
            <li><a href={MCFADDIN_URL} target="_blank" rel="noopener noreferrer">Contact McFaddin</a></li>
            <li><button type="button" className="mcf-footer__linkbtn">Artwork Guide</button></li>
            <li><button type="button" className="mcf-footer__linkbtn">FAQs</button></li>
            <li><button type="button" className="mcf-footer__linkbtn">Brand Guidelines</button></li>
          </ul>
        </div>
      </div>

      <div className="mcf-footer__bottom">
        <div className="mcf-footer__copy">
          © {year} {storeName || 'McFaddin Marketing'}. All rights reserved.
        </div>
        <div className="mcf-footer__powered">
          Print portal by <a href={MCFADDIN_URL} target="_blank" rel="noopener noreferrer">McFaddin Marketing</a>
        </div>
      </div>

      <Slot name="footer" />
    </div>
  )
}

export default Footer
