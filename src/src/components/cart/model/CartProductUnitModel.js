class CartProductUnitModel {
  constructor({
    quantity,
    singular,
    plural,
    packSingular,
    packPlural,
  }) {
    this.quantity = quantity
    this.singular = singular
    this.plural = plural
    this.packSingular = packSingular
    this.packPlural = packPlural
  }
}

export default CartProductUnitModel
