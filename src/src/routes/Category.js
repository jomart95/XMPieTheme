import React, { useCallback, useEffect, useState } from 'react'
import {useParams} from 'react-router-dom'
import { UStoreProvider } from '@ustore/core'
import Layout from '../components/layout'
import { Slider, ScrollableGallery } from '$core-components'
import CategoryItem from '../components/category/CategoryItem'
import ProductItem from '../components/products/ProductItem'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import { t } from '$themelocalization'
import { getIsNGProduct } from '$themeservices'
import { decodeStringForURL } from '$ustoreinternal/services/utils'

import './Category.scss'
import { Slot } from '$core-components'

const PRODUCTS_PAGE_SIZE = 8
const SUB_CATEGORIES_PAGE_SIZE = 200

const clearCustomState = () => {
  UStoreProvider.state.customState.delete('categoryFeaturedProducts')
  UStoreProvider.state.customState.delete('categoryProductsCount')
  UStoreProvider.state.customState.delete('currentCategory')
  UStoreProvider.state.customState.delete('subCategories')
  UStoreProvider.state.customState.delete('currentProduct')
  UStoreProvider.state.customState.delete('currentOrderItem')
  UStoreProvider.state.customState.delete('currentOrderItemId')
  UStoreProvider.state.customState.delete('currentOrderItemPriceModel')
  UStoreProvider.state.customState.delete('lastOrder')
  UStoreProvider.state.customState.delete('currentProductThumbnails')
}

const Category = (props) => {
  const { id: categoryFriendlyID } = useParams()
  const [categoryID, setCategoryID] = useState(null)
  const [currentCategory, setCurrentCategory] = useState(null)
  const [subCategories, setSubCategories] = useState(null)
  const [categoryFeaturedProducts, setCategoryFeaturedProducts] = useState(null)
  const [categoryProductsCount, setCategoryProductsCount] = useState(null)
  const [showSubCategories, setShowSubCategories] = useState(false)
  const hasMoreItems = categoryFeaturedProducts && categoryFeaturedProducts.length < categoryProductsCount
  const ariaAttrs = {
    "aria-roledescription": "carousel",
    "aria-label": "Displaying categories",
  }

  const initialLoad = async () => {
    if (categoryFriendlyID !== currentCategory?.FriendlyID) {
      clearCustomState()
      const newCategoryID = await UStoreProvider.api.categories.getCategoryIDByFriendlyID(categoryFriendlyID)
      const category = await UStoreProvider.api.categories.getCategory(newCategoryID)
      setCategoryID(newCategoryID)
      setCurrentCategory(category)
      await UStoreProvider.state.customState.set('currentCategory', category)
      setSubCategories((await UStoreProvider.api.categories.getSubCategories(newCategoryID, 1, SUB_CATEGORIES_PAGE_SIZE))?.Categories)
      const { Products, Count } = await UStoreProvider.api.products.getProducts(newCategoryID, 1, PRODUCTS_PAGE_SIZE)
      setCategoryFeaturedProducts(Products)
      setCategoryProductsCount(Count)
      // this causes the Slider to re-render and show the first slide when the category changes
      setShowSubCategories(() => false)
      setShowSubCategories(() => true)
    }
  }

  const loadProducts = useCallback(async () => {
    if (!props.customState) {
      return null
    }
    const nextPage = categoryFeaturedProducts ? Math.ceil(categoryFeaturedProducts.length / PRODUCTS_PAGE_SIZE) + 1 : 1
    const { Products: products } = await UStoreProvider.api.products.getProducts(currentCategory?.ID || categoryID, nextPage, PRODUCTS_PAGE_SIZE)
    const joinedProducts = categoryFeaturedProducts ? [...categoryFeaturedProducts, ...products] : products
    setCategoryFeaturedProducts(joinedProducts)
    UStoreProvider.state.customState.set('categoryFeaturedProducts', joinedProducts)
  }, [categoryFeaturedProducts, currentCategory?.ID, categoryID, props.customState])

  useEffect(() => {
    (async () => {
      await initialLoad()
    })()
    return () => {
      clearCustomState()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    (async () => await initialLoad())()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFriendlyID])

  useEffect(() => {
    const allHeight = document.body.scrollHeight
    const visibleHeight = window.innerHeight
    const isVisibleFullSite = allHeight === visibleHeight
    if (isVisibleFullSite && categoryFeaturedProducts && hasMoreItems && currentCategory?.ID) {
      loadProducts()
    }
  }, [categoryFeaturedProducts, currentCategory?.ID, hasMoreItems, loadProducts])

  if (!props.customState) {
    return null
  }
  const galleryTitle =
    categoryProductsCount
      ? subCategories && subCategories.length > 0
        ? t('Category.Count_featured_products', { count: categoryProductsCount })
        : t('Category.Count_products', { count: categoryProductsCount })
      : ''

  return (

    <Layout {...props} className="category">
      <Slot name="category_top" />
      <div className="title" dangerouslySetInnerHTML={{ __html: currentCategory && currentCategory.Name }} />

      {showSubCategories && subCategories && subCategories.length > 0 &&
        <div>
          <div className="categories-wrapper">
            <Slider key={currentCategory.ID} multi ariaAttrs={ariaAttrs}>
              {
                subCategories.map((model, index) => {
                    return <CategoryItem key={model.ID} model={model}
                                         url={urlGenerator.get({ page: 'category', id: model.FriendlyID, name: decodeStringForURL(model.Name) })}
                                         role="group"
                                         aria-roledescription="slide"
                                         aria-label={`${model.Name}, item ${index + 1} of ${subCategories.length}`}
                                         />
                  }
                )
              }
            </Slider>
          </div>
          <div className="divider" />
        </div>
      }
      {currentCategory && categoryFeaturedProducts && categoryFeaturedProducts.length > 0 &&
        <div>
          <div className="featured-products-wrapper">
            <ScrollableGallery title={galleryTitle} hasMoreItems={hasMoreItems} onScroll={loadProducts}>
              {
                categoryFeaturedProducts.map((model) => {
                  return <ProductItem
                      key={model.ID}
                      model={model} detailed
                      productNameLines="2"
                      descriptionLines="4"
                      url={getIsNGProduct(model)
                        ? urlGenerator.get({ page: 'products', id: model.FriendlyID, name: decodeStringForURL(model.Name) })
                        : urlGenerator.get({ page: 'product', id: model.FriendlyID, name: decodeStringForURL(model.Name) })
                      }
                    />
                })
              }
            </ScrollableGallery>
          </div>
        </div>
      }
      <Slot name="category_bottom" />
    </Layout>
  )
}

export default Category
