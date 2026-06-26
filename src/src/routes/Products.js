import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { UStoreProvider } from '@ustore/core'
import { LoadingDots } from '$core-components'
import { t } from '$themelocalization'
import KitProduct from '../components/products/kit/KitProduct'
import StaticProduct from '../components/products/static/StaticProduct'
import Layout from '../components/layout'
import { productTypes } from '../services/utils'

import './Products.scss'


const renderLoader = () => {
  return (
    <div>
      <div className={'product-loading'}>
        <LoadingDots />
        {t('product.loading-msg')}
      </div>
    </div>
  )
}

const Products = (props) => {
  const params = useParams()

  useEffect(() => {
    (async () => {
      const { id: productFriendlyID, OrderItemId: orderItemID } = params
      if (!productFriendlyID) return

      const { currentProduct } = UStoreProvider.state.customState.get()
      if (currentProduct && currentProduct.FriendlyID === parseInt(productFriendlyID)) {
        UStoreProvider.state.customState.setBulk({ currentOrderItemId: orderItemID || null })
        return
      }
      const productID = await UStoreProvider.api.products.getProductIDByFriendlyID(productFriendlyID)
      const product = await UStoreProvider.api.products.getProductByID(productID)

      UStoreProvider.state.customState.setBulk({ currentProduct: product,currentOrderItemId: orderItemID})
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!props.state || !props.customState) {
    return <Layout {...props}>
      {renderLoader()}
    </Layout>
  }

  if (!props.customState.currentProduct) {
    return <Layout {...props}>
      {renderLoader()}
    </Layout>
  }

  const product = props.customState.currentProduct
  // check type of product to decide which component to render.
  switch (product.Type) {
    case productTypes.KIT:
      return <Layout {...props}>
        <KitProduct key={product.ID} {...props} />
      </Layout>
    case productTypes.STATIC:
    case productTypes.DYNAMIC:
    case productTypes.EASY_UPLOAD:
      return <Layout {...props}>
        <StaticProduct key={product.ID} {...props} />
      </Layout>
    default:
      return null
  }
}

export default Products
