import React, { useEffect, useRef, useState } from 'react'
import { UStoreProvider } from '@ustore/core'
import { LinkAria, ButtonAria, LoadingDots } from '$core-components'
import { t } from '$themelocalization'
import { prependServerDomain, productTypes } from '$themeservices'
import { decodeStringForURL } from '$ustoreinternal/services/utils'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import ProductItemQuantity from './ProductItemQuantity'
import './ProductCrossSell.scss'

/*
 * "You Might Also Need" — random STATIC products pooled from across the store,
 * de-duped and shuffled. Static only: brand-locked + pre-approved, so quick-add
 * without a proof step is appropriate. Each card runs the real cart flow.
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
  urlGenerator.get({ page: 'products', id: model.FriendlyID, name: decodeStringForURL(model.Name) })

const CrossSellCard = ({ product }) => {
  const img = product.ImageUrl ? prependServerDomain(product.ImageUrl) : DEFAULT_IMG
  const url = productUrl(product)
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
        </div>
      </div>
    </div>
  )
}

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
          if (p.Type !== productTypes.STATIC) return false   // quick-add = static only (brand-locked, pre-approved)
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
        {products.map((p) => <CrossSellCard product={p} key={p.ID} />)}
      </div>
    </section>
  )
}

export default ProductCrossSell
