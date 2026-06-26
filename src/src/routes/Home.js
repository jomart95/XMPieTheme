import React, { useEffect, useState } from 'react'

import { UStoreProvider } from '@ustore/core'
import { t } from '$themelocalization'

import { Slot } from '$core-components'
import Layout from '../components/layout'
import PromotionItem from '../components/products/PromotionItem'
import Hero from '../components/home/Hero'
import CategoryAccordion from '../components/home/CategoryAccordion'
import FeaturedProducts from '../components/home/FeaturedProducts'
import HowItWorks from '../components/home/HowItWorks'
import { Slider } from '$core-components'

import { decodeStringForURL } from '$ustoreinternal/services/utils'
import { getVariableValue } from '$ustoreinternal/services/cssVariables'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import './Home.scss'

const Home = (props) => {
  const { customState: { categories } } = props

  const [promotionItemButtonUrl, setPromotionItemButtonUrl] = useState('')

  const promotionItemImageUrl = getVariableValue('--homepage-carousel-slide-1-image', require(`$assets/images/banner_image.png`), true)
  const promotionItemTitle = getVariableValue('--homepage-carousel-slide-1-main-text', t('PromotionItem.Title'))
  const promotionItemSubtitle = getVariableValue('--homepage-carousel-slide-1-sub-text', t('PromotionItem.Subtitle'))
  const promotionItemButtonText = getVariableValue('--homepage-carousel-slide-1-button-text', t('PromotionItem.Button_Text'))

  useEffect(() => {
    return () => {
      clearCustomState()
    }
  }, [])

  useEffect(() => {
    if (categories && categories.length && !promotionItemButtonUrl) {
      const { FriendlyID, Name } = categories[0]
      const defaultURL = urlGenerator.get({ page: 'category', id: FriendlyID, name: decodeStringForURL(Name) })
      setPromotionItemButtonUrl(getVariableValue('--homepage-carousel-slide-1-button-url', defaultURL, false, true))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.customState, categories])

  if (!props.state) {
    return null
  }

  return (
    <Layout {...props} className="home">
      <Slot name="homepage_top"/>
      <Hero />
      <div className="promotion-wrapper">
        <Slider>
          <PromotionItem
            imageUrl={promotionItemImageUrl}
            title={promotionItemTitle}
            subTitle={promotionItemSubtitle}
            buttonText={promotionItemButtonText}
            url={promotionItemButtonUrl}
          />
        </Slider>
      </div>

      <CategoryAccordion />
      <FeaturedProducts />
      <HowItWorks />

      <Slot name="homepage_bottom"/>
    </Layout>
  )

}

export default Home

function clearCustomState () {
  UStoreProvider.state.customState.delete('homeFeaturedProducts')
  UStoreProvider.state.customState.delete('homeFeaturedCategory')
  UStoreProvider.state.customState.delete('currentProduct')
  UStoreProvider.state.customState.delete('currentOrderItem')
  UStoreProvider.state.customState.delete('currentOrderItemId')
  UStoreProvider.state.customState.delete('currentOrderItemPriceModel')
  UStoreProvider.state.customState.delete('lastOrder')
  UStoreProvider.state.customState.delete('currentProductThumbnails')
}
