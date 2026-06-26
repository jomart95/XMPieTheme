import React, { useEffect, useState } from 'react'
import { UStoreProvider } from '@ustore/core'
import { LinkAria } from '$core-components'
import { prependServerDomain } from '$themeservices'
import { getIsNGProduct } from '$themeservices/utils'
import { decodeStringForURL } from '$ustoreinternal/services/utils'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import './FeaturedProducts.scss'

/*
 * Featured Products — random products pulled from across the store.
 * No "all products" endpoint exists, so we pool page-1 products from every top
 * category, de-dupe, shuffle, and take N. Each product is tagged with the
 * category it came from (for the card eyebrow). No pricing displayed.
 */

const DEFAULT_IMG = require('$assets/images/default.png')
const FEATURED_COUNT = 8

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = a[i]
    a[i] = a[j]
    a[j] = tmp
  }
  return a
}

const productUrl = (model) =>
  getIsNGProduct(model)
    ? urlGenerator.get({ page: 'products', id: model.FriendlyID, name: decodeStringForURL(model.Name) })
    : urlGenerator.get({ page: 'product', id: model.FriendlyID, name: decodeStringForURL(model.Name) })

const isCustomise = (model) =>
  !!(model.Attributes && model.Attributes.find((a) => a.Name === 'UEditEnabled' && a.Value === 'true'))

const FeaturedProducts = () => {
  const [products, setProducts] = useState([])

  useEffect(() => {
    ;(async () => {
      try {
        const { Count, Categories } = await UStoreProvider.api.categories.getTopCategories(1, 200)
        if (!Count || !Categories || Categories.length === 0) {
          return
        }
        const pools = await Promise.all(
          Categories.map(async (cat) => {
            try {
              const { Products } = await UStoreProvider.api.products.getProducts(cat.ID, 1)
              return (Products || []).map((p) => ({ ...p, __cat: cat.Name }))
            } catch (e) {
              return []
            }
          })
        )
        const seen = new Set()
        const unique = pools.flat().filter((p) => {
          if (seen.has(p.ID)) return false
          seen.add(p.ID)
          return true
        })
        setProducts(shuffle(unique).slice(0, FEATURED_COUNT))
      } catch (e) {
        // leave empty -> section renders nothing
      }
    })()
  }, [])

  if (products.length === 0) {
    return null
  }

  return (
    <section className="mcf-featured">
      <div className="mcf-featured__inner">
        <div className="mcf-featured__eyebrow">Featured Products</div>
        <h2 className="mcf-featured__title">
          Ready to <span className="mcf-featured__accent">order.</span>
        </h2>
        <p className="mcf-featured__sub">
          Every product is pre-approved for your brand standards. Personalise for your location and we'll handle the rest.
        </p>

        <div className="mcf-featured__grid">
          {products.map((p) => {
            const img = p.ImageUrl ? prependServerDomain(p.ImageUrl) : DEFAULT_IMG
            const url = productUrl(p)
            return (
              <div className="mcf-featured__card" key={p.ID}>
                <LinkAria className="mcf-featured__img-wrap" to={url}>
                  <img className="mcf-featured__img" src={img} alt={p.Name} />
                  {isCustomise(p) && <span className="mcf-featured__badge">Customise</span>}
                </LinkAria>
                <div className="mcf-featured__body">
                  {p.__cat && <div className="mcf-featured__cat">{p.__cat}</div>}
                  <LinkAria className="mcf-featured__name" to={url}>{p.Name}</LinkAria>
                </div>
                <div className="mcf-featured__foot">
                  <LinkAria className="mcf-featured__order" to={url}>Order</LinkAria>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FeaturedProducts
