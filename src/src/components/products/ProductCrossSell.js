import React, { useEffect, useState } from 'react'
import { UStoreProvider } from '@ustore/core'
import { LinkAria } from '$core-components'
import { prependServerDomain } from '$themeservices'
import { getIsNGProduct } from '$themeservices/utils'
import { decodeStringForURL } from '$ustoreinternal/services/utils'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import './ProductCrossSell.scss'

/*
 * "You Might Also Need" — random products pooled from across the store,
 * de-duped and shuffled. Reuses the homepage FeaturedProducts pattern.
 */
const DEFAULT_IMG = require('$assets/images/default.png')
const CROSS_SELL_COUNT = 4

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp
  }
  return a
}

const productUrl = (model) =>
  getIsNGProduct(model)
    ? urlGenerator.get({ page: 'products', id: model.FriendlyID, name: decodeStringForURL(model.Name) })
    : urlGenerator.get({ page: 'product', id: model.FriendlyID, name: decodeStringForURL(model.Name) })

const ProductCrossSell = ({ excludeId }) => {
  const [products, setProducts] = useState([])

  useEffect(() => {
    ;(async () => {
      try {
        const { Count, Categories } = await UStoreProvider.api.categories.getTopCategories(1, 200)
        if (!Count || !Categories || Categories.length === 0) return

        const pools = await Promise.all(
          Categories.map(async (cat) => {
            try {
              const { Products } = await UStoreProvider.api.products.getProducts(cat.ID, 1)
              return (Products || []).map((p) => ({ ...p, __cat: cat.Name }))
            } catch (e) { return [] }
          })
        )

        const seen = new Set()
        const unique = pools.flat().filter((p) => {
          if (p.ID === excludeId || seen.has(p.ID)) return false
          seen.add(p.ID)
          return true
        })
        setProducts(shuffle(unique).slice(0, CROSS_SELL_COUNT))
      } catch (e) {
        // leave empty -> renders nothing
      }
    })()
  }, [excludeId])

  if (products.length === 0) return null

  return (
    <section className="mcf-cross-sell">
      <h2 className="mcf-cross-sell-title">You Might Also Need</h2>
      <div className="mcf-cross-sell-grid">
        {products.map((p) => {
          const img = p.ImageUrl ? prependServerDomain(p.ImageUrl) : DEFAULT_IMG
          const url = productUrl(p)
          return (
            <div className="mcf-cross-sell-card" key={p.ID}>
              <LinkAria className="mcf-cross-sell-card-image" to={url}>
                <img src={img} alt={p.Name} />
              </LinkAria>
              <div className="mcf-cross-sell-card-body">
                {p.__cat && <span className="mcf-cross-sell-card-cat">{p.__cat}</span>}
                <LinkAria className="mcf-cross-sell-card-name" to={url}>{p.Name}</LinkAria>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default ProductCrossSell