import {
  action,
  computed,
  makeObservable,
  observable
} from 'mobx'
import moment from 'moment'
import { t } from '$themelocalization'
import { UStoreProvider } from '@ustore/core'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import CartSummaryModel from './CartSummaryModel'
import CartItemModel from './CartItemModel'
import CartProductModel from './CartProductModel'
import CartListModel from './CartListModel'
import CartItemPriceModel from './CartItemPriceModel'
import CartErrorModel from './CartErrorModel'
import CartProductUnitModel from './CartProductUnitModel'
import CartActionsModel from './CartActionsModel'
import CartOrderApprovalModel from './CartOrderApprovalModel'
import {proofThumbnailUpdater,activityMonitor, ActivityType, CART_MODE} from '$themeservices'
import CartDialogsModel from './CartDialogsModel'
import {formatDate} from './utils';

class CartModel {
  static CART_ACTIONS = {
    INIT: 'init',
    TOGGLE_SELECT_ALL: 'toggleSelectAll',
    TOGGLE_SELECT_ITEM: 'toggleSelectItem',
    EMPTY_LIST: 'emptyList',
    MOVE_ITEM_TO_WISH_LIST: 'moveItemToWishlist',
    MOVE_ITEM_TO_CART: 'moveItemToCart',
    DELETE_ITEM_FROM_CART: 'deleteItemFromCart',
    EDIT_CART_ITEM: 'editCartItem',
    CHANGE_NICKNAME: 'changeNickname',
  }

  static CART_MODELS = {
    CART: 'cart',
    WISH_LIST: 'wishList',
    CART_VALIDATION: 'cartValidation',
    WISH_LIST_VALIDATION: 'wishListValidation',
    PRICING: 'pricing',
    PRICING_NO_API: 'pricingNoApi',
  }

  static CART_SORT_BY = {
    DATE : 'date',
    NAME_ASC : 'nameAsc',
    NAME_DESC : 'nameDesc',
  }

  constructor ({
    cartMode = CART_MODE.Aspx,
    UStoreProvider,
    storeBaseUrl,
    storeLanguageCode,
    storeApiUrl,
    navigate,
    searchParams,
  }) {
    this._uStoreProvider = UStoreProvider
    this._cartActionsModel = new CartActionsModel({
      cartModel: this,
    })
    this._storeData = {
      navigate,
      storeBaseUrl,
      storeLanguageCode,
      storeApiUrl,
    }
    this._cartMode = cartMode
    this._openedListId = CartListModel.CART_LIST_TYPES.UNASSIGNED
    this._lists = []
    this.shoppingCartText = ''
    this.checkoutUrl = ''
    this.items = []
    this.summary = new CartSummaryModel({
      cartModel: this,
    })
    this.initiated = false
    this.loading = false
    this.errors = []
    this.listOpening = false
    this.sorting =  this._uStoreProvider.state.get()?.currentUser?.Preferences?.cartSorting || CartModel.CART_SORT_BY.DATE
    this.activities = {}
    this.searchParams = searchParams
    this._cartDialogs = new CartDialogsModel({})

    makeObservable(this, {
      _uStoreProvider: observable,
      _openedListId: observable,
      initiated: observable,
      _lists: observable,
      shoppingCartText: observable,
      checkoutUrl: observable,
      items: observable,
      summary: observable,
      loading: observable,
      errors: observable,
      listOpening: observable,
      sorting: observable,
      activities: observable,
      initialLoadItemsFromApi: action,
      loadListsItemsFromApi: action,
      loadSingleListItemsFromApi: action,
      loadCartItemsFromApi: action,
      updateListItemsFromApi: action,
      updateLists: action,
      createCartList: action,
      loadPricingFromApi: action,
      loadWishListItemsFromApi: action,
      updateCartItems: action,
      updateCartPricing: action,
      updateCartValidation: action,
      addList: action,
      createList: action,
      addCartError: action,
      removeItems: action,
      moveItemToCart: action,
      touchLists:action,
      openList: action,
      deleteList: action,
      revertModifications: action,
      setSorting: action,
      setActivities: action,
      clearActivities: action,
      lists: computed,
      selected: computed,
      storeBaseUrl: computed,
      languageCode: computed,
      storeApiUrl: computed,
      noPricing: computed,
      hasEditOrApproval: computed,
      hasReorder: computed,
      affectPricingItems: computed,
      isListsMode: computed,
      isWishListMode: computed,
      isSingleListMode: computed,
      openedListItems: computed,
      openedList: computed,
      listsItemsCount: computed,
      [CartListModel.CART_LIST_TYPES.DEFAULT]: computed,
      [CartListModel.CART_LIST_TYPES.WISH_LIST]: computed,
      [CartListModel.CART_LIST_TYPES.UNASSIGNED]: computed,
      duplicationLimit: computed,
    }, {autoBind: true})
  }

  async init () {
    // Load cart items count - doesn't need to wait for it
    UStoreProvider.state.store.loadCartItemsCount()

    if (this.isWishListMode) {
      // Load cart items
      await this.initialLoadCartModeWishList()

      // Load cart items pricing
      const cartPricingFromApiChecked = await this._uStoreProvider.api.orders.getCartPricingInfo(true, null)
      this.loadPricingFromApi(cartPricingFromApiChecked)
      const cartPricingFromApiUnchecked = await this._uStoreProvider.api.orders.getCartPricingInfo(false, null)
      this.loadPricingFromApi(cartPricingFromApiUnchecked)

      // Load cart items validation
      const cartValidationFromApiChecked = await this._uStoreProvider.api.orders.validateCart(true, null)
      this.loadValidationFromApi(cartValidationFromApiChecked)
      const cartValidationFromApiUnchecked = await this._uStoreProvider.api.orders.validateCart(false, null)
      this.loadValidationFromApi(cartValidationFromApiUnchecked)
    } else if (this.isListsMode) {
      // Load unassigned items
      await this.initialLoadCartModeLists()

    } else if (this.isSingleListMode) {
      // Load single list items
      await this.initialLoadCartModeSingleList()

      // Load single list items pricing
      const cartPricingFromApiChecked = await this._uStoreProvider.api.orders.getCartPricingInfo(null, null)
      this.loadPricingFromApi(cartPricingFromApiChecked)

      // Load single list items validation
      const cartValidationFromApiChecked = await this._uStoreProvider.api.orders.validateCart(null, null)
      this.loadValidationFromApi(cartValidationFromApiChecked)
    }

    this._lists.forEach(list => {
      list.loading = false
    })
    this.summary.loading = false

    // Load wishlist
    if (this.isWishListMode) {
      await this.initialLoadWishlist()
    }

    proofThumbnailUpdater.init(this)
    this.initiated = true
  }

  async initialLoadCartModeLists () {
    // load unassigned items
    await this.loadListsItemsFromApi()
  }

  async initialLoadCartModeSingleList () {
    // load single list items
    await this.loadSingleListItemsFromApi()
  }

  async initialLoadCartModeWishList () {
    // load cart items
    await this.loadCartItemsFromApi()
  }

  async initialLoadWishlist () {
    // Load wish list items
    const wishlistItems = await this.loadWishListItemsFromApi()
    if (wishlistItems.length === 0) {
      return
    }
    // Load wish list validation
    const wishListValidationFromApi = await this._uStoreProvider.api.orders.validateWishList()
    this.loadValidationFromApi(wishListValidationFromApi)

    // Load wish list pricing
    const wishListPricingFromApi = await this._uStoreProvider.api.orders.getWishListPricingInfo()
    this.loadPricingFromApi(wishListPricingFromApi)
  }

  async initialLoadItemsFromApi () {
    if (this._cartMode === CART_MODE.Lists) {
      await this.initialLoadCartModeLists()
    } else if (this._cartMode === CART_MODE.WishList) {
      await this.initialLoadCartModeWishList()
    }
  }

  async loadListsItemsFromApi () {
    const lists = await this._uStoreProvider.api.orders.getLists()
    lists.forEach((list) => this._lists.push(this.createList({
            listId: list.ID || CartListModel.CART_LIST_TYPES.UNASSIGNED,
            title: list.Name || t('Cart.UnassignedItemsListTitle'),
            emptyAllText: null,
            originalOrderFriendlyId: list.OriginalOrderFriendlyID,
            itemsCount: list.ItemsCount || 0,
            eligibleItemsCount: list.EligibleItemsCount || 0,
            sortingDate: list?.SortingDate,
            modificationDate: list?.ModificationDate,
            exportedList: list.ExportDate ? {
              ExternalUrl: list.ExternalUrl,
              ExportDate: list.ExportDate
            } : null
          })))
    this.listOpening = true
    if (this.searchParams.has('ListID')) {
      this.openList(this.searchParams.get('ListID'))
      return
    }
    const openListId = lists.reduce((acc, list) => {
      return  moment(list.SortingDate).isAfter(moment(acc.sortingDate)) ?
        {id: list.ID || CartListModel.CART_LIST_TYPES.UNASSIGNED, sortingDate: list.SortingDate} : acc
    }, {id: CartListModel.CART_LIST_TYPES.UNASSIGNED, sortingDate: moment({y: 1970, month:1, d:1})}).id
    this.openList(openListId)
  }

  async loadSingleListItemsFromApi () {
    const { Items, Activities: activities } = await this._uStoreProvider.api.orders.getCartInfo()
    const list = (await this._uStoreProvider.api.orders.getLists())[0]
    this._openedListId = list.ID
    const singleList = this.createList({
      listId: list.ID,
      title: list.Name,
      emptyAllText: null,
      originalOrderFriendlyId: list.OriginalOrderFriendlyID,
      itemsCount: list.ItemsCount,
      eligibleItemsCount: list.EligibleItemsCount || 0,
      sortingDate: list.SortingDate,
      modificationDate: list.ModificationDate,
      exportedList: list.ExportDate ? {
        ExternalUrl: list.ExternalUrl,
        ExportDate: list.ExportDate
      } : null,
      activities,
    })
    this._lists.push(singleList)
    this.items = this.convertItemsToCartItemsObject(Items, [singleList], list.ID)
  }

  async loadCartItemsFromApi() {
    let req = await this._uStoreProvider.api.orders.getCartInfo()
    let { Items, Description, CheckoutUrl, OrderApproval, Activities } = req
    this.shoppingCartText = Description
    if (CheckoutUrl) {
      const qs = CheckoutUrl.split('?')[1]
      this.checkoutUrl = `${urlGenerator.get({ page: 'checkout-final' })}?${qs}`
    }
    const orderApproval = OrderApproval
      ? new CartOrderApprovalModel({
        originalOrderFriendlyId: OrderApproval.OriginalOrderFriendlyID,
        originalOrderId: OrderApproval.OriginalOrderID,
      })
      : null
    if (orderApproval) {
      Items = Items.map(item => ({ ...item, OriginalOrderFriendlyID: orderApproval.originalOrderFriendlyId }))
    }
    const editSections = new Set(Items.filter(item => {
      if (orderApproval?.originalOrderFriendlyId) {
        return item.OriginalOrderFriendlyID != null && item.OriginalOrderFriendlyID !== orderApproval?.originalOrderFriendlyId
      }
      return false
    }).map(item => item.OriginalOrderFriendlyID || orderApproval?.originalOrderFriendlyId))

    const listIds = orderApproval ? [] :
      Array.from(Items.reduce((acc, item) => {
        if (item.OriginalOrderFriendlyID && !acc.has(item.OriginalOrderFriendlyID)) {
          acc.set(item.OriginalOrderFriendlyID, 1)
        } else if (!item.OriginalOrderFriendlyID && !acc.has(CartListModel.CART_LIST_TYPES.DEFAULT)) {
          acc.set(CartListModel.CART_LIST_TYPES.DEFAULT, 1)
        }
        return acc
      },new Map()).keys())
      .filter(originalOrderFriendlyId => !editSections.has(originalOrderFriendlyId)
      )

    if (!listIds.includes(CartListModel.CART_LIST_TYPES.DEFAULT)) {
      listIds.push(CartListModel.CART_LIST_TYPES.DEFAULT)
    }
    const cartList = this.createCartList([...editSections], orderApproval, listIds, Activities)
    this.items = this.convertItemsToCartItemsObject(Items, cartList, null)
    this._lists.push(...cartList)
  }

  async updateListItemsFromApi (listId, list = null) {
    const listIdOrNull = listId === CartListModel.CART_LIST_TYPES.UNASSIGNED || listId === CartListModel.CART_LIST_TYPES.DEFAULT || list?.isReorder ? null : listId
    let { Items, Activities } = await this._uStoreProvider.api.orders.getCartInfo(listIdOrNull)

    //for update after duplicate item we filter our items with originalOrderFriendlyId
    if (list?.isReorder || list?.isDefault) {
      Items = Items.filter(item => !item.OriginalOrderFriendlyID)
    }

    // collect items that have not been loaded from the api
    const selectedListItems = Items.reduce((acc, item) => ({ ...acc, [item.OrderItemID]: item }), {})
    const itemsNotInList = this.items.filter(item => !selectedListItems[item.orderItemId])

    // add activities to activity monitor
    activityMonitor.addActivityList(Activities)

    // update the list of items + convert new items that were just loaded
    this.items = [...itemsNotInList, ...this.convertItemsToCartItemsObject(Items, this._lists, list?.isReorder ? CartListModel.CART_LIST_TYPES.DEFAULT : listId)]

    // for default list we need to update the items count
    if (list?.isDefault) {
      list.touchItemsCount()
    }

    // if we are duplicating an item on a reorder list we need to update the items count, sorting date and
    // modification date of the default list and put the default list at the top of the lists array
    if (list?.isReorder) {
      const defaultList = this._lists.find(list => list.isDefault)
      defaultList.touchItemsCount()
      defaultList.touchSortingDate()
      defaultList.touchModificationDate()

      this._lists = [defaultList, ...this._lists.filter(notDefaultList => !notDefaultList.isDefault)]
    }

    if (this.isWishListMode) {
      const { Items: checkedPricingInfo } = await this._uStoreProvider.api.orders.getCartPricingInfo(true, listIdOrNull)
      const { Items: uncheckedPricingInfo } = await this._uStoreProvider.api.orders.getCartPricingInfo(false, listIdOrNull)
      const pricingInfo = [...checkedPricingInfo, ...uncheckedPricingInfo]
      this.updateCartPricing(pricingInfo)
      const checkedValidationInfo = await this._uStoreProvider.api.orders.validateCart(true, listIdOrNull)
      const uncheckedValidationInfo = await this._uStoreProvider.api.orders.validateCart(false, listIdOrNull)
      const validationInfo = [...checkedValidationInfo, ...uncheckedValidationInfo]
      this.updateCartValidation(validationInfo)
    } else {
      if (list && this.isListsMode) {
        list.touchSortingDate()
        list.touchModificationDate()
        list.touchItemsCount()
      }
      const { Items: pricingInfo } = await this._uStoreProvider.api.orders.getCartPricingInfo(null, listIdOrNull)
      this.updateCartPricing(pricingInfo, true)
      const validationInfo = await this._uStoreProvider.api.orders.validateCart(null, listIdOrNull)
      this.updateCartValidation(validationInfo)
    }
  }

  async updateLists () {
    const lists = await this._uStoreProvider.api.orders.getLists()
    if (lists.length === 0) {
      this._lists = []
      return
    }
    this._lists.forEach((list) => {
      const updatedList = lists.find((updatedList) => updatedList.ID === list.id)
      if (updatedList) {
        list.updateListFromApi(updatedList)
      }
    })
  }

  createCartList (editSections, orderApproval, listIds, activities = []) {
    const cartList = []
    const defaultList = this.createList({
      listId: CartListModel.CART_LIST_TYPES.DEFAULT,
      title: t('Cart.SelectAllLabel'),
      emptyAllText: t('Cart.EmptyCartButton'),
      activities,
    })

    listIds.forEach((originalOrderId) => cartList.push(
      originalOrderId === CartListModel.CART_LIST_TYPES.DEFAULT ?
        defaultList :
        this.createList(
          {
            listId: originalOrderId,
            title: t('Cart.EditOrderSectionTitle', { orderNumber: originalOrderId }),
            emptyAllText: '',
            originalReorderOrderFriendlyId: originalOrderId,
          }))
    )

    if (orderApproval) {
      cartList.push(this.createList(
        {
          listId: CartListModel.CART_LIST_TYPES.ORDER_APPROVAL,
          title: t('Cart.OrderApprovalSectionTitle', { orderNumber: orderApproval.originalOrderFriendlyId }),
          emptyAllText: t('Cart.OrderApprovalEmptyCartTitle'),
          orderApproval
        }))
    }
    if (editSections) {
      editSections.forEach(originalOrderFriendlyId => {
        cartList.push(this.createList({
          listId: CartListModel.CART_LIST_TYPES.ORDER_EDIT,
          title: t('Cart.EditOrderSectionTitle', { orderNumber: originalOrderFriendlyId }),
          emptyAllText: '',
          originalOrderFriendlyId
        }))
      })
    }
    return cartList
  }

  loadPricingFromApi (pricingItems) {
    pricingItems.Items.forEach(priceItem => {
      const cartItem = this.items.find(cartItem => cartItem.orderItemId === priceItem.OrderItemID)
      if (cartItem) {
        cartItem.price = new CartItemPriceModel({
          itemModel: cartItem,
          isChanged: priceItem.IsChanged,
          isValid: priceItem.IsValid,
          orderItemId: priceItem.OrderItemID,
          subtotal: priceItem.Price,
          tax: priceItem.Tax,
        })
      }
    })
  }

  loadValidationFromApi (validation) {
    validation.forEach(validationItem => {
      const item = this.items.find(item => item.orderItemId === validationItem.OrderItemID)
      // In case orderItemId in error response is null, the error is a cart-level error
      if (item instanceof CartItemModel) {
        item.addValidation(validationItem)
      } else if (item === undefined) {
        this.addCartError(validationItem)
      }
    })
  }

  convertItemToCartItemObject (item, list, displayOrder = 0) {
    return new CartItemModel({
      cartModel: this,
      listModel: list,
      displayOrder,
      orderItemId: item.OrderItemID,
      originalOrderFriendlyId: item.OriginalOrderFriendlyID,
      listId: item.ListID ?? list.id,
      checked: item.Checked,
      quantity: item.Quantity,
      thumbnailUrl: item.Thumbnail?.Url ? `${this._storeData.storeApiUrl}/${item.Thumbnail.Url}` : null,
      editUrl: urlGenerator.get({ page: 'products' }).replace('/products', item.EditUrl),
      nickname: item.Nickname,
      quantityPerRecipient: item.QuantityPerRecipient,
      numRecipients: item.NumRecipients,
      proof: {
        proofStatus: item.ProofStatus,
      },
      product: new CartProductModel({
        productId: item.ProductID,
        name: item.Product.Name,
        catalogNumber: item.Product.CatalogNumber,
        unit: new CartProductUnitModel({
          quantity: item.Product.Unit.ItemQuantity,
          singular: item.Product.Unit.ItemType.Name,
          plural: item.Product.Unit.ItemType.PluralName,
          packSingular: item.Product.Unit.PackType?.Name,
          packPlural: item.Product.Unit.PackType?.PluralName,
        }),
        hasPricing: item.Product.HasPricing,
      }),
      properties: item.Properties.map(property => ({
        name: property.Name,
        value: property.ConvertToClientTimeZone ? formatDate(property.Value) : property.Value,
      })),
      subItems: item.SubItems,
      attributes: item.Attributes,
    })
  }

  convertItemsToCartItemsObject (items, lists, listId = null) {
    const listById = lists.reduce((acc, list) => ({ ...acc, [list.id]: list }), {})
    const listByOriginalOrderFriendlyId = lists.reduce((acc, list) => ({ ...acc, [list.originalOrderFriendlyId]: list }), {})
    const listByOriginalReorderOrderFriendlyId = lists.reduce((acc, list) => ({ ...acc, [list.originalReorderOrderFriendlyId]: list }), {})

    return items.map((item, index) => {
      let list = listById[item.ListID] ||
        listByOriginalOrderFriendlyId[item.OriginalOrderFriendlyID] ||
        listById[listId] ||
        listByOriginalReorderOrderFriendlyId[item.OriginalOrderFriendlyID]

      if (!list) {
        list = this.isWishListMode ? listById[CartListModel.CART_LIST_TYPES.DEFAULT] : listById[CartListModel.CART_LIST_TYPES.UNASSIGNED]
      }
      return this.convertItemToCartItemObject(item, list, index)
    })
  }

  convertItemsToWishlistItemsObject (items, list) {
    return items.map(item => this.convertItemToCartItemObject(item, list))
  }

  async loadWishListItemsFromApi () {
    const { Items } = await this._uStoreProvider.api.orders.getWishListInfo()
    const wishList = this.createList({
      listId: CartListModel.CART_LIST_TYPES.WISH_LIST,
      title: t('Cart.Wishlist.WishListTitle'),
      emptyAllText: t('Cart.EmptyCartButton'),
      affectPricing: false,
    })
    this._lists.push(wishList)
    const wishListItems = this.convertItemsToWishlistItemsObject(Items, wishList)

    this.items.push(...wishListItems)
    return wishListItems
  }

  /**
   * Wishlist mode - Update cart should be called in the following events:
   * 1. Before checkout - selected only
   * 2. Selecting/unselecting items - selected only
   * 3. Moving and item to/from wish list - selected only
   * 4. Deleting an item/emptying the cart - selected only
   *
   * Lists mode - update cart should be called in the following events:
   * 1. Selecting/unselecting items - unassigned only
   * 2. Moving an item to another list/to a new list
   * 3. Deleting an item
   */
  async updateCart ({ selectedOnly, listId , updateLists  } = {selectedOnly :true, listId : null, updateLists: false}) {
    try {
      if (this.isWishListMode) {
        await this._cartActionsModel.updateCart(selectedOnly)
      } else if (this.isListsMode) {
        await this.updateListItemsFromApi(listId || this.openedList?.id)
        updateLists && await this.updateLists()
      }
    } catch (error) {
      console.error(error)
    }
  }

  updateCartItems (itemsFromApi) {
    this.items = this.items.map((item) => {
      const itemFromApi = itemsFromApi.find(itemFromApi => itemFromApi.OrderItemID === item.orderItemId)
      return itemFromApi ? this.convertItemToCartItemObject(itemFromApi, this[CartListModel.CART_LIST_TYPES.DEFAULT]) : item
    })
  }

  updateCartPricing (priceItems) {
    this.items.forEach(item => {
      const priceItem = priceItems.find(priceItem => priceItem.OrderItemID === item.orderItemId)
      priceItem && item.price.updateFromApi(priceItem)
    })
  }

  updateCartValidation (validations) {
    this.errors = []
    const cartValidations = validations.filter(validation => validation.OrderItemId == null)
    cartValidations.forEach(validation => this.addCartError(validation))

    this.items.forEach(item => {
      const itemValidations = validations.filter(validation => validation.OrderItemID === item.orderItemId)
      if (itemValidations.length) {
        item.updateValidations(itemValidations)
      } else {
        item.updateValidations([])
      }
    })
  }

  addList(options) {
    const list = this.createList(options)
    const unassignedListIndex = this._lists.findIndex(list => list.id === CartListModel.CART_LIST_TYPES.UNASSIGNED)
    if (this.isListsMode && unassignedListIndex > -1) {
      this._lists.splice(unassignedListIndex + 1, 0, list)
    } else {
      this._lists.unshift(list)
    }
    return list
  }

  createList ({
    listId, title, emptyAllText, affectPricing = true, originalOrderFriendlyId = null, itemsCount = null,
    exportedList = null, skipLoading = false, orderApproval = null, sortingDate = null, modificationDate = null, activities = [],
    originalReorderOrderFriendlyId = null, eligibleItemsCount
  }) {
    const list = new CartListModel({
      cartModel: this,
      id: listId,
      title,
      emptyAllText,
      affectPricing,
      originalOrderFriendlyId,
      itemsCount,
      exportedList,
      skipLoading,
      orderApproval,
      sortingDate,
      modificationDate,
      originalReorderOrderFriendlyId,
      eligibleItemsCount
    })
    activityMonitor.addActivityList(activities)
    return list
  }

  async refreshListsEligibleCount () {
    if (!this.isListsMode) return
    const lists = await this._uStoreProvider.api.orders.getLists()
    const listsEligibleCount = lists.reduce((acc, list) => {
      acc[list.ID] = list.EligibleItemsCount || 0
      return acc
    }, {})

    this._lists.forEach(list => {
      if (list.id in listsEligibleCount) {
        list.eligibleItemsCount = listsEligibleCount[list.id]
      }
    })
  }

  addCartError (error) {
    if (this.errors.some(err => err.errorType === error.Error.Type)) return
    this.errors.push(new CartErrorModel({
      errorLevel: error.Error.Level,
      message: error.Error.Message,
      errorType: error.Error.Type,
    }))
  }

  async removeItems (orderItemIds) {
    this.items = this.items.filter(item => !orderItemIds.includes(item.orderItemId))
    await this.refreshListsEligibleCount()
  }

  moveItemToCart (item) {
    const cartList = this[CartListModel.CART_LIST_TYPES.DEFAULT]
    cartList.items.forEach(cartItem => cartItem.displayOrder++)
    const originalList = item._listModel
    const list =
      item.originalOrderFriendlyId
        ? this._lists.find(list => list.originalOrderFriendlyId === item.originalOrderFriendlyId)
        : cartList
    item.listId = list.id
    item._listModel = list
    item.displayOrder = 0
    cartList.touchItemsCount()
    originalList.touchItemsCount()
  }

  moveItemToWishList (item) {
    const wishList = this[CartListModel.CART_LIST_TYPES.WISH_LIST]
    wishList.items.forEach(cartItem => cartItem.displayOrder++)
    const originalList = item._listModel
    item.displayOrder = 0
    item.updateValidations([])
    item.listId = wishList.id
    item._listModel = wishList
    item.originalOrderFriendlyId = null
    if (originalList.items.length === 0 && !originalList.isWishList && !originalList.isDefault) {
      this.deleteList(originalList.id)
    }
    wishList.touchItemsCount()
    originalList.touchItemsCount()
  }

  deleteList (listId) {
    this._lists = this._lists.filter(list => list.id !== listId)
  }

  async openList (listId) {
    try {
      this.listOpening = true
      this._openedListId = listId
      if (listId !== null) {
        await this.updateListItemsFromApi(listId)
      }
    } catch (e) {
      console.error(e)
    } finally {
      this.listOpening = false
    }
  }

  get lists () {
    if (!this.isListsMode) {
      return this._lists
    }
    const sorted = [...this._lists].sort((a, b) => {
        if (a.id === CartListModel.CART_LIST_TYPES.UNASSIGNED) {
          return -1
        } else if (b.id === CartListModel.CART_LIST_TYPES.UNASSIGNED) {
          return 1
        }

        if (this.sorting === CartModel.CART_SORT_BY.NAME_ASC) {
          return a.title.toLowerCase().localeCompare(b.title.toLowerCase())
        }

      if (this.sorting === CartModel.CART_SORT_BY.NAME_DESC) {
        return b.title.toLowerCase().localeCompare(a.title.toLowerCase())
      }

        return moment(b.sortingDate).toDate().valueOf() - moment(a.sortingDate).toDate().valueOf()
      }
    )

    return sorted
  }

  get selected () {
    return this.items.filter(item => item.checked)
  }

  get storeBaseUrl () {
    return this._storeData.storeBaseUrl
  }

  get languageCode () {
    return this._storeData.storeLanguageCode
  }

  get storeApiUrl () {
    return this._storeData.storeApiUrl
  }

  get noPricing () {
    return this.affectPricingLists.some((list) => list.noPricing)
  }

  get hasEditOrApproval () {
    return this._lists.some(list => list.originalOrderFriendlyId != null)
  }

  get hasReorder () {
    return this._lists.some(list => list.isReorder)
  }

  get affectPricingItems () {
    return this.items.filter(item => item.affectsPricing)
  }

  get affectPricingLists () {
    return this.lists.filter(list => list?.affectPricing)
  }

  get isListsMode () {
    return this._cartMode === CART_MODE.Lists || localStorage.getItem('features.CartLists') === 'true'
  }

  get isWishListMode () {
    return this._cartMode === CART_MODE.WishList
  }

  get isSingleListMode () {
    return this._cartMode === CART_MODE.SingleList
  }

  get openedListItems () {
    if (this._openedListId === null) return null
    return this.items.filter(item => item.listId === this._openedListId)
  }

  get openedList () {
    return this._lists.find(list => list.id === this._openedListId) ?? null
  }

  get listsItemsCount () {
    return this._lists.reduce((total, list) => total + list.itemsCount, 0)
  }

  get [CartListModel.CART_LIST_TYPES.DEFAULT] () {
    return this._lists.find(list => list.id === CartListModel.CART_LIST_TYPES.DEFAULT) ?? null
  }

  get [CartListModel.CART_LIST_TYPES.WISH_LIST] () {
    return this._lists.find(list => list.id === CartListModel.CART_LIST_TYPES.WISH_LIST) ?? null
  }

  get [CartListModel.CART_LIST_TYPES.UNASSIGNED] () {
    return this._lists.find(list => list.id === CartListModel.CART_LIST_TYPES.UNASSIGNED) ?? null
  }

   get duplicationLimit () {
    return (async () => {
      const duplicationMaxItems = UStoreProvider.state.get().currentStore.Attributes.find((attr) => attr.Name === "DuplicationMaxItems")?.Value || 0
      const currentList = this.lists.find((list) => list.isOpen)
      const eligibleForDuplicateItemsSum = await currentList?.eligibleForDuplication
      return eligibleForDuplicateItemsSum > duplicationMaxItems ? duplicationMaxItems : null
    })()
  }

  async checkout () {
    await this.updateCart()
    if (this.summary.hasErrors) {
      return
    }
    this._storeData.navigate(this.checkoutUrl)
  }

  async revertModifications () {
    await this._uStoreProvider.api.orders.revertModifications()
    this.items = this.items.filter(item => item._listModel.id !== CartListModel.CART_LIST_TYPES.ORDER_APPROVAL)
    this._uStoreProvider.state.store.loadCartItemsCount()
    this._lists = this._lists.filter(list => list.id !== CartListModel.CART_LIST_TYPES.ORDER_APPROVAL)
    this._cartDialogs.setRevertModifications(true)
  }

  touchLists() {
    this._lists = [...this._lists]
  }

  async setSorting(sorting) {
    this.sorting = sorting
    await this._uStoreProvider.state.store.updateUserPreferences({ cartSorting: sorting })
  }

  setActivities(activities) {
    Object.entries(activities).forEach(([key, value]) => {
      if (this.activities[key]) {
        this.activities[key].activity = value.activity
      } else {
        this.activities[key] = value
      }
    })
  }

  clearActivities() {
    this.activities = {}
  }

  async reloadAfterDuplicate(activityId) {
    const activity = this.activities[activityId]
    if (activity) {
      this.clearActivities()
      if ([ActivityType.OrderItemDuplication, ActivityType.KitOrderItemDuplication].includes(activity.activity.Type) && this.isListsMode) {
        const duplicatedItem = this.items.find(item => item.orderItemId === activity.entityId)
        if (duplicatedItem) {
          await this.updateListItemsFromApi(duplicatedItem._listModel.id, duplicatedItem._listModel)
          await this.refreshListsEligibleCount()
          UStoreProvider.state.store.loadCartItemsCount()
        }
      } else {
        this._lists = []
        await this.init()
      }
    }
  }
}

export default CartModel
