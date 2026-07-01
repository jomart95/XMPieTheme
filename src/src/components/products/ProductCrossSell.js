import React, { useCallback, useEffect, useRef, useState } from 'react'
import { UStoreProvider } from '@ustore/core'
import { LinkAria, ButtonAria, LoadingDots } from '$core-components'
import { t } from '$themelocalization'
import { prependServerDomain, productTypes } from '$themeservices'
import { decodeStringForURL } from '$ustoreinternal/services/utils'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import { ReactComponent as LeftArrow } from '$assets/icons/dark_left_arrow.svg'
import { ReactComponent as RightArrow } from '$assets/icons/dark_right_arrow.svg'
import ProductItemQuantity from './ProductItemQuantity'
import './ProductCrossSell.scss'

/*
 * "You Might Also Need" — suggests products related to the one being viewed.
 * If the loaded product's category has CATEGORY_MIN+ items, the row shows that
 * category (static items = quick-add, customizable items = "Customize" link).
 * Otherwise it falls back to a random pool of STATIC products from all categories.
 * Static quick-add is safe (brand-locked + pre-approved); anything customizable
 * links out to its own page instead of adding straight to cart.
 */
const DEFAULT_IMG = require('$assets/images/default.png')
// How many products to pull into the row. The carousel scrolls when more items
// exist than fit on screen; set back to 4 for a static (non-scrolling) row.
const CROSS_SELL_COUNT = 12
// Category rule: if the loaded product's category holds this many items or more,
// the row shows that category; otherwise it randomizes static products from all.
const CATEGORY_MIN = 4
// How deep to walk the category tree when pooling products. Covers nested
// categories like Pastry Tags under Operations. Bump if you nest deeper.
const CATEGORY_TREE_DEPTH = 5
// Arrow-advance glide duration (ms) — matches the old carousel's `left 1s ease`.
// Set to 0 for snappy native smooth-scroll instead.
const GLIDE_MS = 1000

const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

const glideBy = (el, delta) => {
  if (GLIDE_MS <= 0) { el.scrollBy({ left: delta, behavior: 'smooth' }); return }
  const start = el.scrollLeft
  const t0 = performance.now()
  const step = (now) => {
    const p = Math.min(1, (now - t0) / GLIDE_MS)
    el.scrollLeft = start + delta * easeInOutQuad(p)
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp
  }
  return a
}

const productUrl = (model) =>
  urlGenerator.get({ page: 'products', id: model.FriendlyID, name: decodeStringForURL(model.Name) })

const CrossSellCard = ({ product }) => {
  const img = product.ImageUrl ? prependServerDomain(product.ImageUrl) : DEFAULT_IMG
  const url = productUrl(product)
  const isStatic = product.Type === productTypes.STATIC
  const qtyConfig = product.Configuration && product.Configuration.Quantity

  // Default to a valid starting quantity so the button works on first click.
  const initialQty = qtyConfig
    ? (qtyConfig.Options ? qtyConfig.Options[0].Value : (qtyConfig.Minimum || 1))
    : 1

  const [quantity, setQuantity] = useState(initialQty)
  const [isQuantityValid, setIsQuantityValid] = useState(true)
  const [currentOrderItem, setCurrentOrderItem] = useState(null)
  const [adding, setAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const isProcessing = useRef(false)
  const successTimer = useRef(null)

  useEffect(() => () => { if (successTimer.current) clearTimeout(successTimer.current) }, [])

  const onQuantityChange = (value, isValid) => {
    setIsQuantityValid(isValid)
    if (isValid) setQuantity(value)
  }

  const onAddToCart = async () => {
    if (isProcessing.current || !isQuantityValid) return
    isProcessing.current = true
    setAdding(true)
    try {
      const item = currentOrderItem || await UStoreProvider.api.orders.addOrderItem(product.ID)
      if (quantity) {
        await UStoreProvider.api.orders.updateOrderItem(item.ID, { ...item, Quantity: quantity })
      }
      await UStoreProvider.api.orders.addToCart(item.ID)

      if (UStoreProvider.state.get()['currentStore']?.Attributes?.find((attr) => attr.Name === 'ForceCartAspx' && attr.Value === 'False')) {
        await UStoreProvider.state.store.loadCartItemsCount()
      }

      setCurrentOrderItem(null)
      setShowSuccess(true)
      successTimer.current = setTimeout(() => setShowSuccess(false), 3000)
    } catch (e) {
      // leave the button re-enabled so the user can retry
    } finally {
      setAdding(false)
      isProcessing.current = false
    }
  }

  return (
    <div className="mcf-cross-sell-card">
      <LinkAria className="mcf-cross-sell-card-image" to={url}>
        <img src={img} alt={product.Name} />
      </LinkAria>
      <div className="mcf-cross-sell-card-body">
        {product.__cat && <span className="mcf-cross-sell-card-cat">{product.__cat}</span>}
        <LinkAria className="mcf-cross-sell-card-name" to={url}>{product.Name}</LinkAria>

        <div className="mcf-cross-sell-card-buy">
          {isStatic ? (
            <React.Fragment>
              {!showSuccess && (
                <React.Fragment>
                  {qtyConfig &&
                    <div className="mcf-cross-sell-card-qty">
                      <ProductItemQuantity
                        supportsInventory={true}
                        onQuantityChange={onQuantityChange}
                        productModel={product}
                        orderModel={{ Quantity: quantity }}
                      />
                    </div>
                  }
                  <ButtonAria
                    className="mcf-cross-sell-add"
                    text={t('ProductItem.Add_to_cart_button_text')}
                    disabled={adding}
                    onClick={onAddToCart}
                    onKeyDown={(e) => { if (e.key === 'Enter') onAddToCart() }}
                  >
                    {adding ? <LoadingDots /> : t('ProductItem.Add_to_cart_button_text')}
                  </ButtonAria>
                </React.Fragment>
              )}
              {showSuccess &&
                <div className="mcf-cross-sell-success">
                  {t('ProductItem.Added_successfully_message')}
                </div>
              }
            </React.Fragment>
          ) : (
            <LinkAria className="mcf-cross-sell-customize" to={url}>
              Customize
            </LinkAria>
          )}
        </div>
      </div>
    </div>
  )
}

const ProductCrossSell = ({ excludeId }) => {
  const [products, setProducts] = useState([])
  const trackRef = useRef(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const updateArrows = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    setCanLeft(el.scrollLeft > 2)
    setCanRight(el.scrollLeft < maxScroll - 2)
  }, [])

  const page = (dir) => {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector('.mcf-cross-sell-card')
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0
    const cardW = card ? card.getBoundingClientRect().width + gap : el.clientWidth
    const perView = Math.max(1, Math.floor((el.clientWidth + gap) / cardW))
    glideBy(el, dir * perView * cardW)
  }

  useEffect(() => {
    updateArrows()
    const el = trackRef.current
    if (!el) return undefined
    el.addEventListener('scroll', updateArrows, { passive: true })
    window.addEventListener('resize', updateArrows)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
    }
  }, [products, updateArrows])

  useEffect(() => {
    ;(async () => {
      try {
        // Walk the full category tree (top level + all subcategories) so products
        // nested under a parent — e.g. Pastry Tags under Operations — are reachable.
        const { Categories: tree } = await UStoreProvider.api.categories.getCategoryTree(CATEGORY_TREE_DEPTH)
        if (!tree || tree.length === 0) return

        const flatCats = []
        const walk = (nodes) => {
          const list = nodes || []
          list.forEach((node) => {
            if (node.Category) flatCats.push({ ID: node.Category.ID, Name: node.Category.Name })
            if (node.SubCategories && node.SubCategories.length) walk(node.SubCategories)
          })
        }
        walk(tree)

        // Pool page-1 products per category, tagged with the category they came from.
        const pools = await Promise.all(
          flatCats.map(async (cat) => {
            try {
              const { Products } = await UStoreProvider.api.products.getProducts(cat.ID, 1)
              return (Products || []).map((p) => ({ ...p, __cat: cat.Name, __catId: cat.ID }))
            } catch (e) { return [] }
          })
        )
        const all = pools.flat()

        // Which category does the loaded product belong to? Find the pool holding it.
        const current = all.find((p) => p.ID === excludeId)
        const currentCatId = current ? current.__catId : null
        const categoryTotal = currentCatId
          ? all.filter((p) => p.__catId === currentCatId).length
          : 0

        let chosen
        if (currentCatId && categoryTotal >= CATEGORY_MIN) {
          // Category branch: show this product's category (any type), minus itself.
          const seen = new Set()
          chosen = all.filter((p) => {
            if (p.__catId !== currentCatId || p.ID === excludeId || seen.has(p.ID)) return false
            seen.add(p.ID)
            return true
          }).slice(0, CROSS_SELL_COUNT)
        } else {
          // Fallback branch: random STATIC products (quick-add) from across the store.
          const seen = new Set()
          const staticPool = all.filter((p) => {
            if (p.Type !== productTypes.STATIC || p.ID === excludeId || seen.has(p.ID)) return false
            seen.add(p.ID)
            return true
          })
          chosen = shuffle(staticPool).slice(0, CROSS_SELL_COUNT)
        }
        setProducts(chosen)
      } catch (e) {
        // leave empty -> renders nothing
      }
    })()
  }, [excludeId])

  if (products.length === 0) return null

  return (
    <section className="mcf-cross-sell">
      <h2 className="mcf-cross-sell-title">You Might Also Need</h2>
      <div className="mcf-cross-sell-carousel">
        <button
          type="button"
          aria-label="Previous"
          className={`mcf-cross-sell-arrow left-arrow${canLeft ? '' : ' is-hidden'}`}
          onClick={() => page(-1)}
          tabIndex={canLeft ? 0 : -1}
        >
          <LeftArrow />
        </button>
        <div className="mcf-cross-sell-track" ref={trackRef}>
          {products.map((p) => <CrossSellCard product={p} key={p.ID} />)}
        </div>
        <button
          type="button"
          aria-label="Next"
          className={`mcf-cross-sell-arrow right-arrow${canRight ? '' : ' is-hidden'}`}
          onClick={() => page(1)}
          tabIndex={canRight ? 0 : -1}
        >
          <RightArrow />
        </button>
      </div>
    </section>
  )
}

export default ProductCrossSell