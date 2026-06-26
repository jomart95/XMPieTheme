import {
  action,
  computed,
  makeObservable,
  observable
} from 'mobx'
import moment from 'moment'
import { UStoreProvider } from '@ustore/core'
import location from '$ustoreinternal/services/locationProvider'


class CartListModel {
  static CART_LIST_TYPES = {
    DEFAULT: 'default',
    ORDER_EDIT: 'orderEdit',
    WISH_LIST: 'wishList',
    ORDER_APPROVAL: 'orderApproval',
    UNASSIGNED: 'unassigned',
  }

  constructor ({
    id,
    cartModel,
    title,
    emptyAllText,
    affectPricing = true,
    originalOrderFriendlyId = null,
    originalReorderOrderFriendlyId = null,
    itemsCount = null,
    exportedList = null,
    skipLoading = false,
    orderApproval = null,
    sortingDate = null,
    modificationDate = null,
    eligibleItemsCount,
  }) {
    this._cartModel = cartModel
    this._itemsCount = itemsCount
    this.loading = !skipLoading
    this.id = id
    this.title = title
    this.emptyAllText = emptyAllText
    this.affectPricing = affectPricing
    this.orderApproval = orderApproval
    this.originalOrderFriendlyId = originalOrderFriendlyId || orderApproval?.originalOrderFriendlyId
    this.originalReorderOrderFriendlyId = originalReorderOrderFriendlyId
    this.exportSuccess = exportedList ? {justLoaded: false, ...exportedList} : null
    this.exportError = false
    this.exportSuccessMessage = false
    this.sortingDate = sortingDate
    this.modificationDate = modificationDate
    // this flag is used to determine if the list was modified after export
    // it is to solve a time dilation issue between the client and the server
    this.isModified = false
    this.eligibleItemsCount = eligibleItemsCount
    makeObservable(this, {
      _cartModel: observable,
      _itemsCount: observable,
      loading: observable,
      id: observable,
      title: observable,
      emptyAllText: observable,
      affectPricing: observable,
      originalOrderFriendlyId: observable,
      exportSuccess: observable,
      exportError: observable,
      exportSuccessMessage: observable,
      sortingDate: observable,
      modificationDate: observable,
      isModified: observable,
      items: computed,
      selected: computed,
      noPricing: computed,
      isOpen: computed,
      itemsCount: computed,
      isDefault: computed,
      isUnassigned: computed,
      isWishList: computed,
      isModifiedAfterExport: computed,
      isExported: computed,
      isOrderEdit: computed,
      isOrderApproval: computed,
      isEmpty: computed,
      isReorder: computed,
      hasItemsOffline: computed,
      hasUSAData: computed,
      isCOD: computed,
      eligibleForDuplication: computed,
      duplicationLimit: computed,
      toggleSelectAll: action,
      emptyList: action,
      reAssign: action,
      reAssignToNew: action,
      deleteList: action,
      updateListFromApi: action,
      export: action,
      clearExportError: action,
      clearExportSuccessMessage: action,
      touchSortingDate: action,
      touchItemsCount: action,
      rename: action,
      duplicate: action,
      eligibleItemsCount: observable,

    })
  }

  get items () {
    return this._cartModel.items
      .filter(
        (item) => {
          if (this.originalOrderFriendlyId) {
            return item.originalOrderFriendlyId === this.originalOrderFriendlyId && item.listId === this.id
          }
          return  (this.originalReorderOrderFriendlyId !== null && this.originalReorderOrderFriendlyId ===  item.originalOrderFriendlyId) || item.listId === this.id
        }
      )
      .sort((a, b) => a.displayOrder - b.displayOrder)
  }

  get selected () {
    return this.items.filter(item => item.checked).map(item => item.orderItemId)
  }

  get noPricing () {
    return this.affectPricing && this.items.some(item => item.price.subtotal == null && item.checked && item.hasPricing)
  }

  get isOpen () {
    return this._cartModel.openedList?.id === this.id
  }

  get itemsCount () {
    if (this._cartModel.listOpening) {
      return this._itemsCount
    }
    if (this.isOpen || this._itemsCount == null || typeof(this._itemsCount) === 'undefined') {
      this._itemsCount = this.items.length
    }

    return this._itemsCount
  }

  get isDefault () {
    return this.id === CartListModel.CART_LIST_TYPES.DEFAULT
  }

  get isUnassigned () {
    return this.id === CartListModel.CART_LIST_TYPES.UNASSIGNED
  }

  get isWishList () {
    return this.id === CartListModel.CART_LIST_TYPES.WISH_LIST
  }

  get isOrderEdit() {
    return this.id === CartListModel.CART_LIST_TYPES.ORDER_EDIT
  }

  get isOrderApproval() {
    return this.id === CartListModel.CART_LIST_TYPES.ORDER_APPROVAL
  }

  get isReorder() {
    return this.id === this.originalReorderOrderFriendlyId
  }

  get isExported () {
    return !!this.exportSuccess
  }

  get isEmpty() {
    return this.items.length === 0
  }

  get isModifiedAfterExport () {
    if (!this.exportSuccess) {
      return false
    }
    if (this.isModified) {
      return true
    }
    const { ExportDate } = this.exportSuccess
    if (ExportDate && this.modificationDate) {
      return moment(this.modificationDate).isAfter(moment(ExportDate))
    }
    return !ExportDate
  }

  get hasItemsOffline() {
    return this.items.some(item => item.isOffline || item.hasItemsOffline)
  }

  get hasUSAData(){
    return this.items.some(item => item.hasUSAData)
  }

  get isCOD(){
    return this.items.some(item => item.isCOD)
  }

  get duplicationLimit() {
    return UStoreProvider.state.get().currentStore.Attributes.find((attr) => attr.Name === "DuplicationMaxItems")?.Value || 0
  }

  get eligibleForDuplication() {
    const duplicationMaxItems = UStoreProvider.state.get().currentStore.Attributes.find((attr) => attr.Name === "DuplicationMaxItems")?.Value || 0
    return (!this.items.length || this.eligibleItemsCount < duplicationMaxItems) ? null : duplicationMaxItems
  }

  async toggleSelectAll () {
    try {
      const checked = this.items.every(item => item.checked)
      await this._cartModel._cartActionsModel.toggleSelectList(this.items.map((item) => item.orderItemId), !checked)
      this.items.forEach(item => {
        item.checked = !checked
      })
    } catch (error) {
      console.error(error)
    }
  }

  async emptyList () {
    try {
      const orderItemIds = this.items.map(item => item.orderItemId)
      if (this.id === CartListModel.CART_LIST_TYPES.WISH_LIST
        || (this.id === CartListModel.CART_LIST_TYPES.DEFAULT && this._cartModel.affectPricingLists.length === 1)
      ) {
        await this._cartModel._cartActionsModel.emptyList(this.id, null)
      } else {
        await this._cartModel._cartActionsModel.emptyList(this.id, orderItemIds)
      }
      await this._cartModel.removeItems(orderItemIds)
      this._itemsCount = 0
      if (this.isReorder) {
        this._cartModel.deleteList(this.id)
      }
    } catch (error) {
      console.error(error)
    }
  }

  async reAssign (listId, checkedOnly = false) {
    try {
      await this._cartModel._cartActionsModel.reAssignList(this.id, listId, checkedOnly)
      const currentList = this._cartModel.lists.find(list => list.id === listId)
      currentList.touchSortingDate()
      this._itemsCount = this.items.filter((item) => !item.checked).length
      this.items
        .filter(item => checkedOnly ? item.checked : true)
        .forEach(item => item.updateListId(listId))
      const targetList = this._cartModel.lists.find(list => list.id === listId)
      if (targetList) {
        targetList.touchSortingDate()
        targetList.touchModificationDate()
        this._cartModel.openList(targetList.id)
      }
      await this._cartModel.refreshListsEligibleCount()
    } catch (error) {
      console.error(error)
    }
  }

  async reAssignToNew (title, checkedOnly = false) {
    try {
      const { ID } = await this._cartModel._cartActionsModel.addList(title,
        this.items.filter(item => checkedOnly ? item.checked : true))
      const newList = this._cartModel.addList({ listId: ID, title, emptyAllText: null, itemsCount: 0, modificationDate: moment().utc().toISOString() })
      this.items
        .filter(item => checkedOnly ? item.checked : true)
        .forEach(item => item.updateListId(ID))
      newList.updateListFromApi({ ItemsCount: this._itemsCount })
      this._itemsCount = 0
      newList.loading = false
      await this._cartModel.updateCart({ listId: ID })
      this._cartModel.openList(ID)
      await this._cartModel.refreshListsEligibleCount()
    } catch (error) {
      console.error(error)
    }
  }

  async deleteList () {
    try {
      if (this.isUnassigned) {
        await this._cartModel._cartActionsModel.emptyList(this.id)
        await this._cartModel.removeItems(this.items.map(item => item.orderItemId))
      } else {
        await this._cartModel._cartActionsModel.deleteList(this.id)
        await this._cartModel.removeItems(this.items.map(item => item.orderItemId))
        this._cartModel.deleteList(this.id)
      }
    } catch (error) {
      console.error(error)
    }
  }

  async rename(title) {
    try {
      await this._cartModel._cartActionsModel.renameList(this.id, title)
      this.touchModificationDate()
      this.touchSortingDate()
      this._cartModel.touchLists()
      this.title = title
    } catch (error) {
      console.error(error)
    }
  }

  async duplicate() {
    try {
      await this._cartModel._cartActionsModel.duplicateList(this.id)
    } catch (error) {
      return error
    }
  }

  async export () {
    try {
      const res = await this._cartModel._cartActionsModel.exportList(this.id)
      if (res) {
        this.exportSuccess = res
        this.exportSuccessMessage = true
        this.exportError = false
        this.isModified = false
        if (res.RedirectUrl) {
          location.href = res.RedirectUrl
        }
      } else {
        this.exportSuccess = null
        this.exportError = true
      }
    } catch (error) {
      console.error(error)
    }
  }

  updateListFromApi (list) {
    this._itemsCount = list.ItemsCount
  }

  clearExportError () {
    this.exportError = false
  }

  clearExportSuccessMessage () {
    this.exportSuccessMessage = false
  }

  touchSortingDate () {
    if (!this.isUnassigned) {
      this.sortingDate = moment().utc().toISOString()
      this._cartModel.touchLists()
    }
  }

  touchModificationDate () {
    if (!this.isUnassigned) {
      this.isModified = true
      this.modificationDate = moment().utc().toISOString()
      this._cartModel.touchLists()
    }
  }

  touchItemsCount () {
    this._itemsCount = this.items.length
  }

}

export default CartListModel
