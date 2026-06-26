import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { t } from '$themelocalization'
import { Slider, ScrollableGallery } from '$core-components'
import { UStoreProvider } from '@ustore/core'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import { decodeStringForURL } from '$ustoreinternal/services/utils'
import Layout from '../components/layout'
import { getIsNGProduct } from '$themeservices'
import ProductItem from '../components/products/ProductItem'
import CategoryItem from '../components/category/CategoryItem'

import './Search.scss'

const PRODUCTS_PAGE_SIZE = 8

/**
 * This is the Search page
 * URL : http://<store-domain>/{language-code}/search/{search text}/
 *
 * @param {object} state - the state of the store
 */

const Search = (props) => {
  const searchValue = useParams().id
  const categories = props.customState?.categories
  const [searchResults, setSearchResults] = useState(null)
  const [searchResultsCount, setSearchResultsCount] = useState()
  const galleryTitle = searchResultsCount ? t('SearchResults.Count_products', { count: searchResultsCount }) : ''

  useEffect(() => {
    (async () => {
      const { Products: searchResults, Count: searchResultsCount } = await UStoreProvider.api.products.search(searchValue, 1, PRODUCTS_PAGE_SIZE)
      setSearchResults(searchResults)
      setSearchResultsCount(searchResultsCount)
      // Load more products if the page doesn't have a scrollbar but has more products to show
      if (searchResultsCount > searchResults?.length && document.body.scrollHeight === window.innerHeight) {
        const { Products: page2SearchResults } = await UStoreProvider.api.products.search(searchValue, 2, PRODUCTS_PAGE_SIZE)
        setSearchResults([...searchResults, ...page2SearchResults])
      }
    })()
  }, [searchValue])

  const loadProducts = async () => {
    if (searchResults?.length === searchResultsCount) return

    const nextPage = Math.ceil(searchResults.length / PRODUCTS_PAGE_SIZE) + 1
    const { Products: products } = await UStoreProvider.api.products.search(searchValue, nextPage, PRODUCTS_PAGE_SIZE)
    const joinedProducts = searchResults.concat(products)

    UStoreProvider.state.customState.set('searchResults', joinedProducts)
    setSearchResults(joinedProducts)
  }

  if (!props.state || !props.state.currentStore || !props.customState || !searchResults) {
    return null
  }

  return <Layout {...props} className='search-ng'>
      {searchResults && searchResultsCount > 0
        ? <div className="search-results">
          <div className="title main-title">{t('SearchResults.Title')}</div>
          <ScrollableGallery title={galleryTitle} hasMoreItems={true} onScroll={loadProducts}>
            {searchResults.map((model) => (
              <ProductItem
                key={model.ID}
                model={model} detailed
                productNameLines="2"
                descriptionLines="4"
                url={getIsNGProduct(model)
                  ? urlGenerator.get({ page: 'products', id: model.FriendlyID, name: decodeStringForURL(model.Name) })
                  : urlGenerator.get({ page: 'product', id: model.FriendlyID, name: decodeStringForURL(model.Name) })
                }
              />
            ))}
          </ScrollableGallery>
        </div>
        : (searchResults && !searchResults.length)
          ? <div className="no-results">
              <div className="top-section">
                <div className="title no-results-title">{t('SearchResults.No_results_title')}</div>
                <div className="no-results-subtitle">{t('SearchResults.No_results_subtitle')}</div>
              </div>
              {categories && categories.length > 0 &&
                <div className="bottom-section">
                  <div className="divider"></div>
                  <div className="title bottom-section-title">{t('SearchResults.No_results_bottom_section_title')}</div>
                  <div className="categories-wrapper">
                    <Slider multi>
                      {
                        categories.map((model) => {
                          return <CategoryItem
                            key={model.ID}
                            model={model}
                            url={urlGenerator.get({ page: 'category', id: model.FriendlyID, name: decodeStringForURL(model.Name) })} />
                        })
                      }
                    </Slider>
                  </div>
                </div>
              }
            </div>
          : null
      }
    </Layout>
}

export default Search
