import React, { useEffect, useState } from 'react'
import { UStoreProvider } from '@ustore/core'
import { LinkAria } from '$core-components'
import { prependServerDomain } from '$themeservices'
import { getIsNGProduct } from '$themeservices/utils'
import { decodeStringForURL } from '$ustoreinternal/services/utils'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import './CategoryAccordion.scss'

/*
 * Shop by Category — accordion of top categories. Each row shows the category
 * (image icon + name + product count) and expands to a list of that category's
 * product names plus a "View all" link. No pricing. First category open by default.
 */

const DEFAULT_IMG = require('$assets/images/default.png')
const PREVIEW_COUNT = 5

const categoryUrl = (cat) =>
  urlGenerator.get({ page: 'category', id: cat.FriendlyID, name: decodeStringForURL(cat.Name) })

const productUrl = (model) =>
  getIsNGProduct(model)
    ? urlGenerator.get({ page: 'products', id: model.FriendlyID, name: decodeStringForURL(model.Name) })
    : urlGenerator.get({ page: 'product', id: model.FriendlyID, name: decodeStringForURL(model.Name) })

const CategoryAccordion = () => {
  const [cats, setCats] = useState([])
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const { Count, Categories } = await UStoreProvider.api.categories.getTopCategories(1, 200)
        if (!Count || !Categories || Categories.length === 0) {
          return
        }
        const withProducts = await Promise.all(
          Categories.map(async (cat) => {
            let count = 0
            let products = []
            try {
              const res = await UStoreProvider.api.products.getProducts(cat.ID, 1)
              count = res.Count || 0
              products = res.Products || []
            } catch (e) {
              // leave defaults
            }
            return {
              id: cat.ID,
              name: cat.Name,
              image: cat.ImageUrl,
              url: categoryUrl(cat),
              count,
              products
            }
          })
        )
        const visible = withProducts.filter((c) => c.count > 0)
        setCats(visible)
        if (visible.length > 0) {
          setOpenId(visible[0].id)
        }
      } catch (e) {
        // leave empty -> section renders nothing
      }
    })()
  }, [])

  if (cats.length === 0) {
    return null
  }

  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id))

  return (
    <section className="mcf-cats">
      <div className="mcf-cats__inner">
        <div className="mcf-cats__header">
          <div className="mcf-cats__label">Shop by Category</div>
        </div>

        {cats.map((cat) => {
          const open = openId === cat.id
          const img = cat.image ? prependServerDomain(cat.image) : DEFAULT_IMG
          return (
            <div className={`mcf-cats__item ${open ? 'is-open' : ''}`} key={cat.id}>
              <button
                type="button"
                className="mcf-cats__trigger"
                onClick={() => toggle(cat.id)}
                aria-expanded={open}
              >
                <span className="mcf-cats__trigger-left">
                  <span className="mcf-cats__icon"><img src={img} alt="" /></span>
                  <span className="mcf-cats__name">{cat.name}</span>
                  <span className="mcf-cats__count">
                    {cat.count} {cat.count === 1 ? 'product' : 'products'}
                  </span>
                </span>
                <span className="mcf-cats__chevron">▾</span>
              </button>

              <div className="mcf-cats__body">
                <div className="mcf-cats__products">
                  {cat.products.slice(0, PREVIEW_COUNT).map((p) => (
                    <LinkAria key={p.ID} className="mcf-cats__prod" to={productUrl(p)}>
                      {p.Name}
                    </LinkAria>
                  ))}
                  <LinkAria className="mcf-cats__prod mcf-cats__prod--more" to={cat.url}>
                    View all {cat.count} {cat.name} products →
                  </LinkAria>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default CategoryAccordion
