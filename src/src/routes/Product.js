import React, { useEffect } from 'react'
import Legacy from './Legacy'
import {UStoreProvider} from "@ustore/core";
import { useParams } from 'react-router-dom'


const Product = (props) => {
  const params = useParams()

  useEffect(() => {
    (async () => {
      const productID = await UStoreProvider.api.products.getProductIDByFriendlyID(params.id)
      const currentProduct = await UStoreProvider.api.products.getProductByID(productID, false)
      UStoreProvider.state.customState.setBulk({ currentProduct })
    })()
    return () => {
      UStoreProvider.state.customState.delete('currentProduct')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!props.customState?.currentProduct) {
    return null
  }
  return <Legacy {...props}/>
}
export default Product
