import React, { useCallback, useEffect, useRef, useState, useContext } from 'react'
import { throttle } from 'throttle-debounce'
import { UStoreProvider } from '@ustore/core'
import { t } from '$themelocalization'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LoadingDots, ButtonAria, Icon } from '$core-components'
import Popper from './Popper'
import DynamicForm from '../DynamicForm'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import theme from '$styles/theme'
import themeContext from '$ustoreinternal/services/themeContext'
import ProductDetails from '../ProductDetails'
import ProductDeliveryMethod from '../ProductDeliveryMethod'
import ProductOrderSummary from '../ProductOrderSummary'
import ProductStickyPrice from '../ProductStickyPrice'
import ProductThumbnailsPreview from '../dynamic/ProductThumbnailsPreview'
import ProductLayout from '../ProductLayout'
import Price from './Price'
import {
  convertPropertiesFromApiToPropertiesObject,
  getDependenciesObject,
  getPriceOrderItem, getReorder, pushCart,
  pushOrderItem,
  pushProperties,
  pushPropertiesState,
  pushSavedForLater,
} from './utils'
import {
  fastProofService,
  convertProductPropertiesFormIntoArray,
  preparingFormDataToSendToServer,
  productTypes,
  RootDocumentContext,
} from '$themeservices'
import { isOutOfStock } from '../Inventory'
import ProductQuantity from '../ProductQuantity'
import ProductProof from '../ProductProof'
import ProductApprovalModal from '../ProductApprovalModal'
import useErrors from './useErrors'
import useUpdateProperties from './useUpdateProperties'
import { Slot } from '$core-components'
import './ProductProperties.scss'
import './StaticProduct.scss'
import { useSticky } from './useSticky'
import Preview from '../Preview'
import { PDFViewer } from '../upload/PDFViewer'
import UEdit from '../dynamic/uedit/UEdit'
import UEditControlsPanel from '../dynamic/uedit/UEditControlsPanel'
import { createPortal } from 'react-dom'
import UeditProvider from '../dynamic/uedit/ueditProvider'
import { decodeStringForURL } from '$ustoreinternal/services/utils'
import { EasyUploadPriceAndQuantity } from '../easyUpload'

const State = {
  loading: 'LOADING',
  calculatingPrice: 'CALCULATING_PRICE',
  initial: 'INITIAL',
  clickedAddToCart: 'CLICKED_ADD_TO_CART',
  error: 'ERROR'
}

const StaticProduct = ({
                         customState,
                         state: {
                           currentCurrency,
                           currentStore: { TaxFormatType, StoreType, Attributes: StoreAttributes }
                         }
                       }) => {
  const {rootElement} = useContext(RootDocumentContext)()
  const [pageState, setPageState] = useState(State.loading)
  const [orderItem, setOrderItem] = useState(customState.currentOrderItem || {})
  const [product, setProduct] = useState(customState.currentProduct || {})
  const [productThumbnails, setProductThumbnails] = useState({})
  const [quantity, setQuantity] = useState(1)
  const [price, setPrice] = useState({})
  const [properties, setProperties] = useState({})
  const [propertiesObject, setPropertiesObject] = useState({})
  const [excelPricingEnabled, setExcelPricingEnabled] = useState(false)
  const [productDeliveries, setProductDeliveries] = useState(customState.currentDeliveryServices || null)
  const [deliveryMethod, setDeliveryMethod] = useState(null)
  const [deliveryService, setDeliveryService] = useState(null)
  const [priceError, setPriceError] = useState(null)
  const [quantityError, setQuantityError] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const [proofUrl, setProofUrl] = useState(null)
  const [proofModalOpen, setProofModalOpen] = useState(false)
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false)
  const [popperAffectedSections, setPopperAffectedSections] = useState([])
  const [popperError, setPopperError] = useState(null)
  const [postLoadingProcedures, setPostLoadingProcedures] = useState(false)
  const [forceAddToCartButtonPopper, setForceAddToCartButtonPopper] = useState(false)
  const [htmlDataUpdateTimeout, setHtmlDataUpdateTimeout] = useState(null)
  const [showLoaderDots, setShowLoaderDots] = useState(false)
  const [disabledRefreshPreviewButton, setDisabledRefreshPreviewButton] = useState(false)
  const [lastViewImageId, setLastViewImageId] = useState(0)
  const [ueditSelectedBoxId, setUeditSelectedBoxId] = useState(null)
  const [isMobile, setIsMobile] = useState(document.body.clientWidth < parseInt(theme.md.replace('px', '')))
  const [sectionToOpen, setSectionToOpen] = useState(0)
  const [searchParams, setSearchParams] = useSearchParams()
  const [poofPreviewError, setPoofPreviewError] = useState(false)
  const topMarkerRef = useRef(null)
  const easyUploadTopMarkerRef = useRef(null)
  const bottomMarkerRef = useRef(null)
  const { showStickyPrice, stickyConnect, stickyDisconnect } = useSticky(topMarkerRef, bottomMarkerRef, easyUploadTopMarkerRef)
  const topPriceRef = useRef(null)
  const bottomPriceRef = useRef(null)
  const [uEditLocks, setUEditLocks] = useState(UeditProvider.locks)
  const { addPromise } = useUpdateProperties()
  const navigate = useNavigate()
  const {
    errors,
    processErrorsOnApiResponse,
    processErrorsOnFormChange,
    processErrorsOnAddToCart,
    showAllErrors,
    excelPricingError,
    checkIsPriceAffectedWithErrors
  } = useErrors(properties)
  const [showRefreshPreview, setShowRefreshPreview] = useState(false)
  const stickyPriceRef = useRef(null)
  const [isUEditControlsVisible, setIsUEditControlsVisible] = useState(false)
  const easyUploadRefs = {
    topPriceRef,
    easyUploadTopMarkerRef,
  };
  const paramOrderItemId = searchParams.get('OrderItemId')
  const [isCartOrderItem, setIsCartOrderItem] = useState(false)
  const [isOrderItemSavedToDraft, setIsOrderItemSavedToDraft] = useState(false)
  const saveToDraftTimerRef = useRef(null);
  const showHeaderFooter = StoreType === 4 && StoreAttributes.find(attr => attr.Name === 'ShowHeaderAndFooter' && attr.Value === 'True')
  const allowSaveToDraft = (StoreType === 1 || StoreType === 2 || showHeaderFooter) && !process.env.REACT_APP_WEB_COMPONENT

  useEffect( () => {
    UStoreProvider.api.orders.getCartInfo()
      .then( ( resp ) => {
        setIsCartOrderItem( resp.Items.some(( item ) => item.OrderItemID === paramOrderItemId))
      })
  }, [paramOrderItemId])

  const checkIfThereArePropertyErrors = useCallback((updatedErrors = null, updatedProperties = null) => {
    const productErrors = updatedErrors ? { ...updatedErrors } : { ...errors }
    const propertiesToUse = updatedProperties ? convertPropertiesFromApiToPropertiesObject(updatedProperties) : propertiesObject

    return Object.keys(productErrors)
      .some((propertyId) =>
        productErrors[propertyId] &&
        productErrors[propertyId].errors &&
        productErrors[propertyId].errors.length &&
        propertiesToUse[propertyId].uiSchema['ui:options'].visible
      )
  }, [errors, propertiesObject])

  const checkIfThereAreSectionErrors = useCallback(() => {
    return Object.values(errors).some((property) => property.errors.length && property.show && property.section)
  }, [errors])

  const checkIfThereAreVisiblePropertyErrors = useCallback((updatedErrors = null) => {
    const productErrors = updatedErrors ? { ...updatedErrors } : { ...errors }
    return Object.values(productErrors).some((property) => property.errors.length && property.show)
  }, [errors])

  const calculateProperties = throttle(750, async (usedQuantity, updatedOrderItem = null, updatedProperties = null, updatedErrors = null) => {
    if (price.Price === null) return
    setPageState(State.calculatingPrice)
    const updatedPrice = await getPriceOrderItem(
      updatedOrderItem ? updatedOrderItem.ID : orderItem.ID,
      {
        ...updatedOrderItem || orderItem,
        Properties: ((updatedProperties && Object.keys(updatedProperties).length)) || (properties && Object.keys(properties).length) ? convertProductPropertiesFormIntoArray(
          updatedProperties || properties,
          excelPricingEnabled
        ) : null,
        Quantity: usedQuantity
      })
    if (updatedPrice.Price === null) {
      setPrice(updatedPrice)
      setPageState(State.initial)
      return
    }
    if (updatedErrors && updatedProperties) {
      const errorsExist = checkIfThereArePropertyErrors(updatedErrors, updatedProperties)
      if (errorsExist && (updatedPrice.Price.Price === -1 || updatedPrice.IsMinimumPrice)) {
        setPriceError('can not recalculate')
        setPostLoadingProcedures(true)
      } else if (!errorsExist && (updatedPrice.Price.Price === -1 || updatedPrice.IsMinimumPrice)) {
        setPricingError({
          ErrorCode: 'ExcelCalculation'
        })
        setPageState(State.initial)
        return
      } else if (product.Type === productTypes.DYNAMIC) {
        const keepError = Object.entries(updatedErrors).reduce((r, [key, val]) => {
          return r || (val.show && updatedProperties.JSONSchema.definitions[key]?.custom.affectPrice)
        }, false)
        if (!keepError) {
          setPriceError(null)
        }
      } else {
        setPriceError(null)
      }
    }
    setPrice(updatedPrice)
    UStoreProvider.state.customState.set('currentOrderItemPriceModel', updatedPrice)
    setPageState(State.initial)
  })

  const updateProperties = useCallback(async (changedProperties = [], updatedProperties = null, usedQuantity = null, recalculatePrice = true, updatedErrors = null) => {
    const updatedPropertiesSchema = updatedProperties || properties

    const formDataForApi = preparingFormDataToSendToServer(updatedPropertiesSchema.formData, properties)
    formDataForApi.push({
      id: 'uStoreOrderItemQuantity',
      value: usedQuantity || quantity
    })

    const handleResponse = async (response, e) => {
      if (e) {
        console.error(e)
        // Excel template V15.0 error
        setPricingError(e)
        return {
          updatedPropertiesFromApi: properties, updatedPropertiesObject: propertiesObject
        }
      }

      const updatedPropertiesObject = convertPropertiesFromApiToPropertiesObject(
        response,
        getDependenciesObject(response, excelPricingEnabled) ? getDependenciesObject(response, excelPricingEnabled).dependenciesObject : null
      )
      setProperties(response)
      setPropertiesObject(updatedPropertiesObject)

      UStoreProvider.state.customState.set('currentProductProperties', response)
      const updatedErrorsFromApi = await processErrorsOnApiResponse(
        response,
        updatedErrors || errors,
        changedProperties
      )
      if (product.Type === productTypes.DYNAMIC) {
        recalculatePrice = changedProperties.reduce((acc, propertyId) => {
          return acc || response.JSONSchema.definitions[propertyId]?.custom.affectPrice
        }, recalculatePrice)
      }

      if (recalculatePrice && !checkIfThereAreVisiblePropertyErrors(updatedErrorsFromApi)) {
        calculateProperties(usedQuantity || quantity, null, response, updatedErrorsFromApi)
      }
      return { updatedPropertiesFromApi: response, updatedPropertiesObject }
    }

    addPromise(pushPropertiesState(
      orderItem.ID,
      formDataForApi
    ), handleResponse)

    return { updatedPropertiesFromApi: properties, updatedPropertiesObject: propertiesObject }
  }, [addPromise, calculateProperties, checkIfThereAreVisiblePropertyErrors, errors, excelPricingEnabled, orderItem.ID,
    processErrorsOnApiResponse, properties, propertiesObject, quantity, product.Type])

  const createPreview = useCallback(async (propsFromApiToPropsObject, orderItemId = null, propertiesFromApi = null) => {
    let loadingTimeout = null
    setDisabledRefreshPreviewButton(() => true)
    const propsForProof = preparingFormDataToSendToServer(Object.values(propsFromApiToPropsObject).reduce((r, p) => ({
      ...r,
      [p.id]: p.value
    }), {}), propertiesFromApi || properties)
    fastProofService.onError = () => {
      setDisabledRefreshPreviewButton(() => false)
      fastProofService.breakCurrentLoop()
      setPoofPreviewError(true)
      loadingTimeout && clearTimeout(loadingTimeout)
      setShowLoaderDots(false)
    }

    fastProofService.onProof = async (proof) => {
      setDisabledRefreshPreviewButton(() => false)
      const fileNames = proof.Items.map((p) => ({ Url: p.Url.replace(/.*?fileName=(.*)$/, '$1') }))
      let proofedDownloaded = []
      let hadError = false
      let firstProof = true
      for (const file of fileNames) {
        const fileBlob = await UStoreProvider.api.products.downloadProofPreview(orderItem.ID || orderItemId, proof.PreviewID, file.Url)
        if (fileBlob) {
          if (firstProof) {
            window['proofPreview'] = window['proofPreview'] || {}
            window['proofPreview'][orderItem.ID || orderItemId] = window['proofPreview'][orderItem.ID || orderItemId] || []
            window['proofPreview'][orderItem.ID || orderItemId].push(fileBlob)
            firstProof = false
          }
          proofedDownloaded = [...proofedDownloaded, {
            Url: URL.createObjectURL(fileBlob),
            DisplayName: t('DynamicProof.Page', { pageNumber: proofedDownloaded.length + 1 }),
            type: proof.Format === 1 ? 'image' : 'pdf'
          }]
        } else {
          hadError = true
        }
      }
      if (!hadError) {
        setProductThumbnails({ Thumbnails: proofedDownloaded })
      }
      loadingTimeout && clearTimeout(loadingTimeout)
      setShowLoaderDots(false)
      setPoofPreviewError(hadError)
    }
    if (showRefreshPreview || searchParams.has('OrderItemId')) {
      setShowLoaderDots(true)
    }
    setPoofPreviewError(false)
    fastProofService.push([orderItem.ID || orderItemId, propsForProof])
    loadingTimeout = setTimeout(() => {
      setShowLoaderDots(true)
    },2000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderItem.ID, properties])

  const handleFormChange = useCallback(async (
    propertyId = null,
    propertyValue = undefined,
    propertyErrors = null,
    formChanges = {}
  ) => {
    if (excelPricingEnabled) {
      setPriceError(null)
    } else {
      if (Object.values(propertiesObject).some((property) => property.custom.affectPrice && property.id === propertyId)) {
        setPriceError( null)
      } else {
        setPriceError(priceError === 'can not recalculate' && popperError ? 'can not recalculate' : null)
      }
    }
    resetPopperError()
    const updatedPropertiesSchema = properties
    if (Object.keys(formChanges).length) {
      updatedPropertiesSchema.formData = {
        ...properties.formData,
        ...formChanges
      }
    } else {
      updatedPropertiesSchema.formData = {
        ...properties.formData,
        [propertyId]: propertyValue
      }
    }
    const updatedErrors = processErrorsOnFormChange(
      Object.keys(formChanges).length ? Object.keys(formChanges) : propertyId,
      propertyErrors,
      updatedPropertiesSchema,
      propertyValue
    )
    const updatedFormData = {
      ...properties,
      formData: updatedPropertiesSchema.formData
    }
    const propsFromApiToPropsObject = convertPropertiesFromApiToPropertiesObject(
      updatedFormData,
      getDependenciesObject(updatedFormData, excelPricingEnabled) ? getDependenciesObject(updatedFormData, excelPricingEnabled).dependenciesObject : null
    )

    const propAffectProof = formChanges && !propertyId ?
      Object.entries(formChanges).reduce((r, [key, value]) => r || updatedFormData.JSONSchema.definitions[key]?.custom?.affectProof) :
      updatedFormData.JSONSchema.definitions[propertyId]?.custom?.affectProof

    if (propAffectProof && product.Type === productTypes.DYNAMIC && !showRefreshPreview && (formChanges || propertyErrors[propertyId]?.length === 0)) {
      if (!uEditEnabled(product)) {
        await createPreview(propsFromApiToPropsObject)
      }
    }

    // Set temporal local state
    setPropertiesObject(propsFromApiToPropsObject)
    setProperties({
      ...properties,
      formData: updatedPropertiesSchema.formData
    })
    if (!quantityError) {
      // Check if there are validation errors on changed property
      if ((!Object.keys(formChanges).length && updatedErrors[propertyId] && updatedErrors[propertyId].errors.length) ||
        (Object.keys(formChanges).length && checkIfThereArePropertyErrors(updatedErrors))
      ) {
        // Errors already shown as part of errors processing - processErrorsOnFormChange
        setPageState(State.initial)
      } else if (checkIfThereArePropertyErrors(updatedErrors)) {
        if (excelPricingEnabled) {
          await updateProperties(
            Object.keys(formChanges).length ? Object.keys(formChanges) : [propertyId],
            updatedPropertiesSchema,
            null,
            true,
            updatedErrors
          )
          setPageState(State.initial)
        } else if (!excelPricingEnabled && checkIfThereAreVisiblePropertyErrors(updatedErrors)) {
          await updateProperties(
            Object.keys(formChanges).length ? Object.keys(formChanges) : [propertyId],
            updatedPropertiesSchema,
            null,
            false,
            updatedErrors
          )
          setPageState(State.initial)
        } else if (!excelPricingEnabled && !checkIfThereAreVisiblePropertyErrors(updatedErrors)) {
          await updateProperties(
            Object.keys(formChanges).length ? Object.keys(formChanges) : [propertyId],
            updatedPropertiesSchema,
            null,
            false,
            updatedErrors
          )
          if (checkIsPriceAffectedWithErrors(propertiesObject, updatedErrors)) {
            setPageState(State.initial)
            if (Object.values(propertiesObject).some((property) => property.custom.affectPrice && property.id === propertyId)) {
              setPriceError('can not recalculate')
              setPostLoadingProcedures(true)
            }
          } else {
            await updateProperties(
              Object.keys(formChanges).length ? Object.keys(formChanges) : [propertyId],
              updatedPropertiesSchema,
              null,
              true,
              updatedErrors
            )
            setPageState(State.initial)
          }
        }
      } else {
        await updateProperties(
          Object.keys(formChanges).length ? Object.keys(formChanges) : [propertyId],
          updatedPropertiesSchema,
          null,
          true,
          updatedErrors
        )
        setPageState(State.initial)
      }
    }
    if (quantityError === 'invalid') {
      setPageState(State.initial)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIfThereArePropertyErrors, checkIfThereAreVisiblePropertyErrors, excelPricingEnabled, product.Type,
    processErrorsOnFormChange, properties, quantityError, updateProperties, createPreview, showRefreshPreview])

  const loadProductData = async () => {
    if (product.ID) {
      setPageState(State.loading)
      const productFromApi = await UStoreProvider.api.products.getProductByID(product.ID)
      setProduct(productFromApi)
      const fastPreviewEnabled = !productFromApi?.Configuration?.Proof?.FastPreviewEnabled && productFromApi.Type === productTypes.DYNAMIC
      setShowRefreshPreview(fastPreviewEnabled)
      const productThumbnailsFromApi = await UStoreProvider.api.products.getProductThumbnails(productFromApi.ID)
      setProductThumbnails({ Thumbnails: productThumbnailsFromApi.Thumbnails.map((thumbnail) => ({ Url: `${themeContext.get('serverDomain')}${thumbnail.Url}`, DisplayName: thumbnail.DisplayName})) })
      let orderItemFromApi
      if (paramOrderItemId) orderItemFromApi = await UStoreProvider.api.orders.getOrderItem(paramOrderItemId)
      else orderItemFromApi = await UStoreProvider.api.orders.addOrderItem(productFromApi.ID)
      setOrderItem(orderItemFromApi)
      setQuantity(orderItemFromApi.Quantity)
      setDeliveryMethod(orderItemFromApi.DeliveryMethod)
      setDeliveryService(orderItemFromApi.DeliveryServiceID)
      const lastOrderFromApi = await UStoreProvider.api.orders.getLastOrder(productFromApi.ID) // null
      await loadProductDeliveries(productFromApi, orderItemFromApi.ID)
      loadProductProofUrl(productFromApi, orderItemFromApi.ID)
      await loadProductProperties(orderItemFromApi, orderItemFromApi.Quantity, productFromApi, fastPreviewEnabled)
      UStoreProvider.state.customState.setBulk({
        currentProductThumbnails: productThumbnailsFromApi,
        currentOrderItem: orderItemFromApi,
        lastOrder: lastOrderFromApi,
      })
      setPageState(State.initial)
    }
  }

  const onFormChange = useCallback((...args) => {
    setPageState(State.loading)
    handleFormChange(...args)
  }, [handleFormChange])

  const loadProductDataCallbackRef = useRef(loadProductData)
  useEffect(() => {
    loadProductDataCallbackRef.current = loadProductData
  })

  const onResize = (event) => {
    const isMobileBreakpoint = document.body.clientWidth < parseInt(theme.md.replace('px', ''))
    setIsMobile(isMobileBreakpoint)
  }

  const getAttributeValue = (product, attributeName) => product.Attributes.find((attribute) => attribute.Name === attributeName)?.Value === 'true'
  const uEditEnabled = (product) => getAttributeValue(product, 'UEditEnabled')
  const uEditAdvancedMode = (product) => getAttributeValue(product, 'UEditAdvancedMode')
  const uEditDisplayContentObjectList = (product) => getAttributeValue(product, 'UEditDisplayContentObjectList')

  useEffect(() => {
    const loadProductDataCallback = e => loadProductDataCallbackRef.current(e)

    window.addEventListener('beforeunload', cleanCustomState, true)
    window.addEventListener('resize', onResize, true)
    stickyConnect()
    onResize()
    loadProductDataCallback()

    return () => {
      stickyDisconnect()
      cleanCustomState()
      window.removeEventListener('beforeunload', cleanCustomState, true)
      fastProofService.breakCurrentLoop()
      if (saveToDraftTimerRef.current) clearTimeout(saveToDraftTimerRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setExcelPricingEnabled(product
      .Attributes
      .find((attribute) => attribute.Name === 'PartialPriceCalculationEnabled')
      .Value === 'true')
  }, [product])

  useEffect(() => {
    const demiState = { ...properties.formData }

    window.triggerFormPropertyChange = (propertyId, propertyValue) => {
      if (propertyValue && propertyValue.includes && propertyValue.includes('__GENERIC_HTML_ACCUMULATOR_VALUE__')) {
        const formValues = JSON.parse(propertyValue)['__GENERIC_HTML_ACCUMULATOR_VALUE__']
        onFormChange(null, null, null, formValues)
      } else {
        if (propertiesObject[propertyId]) demiState[propertyId] = propertyValue
        clearTimeout(htmlDataUpdateTimeout)
        const newHtmlUpdateTimeout = setTimeout(() => {
          onFormChange(null, null, null, demiState)
        }, 500)
        setHtmlDataUpdateTimeout(newHtmlUpdateTimeout)
      }
    }
    return () => { window.triggerFormPropertyChange = undefined }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties, propertiesObject, errors])

  useEffect(() => {
    if (pageState !== State.loading && pageState !== State.calculatingPrice && postLoadingProcedures) {
      if (!forceAddToCartButtonPopper) {
        if (priceError === 'invalid') {
          setPopperError('GET_PRICE')
        } else if (priceError === 'can not recalculate') {
          setPopperError('PRICE_CAN_NOT_BE_UPDATED')
        } else if (priceError === null) {
          setPopperError(null)
        }
      }
      setPostLoadingProcedures(false)
    }
  }, [
    priceError,
    quantityError,
    pageState,
    excelPricingEnabled,
    postLoadingProcedures,
    forceAddToCartButtonPopper,
    price
  ])

  useEffect(() => {
    if (pageState !== State.loading && pageState !== State.calculatingPrice) setPostLoadingProcedures(true)
    else setPostLoadingProcedures(false)
  }, [pageState])

  const cleanCustomState = () => {
    ['currentProduct',
      'currentOrderItem',
      'currentOrderItemId',
      'currentOrderItemPriceModel',
      'lastOrder',
      'currentProductThumbnails',
      'currentDeliveryServices',
      'CurrentProductDucErrors',
      'ducData',
      'currentProductProperties',
      'isLoadingData'
    ].forEach((property) => {
      UStoreProvider.state.customState.delete(property)
    })
  }

  const setPricingError = (error) => {
    if (error.ErrorCode && error.ErrorCode === 'ExcelCalculation') {
      const updatedPrice = {
        IsMinimumPrice: true,
        MailingFee: 0,
        Price: { Price: -1, Tax: 0 },
        ProductPrice: 0
      }
      setPrice(updatedPrice)
      UStoreProvider.state.customState.set('currentOrderItemPriceModel', updatedPrice)
      setPriceError('invalid')
      setPostLoadingProcedures(true)
    }
  }

  const loadProductDeliveries = async (productFromApi, orderItemId) => {
    if (productFromApi.Configuration.Delivery.Mailing.Enabled) {
      const deliveriesFromApi = await UStoreProvider.api.orders.getDeliveryServices(orderItemId)
      setProductDeliveries(deliveriesFromApi)
      UStoreProvider.state.customState.set('currentProductDeliveries', deliveriesFromApi)
    }
  }

  const loadProductProperties = async (updatedOrderItem, initialQuantity, product, fastPreviewEnabled) => {
    try {
      const propertiesFromApi = await UStoreProvider.api.orders.getProperties(updatedOrderItem.ID)
      const updatedPropertiesObject = convertPropertiesFromApiToPropertiesObject(
        propertiesFromApi,
        getDependenciesObject(propertiesFromApi, excelPricingEnabled) ? getDependenciesObject(propertiesFromApi, excelPricingEnabled).dependenciesObject : null
      )

      setProperties(propertiesFromApi)
      setPropertiesObject(updatedPropertiesObject)
      if (product.Type === productTypes.DYNAMIC) {
        const isUEdit = uEditEnabled(product)

        if (paramOrderItemId) {
          if (!isUEdit) {
            setTimeout(() => createPreview(updatedPropertiesObject, paramOrderItemId, propertiesFromApi), 0)
          }
        } else if (!fastPreviewEnabled) {
          if (!isUEdit) {
            setTimeout(() => createPreview(updatedPropertiesObject, updatedOrderItem.ID, propertiesFromApi), 0)
          }
        }
      }

      UStoreProvider.state.customState.set('currentProductProperties', { ...propertiesFromApi })
      const updatedErrors = await processErrorsOnApiResponse(propertiesFromApi, null)

      if (!checkIfThereAreVisiblePropertyErrors(updatedErrors)) {
        await calculateProperties(initialQuantity, updatedOrderItem, propertiesFromApi, updatedErrors)
      } else {
        setPricingError({
          ErrorCode: 'ExcelCalculation'
        })
      }
    } catch (e) {
      console.error(e)
      // Excel template V15.0 error
      setPricingError(e)
    }
  }

  const loadProductProofUrl = (productFromApi, orderItemId) => {
    setProofUrl(productFromApi.Proof ? `${productFromApi.Proof.Url}&OrderItemID=${orderItemId}` : null)
  }

  const reRouteToCart = (storeType, cartUrl) => {
    if (storeType === 3 && cartUrl) {
      const decoded = decodeURIComponent(cartUrl)
      window.location.href = `${decoded}${decoded.includes('?') ? '&' : '?'}OrderProductId=${orderItem.FriendlyID}`
    } else {
      navigate(urlGenerator.get({ page: 'cart' }))
    }
  }

  const reRouteToNewOrder = (productId, productName, newOrderId) => {
    if (process.env.REACT_APP_WEB_COMPONENT) {
      navigate(`${urlGenerator.get({ page: 'redirect-to-reorder', id: productId, name: decodeStringForURL(productName) })}?OrderItemId=${newOrderId}&reorder=true`, { replace: true, })
    } else {
      setSearchParams({ OrderItemId: newOrderId, reorder: true })
      navigate(0)
    }
  }

  const handleQuantityChange = async (newQuantity, error) => {
    if (error) {
      setQuantityError('invalid')
      if (newQuantity === '') setQuantity('')
      return
    } else {
      setQuantityError(null)
    }

    try {
      if (checkIfThereArePropertyErrors() && !excelPricingEnabled) {
        if (checkIfThereAreVisiblePropertyErrors()) {
          return
        } else {
          const propertiesCanAffectPrice = Object.values(propertiesObject).filter((property) => property.custom.affectPrice)
          const isPriceAffectedWithErrors = propertiesCanAffectPrice.some((property) => errors[property.id].errors.length)
          if (isPriceAffectedWithErrors) {
            setPriceError('can not recalculate')
            setPostLoadingProcedures(true)
            return
          }
        }
      }

      if (pageState !== State.loading) {
        await updateProperties(['quantity'], null, newQuantity)
        setPageState(State.initial)
        setPopperError(null)
      }
    } catch (e) {
      setPageState(State.initial)
      console.error(e)
      setPricingError(e)
    } finally {
      setQuantity(newQuantity)
      if (!isNaN(parseInt(newQuantity))) {
        setOrderItem({
          ...orderItem,
          Quantity: parseInt(newQuantity)
        })
      }
    }
  }

  const addToCartOrSave = async (skipPropertiesPush = false) => {
    // If product is out of stock - save it for later
    const productStockQuantity = product.Inventory && product.Inventory.Quantity
    const minQuantity = product.Configuration &&
    product.Configuration.Quantity &&
    product.Configuration.Quantity.Minimum
      ? product.Configuration.Quantity.Minimum
      : 0
    const allowOutOfStockPurchase = product.Inventory && product.Inventory.AllowOutOfStockPurchase
    if (
      product.Inventory &&
      isOutOfStock(
        productStockQuantity,
        minQuantity,
        allowOutOfStockPurchase
      )
    ) {
      await pushSavedForLater(orderItem.ID)
    } else {
      if (uEditEnabled(product) ) {
        let xlim = UeditProvider.getXLIM()
        const doc = new File([xlim], 'doc.xlim', { type: 'application/xml' })
        await UStoreProvider.api.products.replaceProductXLIM(orderItem.ID, [doc])
      }
      if (!skipPropertiesPush) {
        if (properties && Object.keys(properties).length) {
          await pushProperties(
            orderItem.ID,
            convertProductPropertiesFormIntoArray(
              properties,
              excelPricingEnabled
            )
          )
        }
        await pushOrderItem(orderItem.ID, {
          ...orderItem,
          Properties: properties && Object.keys(properties).length ? convertProductPropertiesFormIntoArray(
            properties,
            excelPricingEnabled
          ) : null
        })
      }
      await pushCart(orderItem.ID)
    }
    reRouteToCart(StoreType, themeContext.get('cartUrl'))
  }

  const saveToDraft = async() => {
    if (saveToDraftTimerRef.current) {
      clearTimeout(saveToDraftTimerRef.current);
    }

    try {
      await pushProperties(
        orderItem.ID,
        convertProductPropertiesFormIntoArray(
          properties,
        ),
      )
      // IsPermanent field let save to Saved Draft Orders table
      if (uEditEnabled(product)) {
        const xlim = UeditProvider.getXLIM()
        const doc = new File([xlim], 'doc.xlim', { type: 'application/xml' })
        UeditProvider.clearStack()
        await UStoreProvider.api.products.replaceProductXLIM(orderItem.ID, [doc])
      }
      await UStoreProvider.api.orders.updateOrderItem(orderItem.ID, {...orderItem, IsPermanent: true})

      setIsOrderItemSavedToDraft(true)
      saveToDraftTimerRef.current = setTimeout( () => {
        setIsOrderItemSavedToDraft(false)
        saveToDraftTimerRef.current = null;
      }, 3000)
    } catch ( e ) {
      setIsOrderItemSavedToDraft(false)
    }
  }

  const handleAddToCartButtonClick = async () => {
    if (pageState !== State.initial) return
    // Error checking
    if (uploadError) {
      setForceAddToCartButtonPopper(true)
      setPopperError('FILE_MUST_BE_UPLOADED')
      setPostLoadingProcedures(true)
      return
    }
    if (quantityError) {
      setForceAddToCartButtonPopper(true)
      setPopperError('VALIDATION_ERROR')
      setPostLoadingProcedures(true)
      return
    } else if ((priceError === 'invalid' && !((price.Price && price.Price.Price === -1) || price.IsMinimumPrice)) || excelPricingError) {
      setForceAddToCartButtonPopper(true)
      setPopperError('SOMETHING_WENT_WRONG')
      setPostLoadingProcedures(true)
      return
    } else if (priceError === 'invalid' && ((price.Price && price.Price.Price === -1) || price.IsMinimumPrice)) {
      setForceAddToCartButtonPopper(true)
      setPopperError('GET_PRICE')
      setPostLoadingProcedures(true)
      return
    } else if (checkIfThereArePropertyErrors()) {
      setForceAddToCartButtonPopper(true)
      setPostLoadingProcedures(true)
      showAllErrors()
      if (product.Type === productTypes.DYNAMIC && checkIfThereAreSectionErrors()) {
        const distinctSections = [...new Set(Object.values(propertiesObject).reduce((acc, current) => [...acc, current.uiSchema['ui:options'].section], []))]

        if (distinctSections.length > 1) {
          const sectionsAffectedByErrors = [...new Set(Object.values(errors).reduce((acc, current) => current.show && current.section ? [...acc, current.section] : [...acc], []))].sort((a, b) => distinctSections.indexOf(a) - distinctSections.indexOf(b))
          const sectionsAffectedByErrorsWithIndexes = sectionsAffectedByErrors.map((section) =>
            distinctSections.includes(section) ?
              `${distinctSections.indexOf(section) + 1}. ${section === 'xmpie_product_properties' ? t('xmpie_product_properties') : section}` :
              ''
          )
          // numbers lower than -2 are special values to signal dynamic form to open the first section with errors
          setSectionToOpen(-2 - Date.now())
          setPopperAffectedSections(sectionsAffectedByErrorsWithIndexes)
          setPopperError('SECTION_ERROR')
          return
        }
      }
      setPopperError('VALIDATION_ERROR')
      return
    }
    const updatedProperties = await updateProperties(Object.keys(propertiesObject))
    if (priceError) {
      setForceAddToCartButtonPopper(true)
      setPopperError('SOMETHING_WENT_WRONG')
      setPostLoadingProcedures(true)
      return
    }
    const updatedErrors = await processErrorsOnAddToCart(updatedProperties.updatedPropertiesFromApi)
    if (checkIfThereArePropertyErrors(updatedErrors)) {
      setForceAddToCartButtonPopper(true)
      setPopperError('VALIDATION_ERROR')
      setPostLoadingProcedures(true)
      return
    }
    setPageState(State.loading)
    // If product requires proof approval, open form approval modal and exit
    if (product.Configuration.Proof && product.Configuration.Proof.RequireProofApproval) {
      if (price && price.Price) await calculateProperties(quantity, null, updatedProperties.updatedPropertiesFromApi, updatedErrors)
      setApprovalModalOpen(true)
      setPageState(State.initial)
      return
    }

    await addToCartOrSave()
  }

  const handleDeliveryChange = async (newDeliveryMethod, newDeliveryServiceId) => {
    setDeliveryMethod(newDeliveryMethod)
    setDeliveryService(newDeliveryServiceId)
    const updatedOrderItem = {
      ...orderItem,
      DeliveryMethod: newDeliveryMethod,
      DeliveryServiceID: newDeliveryServiceId
    }
    setOrderItem(updatedOrderItem)
    UStoreProvider.state.customState.set('currentOrderItem', updatedOrderItem)
    if (Object.keys(price).length && price.Price) calculateProperties(quantity, updatedOrderItem)
  }

  const handlePropertyBlur = (propertyId) => {
    const updatedErrors = processErrorsOnFormChange(propertyId, null, properties)
    processErrorsOnApiResponse(
      properties,
      updatedErrors,
      [propertyId]
    )
  }

  const handleReorder = async () => {
    const { lastOrder } = UStoreProvider.state.customState.get()
    setPageState(State.loading)
    const newOrder = await getReorder(lastOrder.OrderItemID)
    reRouteToNewOrder(product.FriendlyID, product.Name, newOrder.ID)
  }

  const getContinueButtonText = (proofModal = false) => {
    if (
      product.Configuration.Proof &&
      product.Configuration.Proof.RequireProofApproval &&
      !proofModal
    ) return t('product.review_approve')
    if (
      product &&
      product.Inventory &&
      Object.keys(product.Inventory).includes('Quantity') &&
      Object.keys(product.Inventory).includes('AllowOutOfStockPurchase') &&
      isOutOfStock(
        product.Inventory.Quantity,
        product.Configuration.Quantity.Minimum,
        product.Inventory.AllowOutOfStockPurchase
      )
    ) return t('product.save_for_later')
    return t('product.add_to_cart')
  }

  const resetPopperError = () => {
    setPopperError(null)
    setForceAddToCartButtonPopper(false)
  }
  const onProofPreviewClick = async () => !isNewUpload && await createPreview(propertiesObject)

  const isNewUpload = product.Type === productTypes.EASY_UPLOAD
  const onElementClicked = (isSelected) => setIsUEditControlsVisible(isSelected && !UeditProvider.fullyLocked)
  const isUEdit = uEditEnabled(product)

  return (
    <ProductLayout className="product-instance"
                   dynamic={product.Type === productTypes.DYNAMIC}
                   upload={isNewUpload}
                   isUEdit={uEditEnabled(product)}
    >
      <left id="custom" className="root-preview">

        {isNewUpload && <PDFViewer resetPopperError={resetPopperError} setUploadError={setUploadError} onFormChange={onFormChange}
                                   product={product} orderItem={orderItem} errors={errors} properties={propertiesObject}
                                   isMobile={isMobile}/>}
        {uEditEnabled(product)  && orderItem && orderItem.DocumentUrl &&
          <UEdit isControlsOpen={isUEditControlsVisible}
                 setIsUEditControlsVisible={setIsUEditControlsVisible}
                 orderItem={orderItem}
                 product={product}
                 isMobile={isMobile}
                 properties={propertiesObject}
                 setUeditSelectedBoxId={setUeditSelectedBoxId}
                 onElementClicked={onElementClicked}
                 setUEditLocks={setUEditLocks}
                 uEditAdvancedMode={uEditAdvancedMode(product)}
                 uEditDisplayContentObjectList={uEditDisplayContentObjectList(product)}
          />}
        {!isNewUpload && !uEditEnabled(product) &&
            <Preview
                poofPreviewError={poofPreviewError}
                productThumbnails={productThumbnails}
                showLoaderDots={showLoaderDots}
                product={product}
                orderItem={orderItem}
                setProofModalOpen={setProofModalOpen}
                proofModalOpen={proofModalOpen}
                showRefreshPreview={showRefreshPreview}
                onProofPreviewClick={onProofPreviewClick}
                disabledRefreshPreviewButton={disabledRefreshPreviewButton}
                showThumbs={(product.Type !== productTypes.KIT) && !isMobile}
                isMobile={isMobile}
            />
        }
      </left>
      <right is="custom">
        <Slot name="ng_product_top" data={product}/>
        <ProductDetails
          className="product-instance"
          productModel={product}
          minimumQuantity={product.Configuration ? product.Configuration.Quantity.Minimum : null}
          reorderModel={!searchParams.get('reorder') ? UStoreProvider.state.customState.get('lastOrder') : null}
          onReorder={handleReorder}
          showInStock
          langCode={themeContext.get('languageCode')}
        />
        {
          isNewUpload &&
          <EasyUploadPriceAndQuantity
            ref={easyUploadRefs}
            isPriceCalculating={pageState === State.calculatingPrice || pageState === State.loading}
            price={price}
            orderItem={orderItem}
            product={product}
            handleQuantityChange={handleQuantityChange}
          />
        }
        {!isNewUpload && <Price
          ref={topPriceRef}
          isPriceCalculating={pageState === State.calculatingPrice || pageState === State.loading}
          price={price} showMinimumPrice={!!price.IsMinimumPrice}
        />}
        <div ref={topMarkerRef} className="price-top-marker"></div>
        <div className="product-instance-wizard">
          <div id="form-container" className="product-instance-properties product-properties">
            <Slot name="ng_product_above_quantity" data={product}/>
            {!isNewUpload && <div className="quantity">
              <span className="quantity-label">{t('product.quantity')}</span>
              {orderItem?.Quantity && <ProductQuantity
                supportsInventory
                productModel={product}
                orderModel={orderItem}
                onQuantityChange={handleQuantityChange}
              />}
            </div>}
            <Slot name="ng_product_below_quantity" data={product}/>
            {isUEditControlsVisible && createPortal(<UEditControlsPanel
              isMobile={isMobile}
              isUEditControlsVisible={isUEditControlsVisible}
              onClose={() => setIsUEditControlsVisible(false)}
              ueditSelectedBoxId={ueditSelectedBoxId}
              uEditDisplayContentObjectList={uEditDisplayContentObjectList(product)}
              properties={propertiesObject}
              onChange={onFormChange}
              locks={uEditLocks}
              product={product}
              orderItem={orderItem}
              errors={errors}
            />, rootElement)}
            <DynamicForm
              errors={errors}
              excelPricingEnabled={excelPricingEnabled}
              formData={properties.formData}
              onBlur={handlePropertyBlur}
              onChange={onFormChange}
              properties={propertiesObject}
              sectionToOpen={sectionToOpen}
              sectionsDescription={properties.JSONSchema && properties.JSONSchema.sections}
              productType={product.Type}
              isMobile={isMobile}
              isUEdit={isUEdit}
            />
          </div>
        </div>
        <ProductDeliveryMethod
          className="static-delivery-method"
          productModel={product}
          onDeliveryChange={handleDeliveryChange}
          currentDeliveryMethod={deliveryMethod}
          currentDeliveryServiceID={deliveryService}
          deliveryServices={productDeliveries}
        />
        <ProductOrderSummary
          ref={bottomPriceRef}
          currency={currentCurrency?.Code}
          deliveryMethod={deliveryMethod}
          className="static-order-summary"
          productModel={product}
          quantity={quantity}
          taxFormatType={TaxFormatType}
          priceModel={Object.keys(price).length ? price : null}
          isPriceCalculating={pageState === State.calculatingPrice || pageState === State.loading}
        />
        <div ref={bottomMarkerRef} className="price-bottom-marker"></div>
        {proofModalOpen && <ProductProof
          onAddToCartClick={handleAddToCartButtonClick}
          isModalOpen={proofModalOpen}
          modalClassName="product-instance-proof-modal"
          src={proofUrl}
          type={product.Proof && product.Proof.MimeType ? product.Proof.MimeType : ''}
          onCloseModal={() => setProofModalOpen(!proofModalOpen)}
          isMobile={isMobile}
        />}
        {approvalModalOpen && <ProductApprovalModal product={product} properties={properties}
                                                    onAddToCartClick={addToCartOrSave} orderItem={orderItem}
                                                    productThumbnails={productThumbnails} modalOpen={approvalModalOpen}
                                                    onCloseModal={() => setApprovalModalOpen(!approvalModalOpen)}
                                                    continueButtonText={getContinueButtonText(true)} src={proofUrl}
                                                    excelPricingEnabled={excelPricingEnabled} isUEdit={isUEdit}/>}
        <div className="add-to-cart-button-wrapper">
          <Slot name="ng_product_above_add_to_cart" data={product}/>
          <div
            className="button button-primary add-to-cart-button"
            id="add-to-cart-button"
            onClick={handleAddToCartButtonClick}
            tabIndex="0"
          >
            {
              pageState === State.loading ||
              pageState === State.calculatingPrice
                ? <LoadingDots/>
                : getContinueButtonText()}
          </div>
        </div>
        {
          !isCartOrderItem && allowSaveToDraft && (
            <div className="product-instance-save-to-draft-wrapper">
              {
                !isOrderItemSavedToDraft &&
                <ButtonAria
                  className="button-transparent product-instance-save-to-draft"
                  text={t( 'Product.SaveToDraft' )}
                  onClick={saveToDraft}
                  onKeyDown={( e ) => {
                    if ( e.key === 'Enter' ) {
                      saveToDraft()
                    }
                  }}
                >
                  {t( 'Product.SaveToDraft' )}
                </ButtonAria>
              }
              {
                isOrderItemSavedToDraft &&
                <div className="product-instance-save-to-draft-success">
                  <div>{t( 'Product.Saved' )}</div>
                  <Icon name="checkmark_green.svg" width="20px" height="20px" className="product-instance-save-to-draft-success-icon" />
                </div>
              }
            </div>
          )
        }
        <div className="ng_product_below_add_to_cart">
          <Slot name="ng_product_below_add_to_cart" data={product}/>
        </div>
        <Popper
          isNewUpload={isNewUpload}
          bottomPriceRef={bottomPriceRef}
          topPriceRef={topPriceRef}
          stickPriceRef={stickyPriceRef}
          errorCode={popperError}
          forceAddToCartButton={forceAddToCartButtonPopper}
          resetError={resetPopperError}
          popperAffectedSections={popperAffectedSections}
        />
        <Slot name="ng_product_bottom" data={product}/>
        {(product.Type === productTypes.DYNAMIC || isNewUpload) &&
          <ProductThumbnailsPreview
            isMobile={isMobile}
            orderItem={orderItem}
            isNewUpload={isNewUpload}
            isModalOpen={thumbnailModalOpen}
            onCloseModal={() => setThumbnailModalOpen(false)}
            productThumbnails={(product.Type === productTypes.DYNAMIC && productThumbnails) ? productThumbnails : null}
            modalClassName="thumbnails-preview"
            onImageChange={(id) => setLastViewImageId(id)}
            poofPreviewError={poofPreviewError}
            onProofPreviewClick={onProofPreviewClick}
            properties={propertiesObject}
          />
        }
        {showStickyPrice &&
          <ProductStickyPrice
            propertiesObject={propertiesObject}
            longPrice={TaxFormatType === 3}
            onClick={handleAddToCartButtonClick}
            addToCartBtnText={getContinueButtonText()}
            priceModel={price}
            isPriceLoading={pageState === State.loading || pageState === State.calculatingPrice}
            disabled={pageState === State.loading || pageState === State.calculatingPrice}
            showMinimumPrice={!!price.IsMinimumPrice}
            productThumbnails={(product.Type === productTypes.DYNAMIC && productThumbnails) ? productThumbnails : null}
            onImageClick={() => setThumbnailModalOpen(true)}
            lastViewImageId={lastViewImageId}
            ref={stickyPriceRef}
            isNewUpload={isNewUpload}
            orderItem={orderItem}
            isUEdit={isUEdit}
          />}

      </right>

    </ProductLayout>
  )
}

export default StaticProduct
