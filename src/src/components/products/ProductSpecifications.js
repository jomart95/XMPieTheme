import React from 'react'
import './ProductSpecifications.scss'

/**
 * Renders native product specification fields below the product columns.
 * Only fields that actually exist are shown. Custom rows (lead time,
 * brand-locked, material) get appended at the marked extension point
 * once we wire a data source — same fields a production form would need.
 */
const ProductSpecifications = ({ productModel }) => {
  if (!productModel || Object.keys(productModel).length === 0) return null

  const sku = productModel.CatalogNumber

  const unit = productModel.Unit
    ? (productModel.Unit.PackType
        ? productModel.Unit.PackType.Name
        : (productModel.Unit.ItemType ? productModel.Unit.ItemType.Name : null))
    : null

  const minQty = productModel.Configuration
    && productModel.Configuration.Quantity
    && productModel.Configuration.Quantity.Minimum

  const specs = [
    { label: 'SKU', value: sku },
    { label: 'Unit', value: unit },
    { label: 'Minimum order', value: minQty ? String(minQty) : null },
    // --- custom rows go here later, e.g.:
    // { label: 'Lead time', value: '48–72 hrs from approval' },
    // { label: 'Artwork', value: 'Brand locked' },
  ].filter(s => s.value)

  if (specs.length === 0) return null

  return (
    <section className="mcf-product-specs">
      <h2 className="mcf-product-specs-title">Product Specifications</h2>
      <table className="mcf-product-specs-table">
        <tbody>
          {specs.map(s => (
            <tr key={s.label}>
              <th scope="row">{s.label}</th>
              <td>{s.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default ProductSpecifications