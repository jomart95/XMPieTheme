import {
  action,
  computed,
  makeObservable,
  observable,
} from 'mobx'
import CartErrorModel from './CartErrorModel'
import CartItemPriceModel from './CartItemPriceModel'
import CartListModel from './CartListModel'
import moment from 'moment'
import { t } from '$themelocalization'

class CartItemModel {
  constructor ({
    cartModel,
    listModel,
    orderItemId,
    originalOrderFriendlyId = null,
    listId,
    checked,
    quantity,
    thumbnailUrl,
    editUrl,
    nickname,
    quantityPerRecipient,
    numRecipients,
    catalogNumber,
    defaultQuantity,
    product,
    properties = [],
    displayOrder = 0,
    subItems = [],
    proof = {},
    attributes = [],
  }) {
    this._cartModel = cartModel
    this._listModel = listModel
    this.displayOrder = displayOrder
    this.orderItemId = orderItemId
    this.originalOrderFriendlyId = originalOrderFriendlyId
    this.listId = listId
    this.checked = checked
    this.quantity = quantity
    this.thumbnailUrl = thumbnailUrl
    this.editUrl = editUrl
    this.nickname = nickname
    this.quantityPerRecipient = quantityPerRecipient
    this.numRecipients = numRecipients
    this.catalogNumber = catalogNumber
    this.defaultQuantity = defaultQuantity
    this.product = product
    this.properties = properties
    this.errors = []
    this.warnings = []
    this.price = new CartItemPriceModel({ itemModel: this })
    this.subItems = subItems
    this.proof = proof
    this.attributes = attributes

    makeObservable(this, {
      _listModel: observable,
      orderItemId: observable,
      originalOrderFriendlyId: observable,
      listId: observable,
      checked: observable,
      quantity: observable,
      thumbnailUrl: observable,
      editUrl: observable,
      nickname: observable,
      quantityPerRecipient: observable,
      numRecipients: observable,
      catalogNumber: observable,
      defaultQuantity: observable,
      product: observable,
      properties: observable,
      price: observable,
      errors: observable,
      warnings: observable,
      proof: observable,
      attributes: observable,
      addValidation: action,
      updateListId: action,
      toggleSelect: action,
      delete: action,
      moveItemToWishlist: action,
      moveItemToCart: action,
      reAssign: action,
      reAssignToNew: action,
      updateNickname: action,
      updateValidations: action,
      setProofStatus: action,
      duplicate: action,
      affectsPricing: computed,
      hasPricing: computed,
      hasUSAData: computed,
      isCOD: computed,
      hasItemsOffline: computed,
      isOffline: computed,
    })
    this.setProofStatus({Status: proof?.proofStatus, ThumbnailUrl: this.thumbnailUrl})
  }

  addValidation (validation) {
    if (validation.Error.Level === CartErrorModel.CART_ERROR_LEVELS.ERROR) {
      this.errors.push(new CartErrorModel({
        errorLevel: validation.Error.Level,
        message: validation.Error.Message,
        errorType: validation.Error.Type,
      }))
    }
    if (validation.Error.Level === CartErrorModel.CART_ERROR_LEVELS.WARNING) {
      this.warnings.push(new CartErrorModel({
        errorLevel: validation.Error.Level,
        message: validation.Error.Message,
        errorType: validation.Error.Type,
      }))
    }
  }

  updateListId (listId) {
    this.listId = listId
  }

  async toggleSelect () {
    try {
      await this._cartModel._cartActionsModel.updateItem(this.orderItemId, {checked: !this.checked})
      this.checked = !this.checked
    } catch (error) {
      console.error(error)
    }
  }

  async delete () {
    try {
      await this._cartModel._cartActionsModel.deleteItem(this)
      await this._cartModel.removeItems([this.orderItemId])
      this._listModel.touchItemsCount()
      const newCount = this._listModel.itemsCount
      if (newCount) {
        this._listModel.touchSortingDate()
        this._listModel.touchModificationDate()
        if (!this._listModel.isWishList && this.checked) {
          await this._cartModel.updateCart()
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  async moveItemToWishlist () {
    try {
      await this._cartModel._cartActionsModel.moveItemToWishlist(this.orderItemId, this.checked)
      this._cartModel.moveItemToWishList(this)
      if (this.checked) {
        await this._cartModel.updateCart()
      }
    } catch (error) {
      console.error(error)
    }
  }

  async moveItemToCart () {
    try {
      await this._cartModel._cartActionsModel.moveItemToCart(this.orderItemId)
      this.checked = true

      this._cartModel.moveItemToCart(this)
      await this._cartModel.updateCart()
    } catch (error) {
      console.error(error)
    }
  }

  async reAssign (listId) {
    try {
      const listIdOrNull = listId === CartListModel.CART_LIST_TYPES.UNASSIGNED ? null : listId
      await this._cartModel._cartActionsModel.reAssignItemToList(this.orderItemId, listIdOrNull)
      this.listId = listId
      this._listModel.updateListFromApi({ ItemsCount: this._listModel.itemsCount - 1 })
      this._listModel.touchSortingDate()
      this._listModel.touchModificationDate()
      const targetList = this._cartModel.lists.find(list => list.id === listId)
      if (targetList) {
        targetList.touchSortingDate()
        targetList.touchModificationDate()
      }
      await this._cartModel.refreshListsEligibleCount()
      this._cartModel.openList(listId)
    } catch (error) {
      console.error(error)
    }
  }

  async reAssignToNew (title) {
    try {
      const { ID } = await this._cartModel._cartActionsModel.reAssignItemToNewList(this.orderItemId, title)
      this.listId = ID
      this._listModel.touchModificationDate()
      this._cartModel.addList({
        listId: ID,
        title,
        itemsCount: 0,
        skipLoading: true,
        sortingDate: moment().utc().toISOString(),
        modificationDate: moment().utc().toISOString(),
      })
      await this._cartModel.refreshListsEligibleCount()
      this._cartModel.openList(ID)
    } catch (error) {
      console.error(error)
    }
  }

  edit () {
    this._cartModel._storeData.navigate(this.editUrl)
  }

  async updateNickname (nickname) {
    try {
      const listId = this._listModel.isUnassigned || this._listModel.isDefault || this._listModel.isWishList ? null : this._listModel.id
      await this._cartModel._cartActionsModel.updateItem(this.orderItemId, {
        nickname,
        listId: this._cartModel.isSingleListMode ? undefined : listId
      })
      this._listModel.touchModificationDate()
      this._listModel.touchSortingDate()
      this.nickname = nickname
    } catch (e) {
      console.error(e)
    }
  }

  updateValidations (validations) {
    this.errors =
      validations
        .filter((validation) => validation.Error.Level === CartErrorModel.CART_ERROR_LEVELS.ERROR)
        .map(validation => new CartErrorModel({
          errorLevel: validation.Error.Level,
          message: validation.Error.Message,
          errorType: validation.Error.Type,
          notAvailableCount: validation.Error.Data?.NotAvailableCount,
        }))
    const priceChangedWarning = this.warnings.filter(warning => warning.errorType === CartErrorModel.CART_ERROR_TYPES.ProductPriceChanged)
    const newValidations = validations
      .filter((validation) => validation.Error.Level === CartErrorModel.CART_ERROR_LEVELS.WARNING)
      .map(validation => new CartErrorModel({
        errorLevel: validation.Error.Level,
        message: validation.Error.Message,
        errorType: validation.Error.Type,
      }))
    this.warnings = [...priceChangedWarning, ...newValidations]
    this.setProofStatus({Status: this.proof?.proofStatus, ThumbnailUrl: this.thumbnailUrl})
  }

  setProofStatus (status) {
    this.proof.Status = status.Status
    if (status.Status === 2) {
      this.thumbnailUrl =  status.ThumbnailUrl.startsWith('/v1') ?`${this._cartModel._storeData.storeApiUrl}/${status.ThumbnailUrl}`: status.ThumbnailUrl
    }
    if (status.Status === 3) {

      this.warnings = [...this.warnings.filter(w => w.errorType !== 997), new CartErrorModel({
        errorLevel: CartErrorModel.CART_ERROR_LEVELS.WARNING,
        message: t('Cart.Item.Warning.FailedProof'),
        errorType: 997,
      })]
    }
  }

  async duplicate () {
    try {
      await this._cartModel._cartActionsModel.duplicateItem(this.orderItemId)
    } catch (e) {
      return e
    }
  }

  get affectsPricing () {
    return this._listModel.affectPricing
  }

  get hasPricing () {
    return this.product.hasPricing
  }

  get hasUSAData () {
    return this.attributes.some(attribute => attribute.Name === 'HasUSADATA' && attribute.Value.toLowerCase() === 'true')
  }

  get isCOD () {
    return this.attributes.some(attribute => attribute.Name === 'IsCOD' && attribute.Value.toLowerCase() === 'true')
  }

  get hasItemsOffline () {
    return this.errors.some(err => err.errorType === CartErrorModel.CART_ERROR_TYPES.ProductComponentNotAvailable)
  }

  get isOffline () {
    return this.errors.some(err => err.errorType === CartErrorModel.CART_ERROR_TYPES.ProductNotAvailable)
  }

  get itemsCountEligibleForDuplicate() {
    return this.subItems.length - this.errors?.[0]?.notAvailableCount || 0
  }
}

export default CartItemModel
