import React, { useEffect } from 'react'
import Legacy from './Legacy'
import {UStoreProvider} from '@ustore/core'



const CheckoutComplete  = (props) => {
  useEffect(() => {
    UStoreProvider.state.store.loadCartItemsCount()
  }, [])

  return <Legacy {...props}/>
}


export default CheckoutComplete
