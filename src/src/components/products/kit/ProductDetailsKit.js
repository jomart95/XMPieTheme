import React from 'react'
import { t } from '$themelocalization'
import { formatDateByLocale } from '$ustoreinternal/services/utils'

/**
 * A component that is loaded for displaying the main details of the kit product (name, description, reorder)
 *
 * @param {Object} props - Component properties.
 * @param {Object} props.currentProduct - The current product data object.
 * @param {string} props.currentProduct.Name - The product name (may contain HTML).
 * @param {string} [props.currentProduct.Description] - The product description (may contain HTML).
 * @param {string} props.catalogNumber - The product catalog number.
 * @param {Object} [props.lastOrder] - The last order details (if available).
 * @param {string} props.lastOrder.SubmittedDate - The date of the last order.
 * @param {boolean} props.showReorderLink - Flag to determine whether to show the reorder link.
 * @param {string} props.languageCode - The language code for date localization.
 * @param {Function} props.onReorder - The function for processing a repeat order.
 *
 *
 * @returns {JSX.Element} The markup displaying the product details.
 */

const ProductDetailsKit = (props) => {
  const {
    currentProduct,
    catalogNumber,
    lastOrder,
    showReorderLink,
    languageCode,
    onReorder
  } = props

  return (
    <div className='kit-product-details'>
      <div className='kit-name' dangerouslySetInnerHTML={{ __html: `${currentProduct.Name} ${catalogNumber}` }} />
      {lastOrder && !showReorderLink && <div className='kit-reorder'>
        {t('KitProduct.Last_order_notation', {
          OrderSubmittedDate: formatDateByLocale(lastOrder.SubmittedDate, languageCode)
        })}
        <span className='reorder-link' onClick={onReorder}>{t('KitProduct.Reorder')}</span>
      </div>}
      {currentProduct.Description && <div className='kit-description'>
        <div dangerouslySetInnerHTML={{ __html: currentProduct.Description }} />
      </div>}
    </div>
  )
}

export default ProductDetailsKit
