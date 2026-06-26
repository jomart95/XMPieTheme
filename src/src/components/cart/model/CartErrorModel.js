import { makeObservable, observable } from 'mobx'

class CartErrorModel {
  static CART_ERROR_LEVELS = {
    WARNING: 1,
    ERROR: 2,
  }

  static CART_ERROR_TYPES = {
    InventoryExceeded: 1,
    InventoryOutOfStock: 2,
    InventoryDelayed: 3,
    ProductNotAvailable: 4,
    ProductComponentNotAvailable: 5,
    MaxUnitsExceeded: 6,
    MinUnitsNotReached: 7,
    ProductUnitChanged: 8,
    MaxUnitsExceededForOrder: 9,
    RecipientListModelInvalid: 10,
    DeliveryMethodInvalid: 11,
    GdprFilesDeleted: 12,
    ProductOptionsChanged: 13,
    // ---- Local errors ----
    ProductPriceChanged: 101,
  }

  constructor({
    errorLevel,
    message,
    errorType,
    notAvailableCount,
  }) {
    this.errorLevel = errorLevel
    this.message = message
    this.errorType = errorType
    this.notAvailableCount = notAvailableCount
    makeObservable(this, {
      errorLevel: observable,
      message: observable,
      errorType: observable,
      notAvailableCount: observable,
    })
  }
}

export default CartErrorModel
