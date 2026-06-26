import {
  computed,
  makeObservable,
  observable
} from 'mobx'
import CartListModel from './CartListModel'

class CartSummaryModel {
  constructor({
    cartModel,
  }) {
    this._cartModel = cartModel
    this.loading = true
    makeObservable(this, {
      _cartModel: observable,
      loading: observable,
      totalItemsCount: computed,
      selectedItemsCount: computed,
      totalWishListItemsCount: computed,
      showTax: computed,
      hasErrors: computed,
      hasWarnings: computed,
      subtotal: computed,
      tax: computed,
      total: computed,
      presentablePrices: computed,
      exportSuccess: computed,
    })
  }

  get exportSuccess() {
    return this._cartModel.openedList?.exportSuccess
  }

  get totalItemsCount() {
    return this._cartModel.items.filter((item) => item.affectsPricing).length ?? 0
  }

  get selectedItemsCount() {
    if (this._cartModel.isListsMode && this._cartModel.openedList?.id !== CartListModel.CART_LIST_TYPES.UNASSIGNED) {
      return this._cartModel.openedListItems?.length ?? 0
    } else if (this._cartModel.isListsMode && this._cartModel.openedList?.id === CartListModel.CART_LIST_TYPES.UNASSIGNED) {
      return this._cartModel[CartListModel.CART_LIST_TYPES.UNASSIGNED].items.filter((item) => item.affectsPricing && item.checked).length ?? 0
    } else if (this._cartModel.isSingleListMode) {
      return this._cartModel.items.length ?? 0
    }

    return this._cartModel.items.filter((item) => item.affectsPricing && item.checked).length ?? 0
  }

  get totalWishListItemsCount() {
    return this._cartModel[CartListModel.CART_LIST_TYPES.WISHLIST]?.items?.length ?? 0
  }

  get showTax() {
    return !this._cartModel.affectPricingLists.every((list) => list.items?.every?.(item => item.price.tax == null))
  }

  get hasErrors() {
    if (this._cartModel.isListsMode) {
      return this._cartModel.openedList?.items?.some(item => item.errors.length > 0 && (this._cartModel.openedList.isUnassigned ? item.checked : true))
    }
    return this._cartModel.affectPricingLists.some((list) => list.items.some(item => item.errors.length > 0 && item.checked))
  }

  get hasWarnings() {
    if (this._cartModel.isListsMode) {
      return this._cartModel.openedList?.items?.some(item => item.warnings.length > 0 && (this._cartModel.openedList.isUnassigned ? item.checked : true))
    }
    return !this.hasErrors && this._cartModel.affectPricingLists.some((list) => list.items.some(item => item.warnings.length > 0 && item.checked))
  }

  get subtotal() {
    if (this._cartModel.isListsMode && this._cartModel.openedList?.isUnassigned) {
      return this._cartModel.openedList?.items?.reduce((total, item) => item.checked && item.affectsPricing ? total + item.price.subtotal : total, 0)
    } else if (this._cartModel.isListsMode || this._cartModel.isSingleListMode) {
      return this._cartModel.openedList?.items?.reduce((total, item) => total + item.price.subtotal, 0)
    }
    return this._cartModel.items?.reduce((total, item) => item.checked && item.affectsPricing ? total + item.price.subtotal : total, 0)
  }

  get tax() {
    if (this._cartModel.isListsMode && this._cartModel.openedList?.isUnassigned) {
      return this._cartModel.openedList?.items?.reduce((total, item) => item.checked && item.affectsPricing ? total + item.price.tax : total, 0)
    } else if (this._cartModel.isListsMode || this._cartModel.isSingleListMode) {
      return this._cartModel.openedList?.items?.reduce((total, item) => total + item.price.tax, 0)
    }
    return this._cartModel.items?.reduce((total, item) => item.checked && item.affectsPricing ? total + item.price.tax : total, 0)
  }

  get total() {
    return this.subtotal + this.tax
  }

  get presentablePrices() {
    return {
      subtotal: this.subtotal?.toFixed(2),
      tax: this.tax?.toFixed(2),
      total: this.total?.toFixed(2),
    }
  }
}

export default CartSummaryModel
