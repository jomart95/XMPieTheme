import { action, makeObservable, observable } from 'mobx'
import { UStoreProvider } from '@ustore/core'
import CartListModel from './CartListModel'
import { activityMonitor } from '$themeservices'

class CartActionsModel {
  constructor({
    cartModel,
  }) {
    this._cartModel = cartModel
    this.intervalId = null
    this.apiCallEmitted = false
    makeObservable(this, {
      _cartModel: observable,
      apiCallEmitted: observable,
      startTimer: action,
      emitApiCall: action,
      endApiCall: action,
    })
  }

  startTimer() {
    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        this._cartModel.loading = !!this.apiCallEmitted;
      }, 2000)
    }
  }

  stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  emitApiCall({summaryLoader} = {summaryLoader: true}) {
    this._cartModel.summary.loading = summaryLoader
    this.apiCallEmitted = true
    this.startTimer()
    return Date.now()
  }

  async endApiCall(now) {
    this._cartModel.loading = false
    this._cartModel.summary.loading = false
    this._cartModel.affectPricingLists.forEach((list) => {
      list.loading = false
    })
    this.apiCallEmitted = false
    this.stopTimer()
    if (Date.now() - now < 3000) {
      await new Promise(resolve => setTimeout(() => {
        resolve()
      }, 3000 - (Date.now() - now)))
    }
  }

  async toggleSelectList(orderItemIds, checked) {
    try {
      this.emitApiCall()
      await Promise.all(orderItemIds.map(async orderItemId => {
        await this._cartModel._uStoreProvider.api.orders.updateCartItem(
          orderItemId,
          {
            IsChecked: checked,
            Nickname: null
          }
        )
      }))
      await this.updateCartListOnSelectionChange()
    } catch (error) {
      console.error(error)
    } finally {
      this.endApiCall()
    }
  }

  async updateItem(orderItemId, {checked = null, nickname = null, listId = null } ) {
    try {
      this.emitApiCall()
      await this._cartModel._uStoreProvider.api.orders.updateCartItem(
        orderItemId,
        {
          ListID: listId || undefined,
          IsChecked: checked === null ? undefined : checked,
          Nickname: nickname === null ? undefined : nickname,
        }
      )
      if (checked !== null && this._cartModel.isWishListMode) {
        await this.updateCartListOnSelectionChange(!checked)
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.endApiCall()
    }
  }

  async emptyList(listId, itemsIds = null) {
    try {
      this.emitApiCall()
      if (listId === CartListModel.CART_LIST_TYPES.WISH_LIST) {
        await this._cartModel._uStoreProvider.api.orders.clearWishlist(itemsIds)
      } else if (listId === CartListModel.CART_LIST_TYPES.DEFAULT){
        await this._cartModel._uStoreProvider.api.orders.clearCart(itemsIds)
        await this._cartModel._uStoreProvider.state.store.loadCartItemsCount()
      } else {
        if (!itemsIds || itemsIds.length === 0) {
          const { Items } = await this._cartModel._uStoreProvider.api.orders.getCartInfo(listId)
          itemsIds = Items.map(item => item.OrderItemID)
        }
        if (itemsIds.length > 0) {
          await this._cartModel._uStoreProvider.api.orders.clearCart(itemsIds, listId)
        }
        await this._cartModel._uStoreProvider.state.store.loadCartItemsCount()
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.endApiCall()
    }
  }

  async deleteItem(item) {
    const now = this.emitApiCall({summaryLoader: !item.checked ? false : !item._listModel.isWishList})
    try {
      await this._cartModel._uStoreProvider.api.orders.deleteCartItem(item.orderItemId)
      await this._cartModel._uStoreProvider.state.store.loadCartItemsCount()
    } catch (error) {
      console.error(error)
    } finally {
      await this.endApiCall(now)
    }
  }

  async moveItemToWishlist(orderItemId, checked) {
    const now = this.emitApiCall({summaryLoader: false})
    try {
      await UStoreProvider.api.orders.saveForLater(orderItemId)
      await this._cartModel._uStoreProvider.state.store.loadCartItemsCount()
    } catch (error) {
      console.error(error)
    } finally {
      await this.endApiCall(now)
    }
  }

  async moveItemToCart(orderItemId) {
    const now = this.emitApiCall()
    try {
      await UStoreProvider.api.orders.addToCart(orderItemId)
      await this._cartModel._uStoreProvider.state.store.loadCartItemsCount()
      const cartValidation = await this._cartModel._uStoreProvider.api.orders.validateCart(true)
      this._cartModel.updateCartValidation(cartValidation)
    } catch (error) {
      console.error(error)
    } finally {
      await this.endApiCall(now)
    }
  }

  async updateCartListOnSelectionChange(recheckUnselected = false) {
    try {
      this.emitApiCall()
      const cartPricing = await this._cartModel._uStoreProvider.api.orders.getCartPricingInfo(true)
      const checkedCartValidation = await this._cartModel._uStoreProvider.api.orders.validateCart(true)
      const uncheckedCartValidation = recheckUnselected ? await this._cartModel._uStoreProvider.api.orders.validateCart(false) : []
      this._cartModel.updateCartPricing(cartPricing.Items)
      this._cartModel.updateCartValidation([...checkedCartValidation, ...uncheckedCartValidation])
    } catch (error) {
      console.error(error)
    } finally {
      this.endApiCall()
    }
  }

  async updateCart(selectedOnly = true) {
    try {
      this.emitApiCall()
      const cartItemsFromApi = await this._cartModel._uStoreProvider.api.orders.getCartInfo()
      const wishlistItemsFromApi = await this._cartModel._uStoreProvider.api.orders.getWishListInfo()
      let items = [...cartItemsFromApi.Items, ...wishlistItemsFromApi.Items]
      if (selectedOnly) {
        items = items.filter(item => item.checked)
      }
      this._cartModel.updateCartItems(items)
      const cartPricing = await this._cartModel._uStoreProvider.api.orders.getCartPricingInfo(true)
      const wishlistPricing = await this._cartModel._uStoreProvider.api.orders.getWishListPricingInfo(true)

      let pricingItems = []
      if (selectedOnly) {
        pricingItems = [...cartPricing.Items, ...wishlistPricing.Items]
      } else {
        const cartPricingUnchecked = await this._cartModel._uStoreProvider.api.orders.getCartPricingInfo(false)
        const wishlistPricingUnchecked = await this._cartModel._uStoreProvider.api.orders.getWishListPricingInfo(false)
        pricingItems = [
          ...cartPricing.Items,
          ...wishlistPricing.Items,
          ...cartPricingUnchecked.Items,
          ...wishlistPricingUnchecked.Items
        ]
      }
      this._cartModel.updateCartPricing(pricingItems)

      const cartValidation = await this._cartModel._uStoreProvider.api.orders.validateCart(true)
      const wishlistValidation = await this._cartModel._uStoreProvider.api.orders.validateWishList(true)
      let validationItems = []
      if (selectedOnly) {
        validationItems = [...cartValidation, ...wishlistValidation]
      } else {
        const cartValidationUnchecked = await this._cartModel._uStoreProvider.api.orders.validateCart(false)
        const wishlistValidationUnchecked = await this._cartModel._uStoreProvider.api.orders.validateWishList(false)
        validationItems = [
          ...cartValidation,
          ...wishlistValidation,
          ...cartValidationUnchecked,
          ...wishlistValidationUnchecked
        ]
      }

      this._cartModel.updateCartValidation(validationItems)

      await this._cartModel._uStoreProvider.state.store.loadCartItemsCount()
    } catch (error) {
      console.error(error)
    } finally {
      this.endApiCall()
    }
  }

  async reAssignList(oldListId, targetListId, checkedOnly = false) {
    try {
      this.emitApiCall()
      const orderItems = this._cartModel.lists
        .find((list) => list.id === oldListId)?.items
        ?.filter((item) => checkedOnly ? item.checked : true)
        ?.map((item) => ({
          OrderItemID: item.orderItemId,
          ListID: targetListId,
          Nickname: null,
        }))
      await this._cartModel._uStoreProvider.api.orders.updateCart({
        Items: orderItems,
        updateLists: true,
      })
    } catch (error) {
      console.error(error)
    } finally {
      this.endApiCall()
    }
  }

  async deleteList(listId) {
    try {
      this.emitApiCall()
      await this._cartModel._uStoreProvider.api.orders.deleteList(listId)
      await this._cartModel.removeItems(this._cartModel.lists.find(list => list.id === listId).items.map(item => item.orderItemId))
    } catch (error) {
      console.error(error)
    } finally {
      this.endApiCall()
    }
  }

  async addList(title, items) {
    try {
      this.emitApiCall()
      const { ID } = await this._cartModel._uStoreProvider.api.orders.createCartList(title)
      await this._cartModel._uStoreProvider.api.orders.updateCart({
        Items: items.map((item) => ({
          OrderItemID: item.orderItemId,
          ListID: ID,
        }))
      })
      return { ID }
    } catch (error) {
      console.error(error)
    } finally {
      this.endApiCall()
    }
  }

  async reAssignItemToList(orderItemId, targetListId) {
    try {
      this.emitApiCall()
      await this._cartModel._uStoreProvider.api.orders.updateCartItem(
        orderItemId,
        {
          ListID: targetListId,
        }
      )
    } catch (error) {
      console.error(error)
    } finally {
      this.endApiCall()
    }
  }

  async reAssignItemToNewList(orderItemId, title) {
    try {
      this.emitApiCall()
      const { ID } = await this._cartModel._uStoreProvider.api.orders.createCartList(title)
      const selectedItem = this._cartModel.items.find(item => item.orderItemId === orderItemId)
      if (selectedItem?.listId) {
        const currentList = this._cartModel.lists.find(list => list.id === selectedItem.listId)
        currentList?.touchSortingDate()
      }
      await this._cartModel._uStoreProvider.api.orders.updateCartItem(
        orderItemId,
        {
          ListID: ID,
        }
      )
      return { ID }
    } catch (error) {
      console.error(error)
    } finally {
      this.endApiCall()
    }
  }

  async exportList(listId) {
    try {
      this.emitApiCall()
      return await this._cartModel._uStoreProvider.api.orders.exportList(listId)
    } catch (error) {
      console.error(error)
    } finally {
      this.endApiCall()
    }
  }

  async renameList(listId, title) {
    try {
      this.emitApiCall()
      return await this._cartModel._uStoreProvider.api.orders.renameList(listId, title)
    } catch (error) {
      console.error(error)
    } finally {
      this.endApiCall()
    }
  }

  async duplicateItem(orderItemId) {
    try {
      this.emitApiCall()
      const { ActivityID } = await this._cartModel._uStoreProvider.api.orders.duplicateItem(orderItemId)
      activityMonitor.addActivity(ActivityID, orderItemId)
      this._cartModel.setActivities({[ActivityID]:  {entityId: orderItemId, activity: {ActivityID, Status: 1}}})
    } catch (error) {
      throw error
    } finally {
      this.endApiCall()
    }
  }

  async duplicateList(listId) {
    try {
      this.emitApiCall()
      const {ActivityID} =  await this._cartModel._uStoreProvider.api.orders.duplicateList([listId])
      activityMonitor.addActivity(ActivityID, listId)
      this._cartModel.setActivities({[ActivityID]:  {entityId: listId, activity: {ActivityID, Status: 1}}})
    } catch (error) {
      throw error
    } finally {
      this.endApiCall()
    }
  }
}

export default CartActionsModel
