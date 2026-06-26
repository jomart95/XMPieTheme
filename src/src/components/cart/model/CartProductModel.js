class CartProductModel {
  constructor({
    productId,
    name,
    catalogNumber,
    unit,
    hasPricing = true,
  }) {
    this.productId = productId
    this.name = name
    this.catalogNumber = catalogNumber
    this.unit = unit
    this.hasPricing = hasPricing
  }
}

export default CartProductModel
