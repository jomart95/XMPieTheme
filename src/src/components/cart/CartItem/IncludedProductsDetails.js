import React, {useContext, useRef, useState} from 'react'
import {observer} from 'mobx-react-lite'
import { useClickOutside } from '$themehooks'
import { RootDocumentContext } from '$themeservices'
import { t } from '$themelocalization'
import './ProductProperties.scss'
import './IncludedProductsDetails.scss'


const IncludedProductsDetails = ({includedProducts}) => {
    const {documentRoot} = useContext(RootDocumentContext)()
    const [isDetailseOpened, setIsDetailseOpened] = useState(false)
    const details = useRef(null)

    useClickOutside(details, () => setIsDetailseOpened(false), documentRoot)

    const getProductQuantity = (item) => {
        let productQuantity = item.Quantity
        if (productQuantity > 1) {
            productQuantity += ` ${item.Product.Unit.PackType ? item.Product.Unit.PackType.PluralName : item.Product.Unit.ItemType.PluralName}`
        } else {
            productQuantity += ` ${item.Product.Unit.PackType ? item.Product.Unit.PackType.Name : item.Product.Unit.ItemType.Name}`
        }
        if (item.Product.Unit.PackType) {
            productQuantity += ` (${item.Product.Unit.ItemQuantity} ${item.Product.Unit.ItemType.PluralName} / ${item.Product.Unit.PackType.Name})`
        }
        return productQuantity
    }
    const titleClickHandler = (e) => {
        setIsDetailseOpened(!isDetailseOpened)
        e.stopPropagation()
    }

    return (
        <>
            {
                includedProducts.length > 0 && <div className="included-products-details">
                    <span className="mobile title" onClick={titleClickHandler}>{t('Cart.Item.IncludedProducts', { count: includedProducts.length })}</span>
                    <span className="desktop title"> {t('Cart.Item.IncludedProducts', { count: includedProducts.length })}</span>
                    <div ref={details} className={`details ${isDetailseOpened ? 'show' : ''}`}>
                        <div className={`scroll-wrapper ${includedProducts.length > 3 ? 'scroll-able' : ''}`}>
                            {includedProducts.map((item, index) =>
                                <div className="product-detail" key={index}>
                                    <div className="product-name">{item.Product.Name}</div>
                                    <div className="product-quantity">{getProductQuantity(item)}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default observer(IncludedProductsDetails)
