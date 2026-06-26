import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UStoreProvider } from '@ustore/core'
import { prependThemePath } from '$themeservices'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import { decodeStringForURL } from '$ustoreinternal/services/utils'
import './Hero.scss'

/*
 * Universal hero — structure + copy baked once for the McFaddin base theme.
 * Branding flows from the existing skin tokens, so the per-client override
 * (e.g. PJ's plum/gold) recolours this with no code changes.
 *
 * Per-client data resolved at runtime:
 *   - store name      -> eyebrow + sub   (VERIFY field on live, see CHANGELOG)
 *   - product count   -> "Products" stat (90% of catalogue, floored)
 *   - top categories  -> the three right-panel cards (largest by product count)
 */

// 90% of available products, floored to a clean "X+".
// Small catalogues show the exact floored value so we never render "0+".
const formatProductCount = (count) => {
  if (count == null) return null
  const ninety = Math.floor(count * 0.9)
  if (ninety >= 20) return Math.floor(ninety / 10) * 10
  return ninety
}

// 1 card -> wide; 2 cards -> both wide (stacked); 3 cards -> first wide + two below.
const cardClass = (index, total) => {
  const base = 'mcf-hero__card'
  if (total <= 2) return base + ' ' + base + '--wide'
  return index === 0 ? base + ' ' + base + '--wide' : base
}

const Hero = () => {
  const navigate = useNavigate()

  const [storeName, setStoreName] = useState('')
  const [productCount, setProductCount] = useState(null)
  const [cards, setCards] = useState([])
  const [browseUrl, setBrowseUrl] = useState('')

  const goTo = (url) => {
    if (!url) return
    if (url.startsWith('http')) {
      window.location.href = url
    } else {
      navigate(prependThemePath(url))
    }
  }

  useEffect(() => {
    // --- Store name (VERIFY: confirm `.Name` is the right field on store 54) ---
    try {
      const store = UStoreProvider.state.get().store
      if (store && store.Name) {
        setStoreName(store.Name)
      }
    } catch (e) {
      // leave blank -> generic fallback copy
    }

    // --- Categories: per-category counts drive both the stat and the cards ---
    ;(async () => {
      try {
        const maxInPage = 200
        const { Count, Categories } = await UStoreProvider.api.categories.getTopCategories(1, maxInPage)
        if (!Count || !Categories || Categories.length === 0) {
          return
        }

        const withCounts = await Promise.all(
          Categories.map(async (cat) => {
            let count = 0
            try {
              const res = await UStoreProvider.api.products.getProducts(cat.ID, 1)
              count = res.Count || 0
            } catch (err) {
              count = 0
            }
            return { ...cat, __count: count }
          })
        )

        // Headline stat = whole catalogue.
        const total = withCounts.reduce((sum, c) => sum + c.__count, 0)
        setProductCount(total)

        // Cards = the three largest categories that actually have products.
        const top = withCounts
          .filter((c) => c.__count > 0)
          .sort((a, b) => b.__count - a.__count)
          .slice(0, 3)

        setCards(
          top.map((c) => ({
            id: c.ID,
            name: c.Name,
            count: c.__count,
            description: c.Description || '',
            url: urlGenerator.get({
              page: 'category',
              id: c.FriendlyID,
              name: decodeStringForURL(c.Name)
            })
          }))
        )

        // Browse / CTA target = the largest category (catalogue entry point).
        if (top.length > 0) {
          setBrowseUrl(
            urlGenerator.get({
              page: 'category',
              id: top[0].FriendlyID,
              name: decodeStringForURL(top[0].Name)
            })
          )
        }
      } catch (e) {
        // leave defaults -> stat shows placeholder, panel shows just the CTA
      }
    })()
  }, [])

  const displayCount = formatProductCount(productCount)

  return (
    <section className="mcf-hero">
      <div className="mcf-hero__content">
        <div className="mcf-hero__eyebrow">
          {storeName ? storeName + ' Print Portal' : 'Print Portal'}
        </div>

        <h1 className="mcf-hero__title">
          Brand-perfect<br />
          print. <span className="mcf-hero__accent">Every</span><br />
          <span className="mcf-hero__accent-gold">location.</span>
        </h1>

        <p className="mcf-hero__sub">
          Order approved, personalised print for your {storeName || 'location'} &mdash; produced in Louisville and shipped fast.
        </p>

        <div className="mcf-hero__actions">
          <button className="mcf-hero__btn mcf-hero__btn--primary" onClick={() => goTo(browseUrl)}>Browse Products</button>
          <button className="mcf-hero__btn mcf-hero__btn--secondary">View My Orders</button>
        </div>

        <div className="mcf-hero__stats">
          <div className="mcf-hero__stat">
            <div className="mcf-hero__stat-num">24<em>hr</em></div>
            <div className="mcf-hero__stat-label">Turnaround</div>
          </div>
          <div className="mcf-hero__stat">
            <div className="mcf-hero__stat-num">
              {displayCount != null ? <>{displayCount}<em>+</em></> : <>&mdash;</>}
            </div>
            <div className="mcf-hero__stat-label">Products</div>
          </div>
          <div className="mcf-hero__stat">
            <div className="mcf-hero__stat-num">100<em>%</em></div>
            <div className="mcf-hero__stat-label">Brand Accurate</div>
          </div>
        </div>
      </div>

      <div className="mcf-hero__panel">
        {cards.length > 0 &&
          <div className="mcf-hero__cards">
            {cards.map((card, i) => (
              <a
                key={card.id}
                className={cardClass(i, cards.length)}
                href={prependThemePath(card.url)}
                onClick={(e) => { e.preventDefault(); goTo(card.url) }}
              >
                <div className="mcf-hero__card-label">
                  {card.count} {card.count === 1 ? 'Product' : 'Products'}
                </div>
                <div className="mcf-hero__card-title">{card.name}</div>
                {card.description &&
                  <div className="mcf-hero__card-desc">{card.description}</div>
                }
                <div className="mcf-hero__card-bar" />
              </a>
            ))}
          </div>
        }
        <button className="mcf-hero__panel-cta" onClick={() => goTo(browseUrl)}>Start Shopping &rarr;</button>
      </div>
    </section>
  )
}

export default Hero
