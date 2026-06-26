import {
  action,
  computed,
  makeObservable,
  observable,
} from 'mobx'
import { t } from '$themelocalization'
import CartErrorModel from './CartErrorModel'

export default class CartItemPriceModel {
  constructor({
    itemModel = null,
    isChanged = null,
    isValid = null,
    orderItemId = null,
    subtotal = null,
    tax = null,
  }) {
    this._itemModel = itemModel
    this.isChanged = isChanged
    this.isValid = isValid
    this.orderItemId = orderItemId
    this.subtotal = subtotal
    this.tax = tax
    this.errors = []
    makeObservable(this, {
      isChanged: observable,
      isValid: observable,
      orderItemId: observable,
      subtotal: observable,
      tax: observable,
      errors: observable,
      total: computed,
      updateFromApi: action,
      setIsChangedWarning: action,
    })

    this.setIsChangedWarning()
  }

  get total() {
    return this.subtotal + this.tax
  }

  updateFromApi(priceItem) {
    if (!priceItem) return
    this.isChanged = priceItem.IsChanged ?? null
    this.isValid = priceItem.IsValid ?? null
    this.subtotal = priceItem.Price ?? null
    this.tax = priceItem.Tax ?? null

    this.setIsChangedWarning()
  }

  setIsChangedWarning() {
    if (this.isChanged) {
      this._itemModel.warnings.push(new CartErrorModel({
        errorLevel: CartErrorModel.CART_ERROR_LEVELS.WARNING,
        message: t('Cart.WarningPriceChanged'),
        errorType: CartErrorModel.CART_ERROR_TYPES.ProductPriceChanged,
      }))
    }
  }
}
