import { useEffect, useRef, useState} from 'react'
import { useNavigate} from 'react-router-dom'
import Inventory from './Inventory'
import Price from './Price'
import ProductItemQuantity from './ProductItemQuantity'
import UnitsOfMeasure from './UnitsOfMeasure'
import { Tooltip, Icon, ImageLoader, LoadingDots, LinkAria, ButtonAria, Slot } from '$core-components'
import { UStoreProvider } from '@ustore/core'
import { t } from '$themelocalization'
import { prependServerDomain } from '$themeservices'
import './ProductItem.scss'

const ProductItem = (props) => {
  const navigate = useNavigate()
  const [currentOrderItem, setCurrentOrderItem] = useState(null)
  const [isPriceCalculating, setIsPriceCalculating] = useState(false)
  const [calculatedPriceModel, setCalculatedPriceModel] = useState(null)
  const [addToCartShowSuccess, setAddToCartShowSuccess] = useState(false)
  const [quantity, setQuantity] = useState(null)
  const [isQuantityValid, setIsQuantityValid] = useState(true)
  const [addToCartShowSuccessTimer, setAddToCartShowSuccessTimer] = useState(null)
  const isProcessingClick = useRef(false)
  let {descriptionLines, productNameLines, model, url, detailed, className} = props
  let focusedElement = null

  const clearQuantity = () => {
    if (props.model.Configuration.Quantity.Options){
      setQuantity(props.model.Configuration.Quantity.Options[0].Value)
    } else {
      setQuantity(null)
    }
  }
  const onQuantityChange = async (newQuantity, isValid) => {
    const { model } = props

    if (isValid) {
      setQuantity(newQuantity)
      if (model.HasPricing) {
        setIsPriceCalculating(true)
        const calculatedPriceModel = await onCalculatePrice(newQuantity)
        setIsPriceCalculating(false)
        setIsQuantityValid(true)
        setCalculatedPriceModel(calculatedPriceModel)
      } else {
        setIsQuantityValid(true)
      }
    } else {
      setIsQuantityValid(false)
    }
  }

  const onCalculatePrice = async (newQuantity) => {
    const { model } = props
    if (model.MinimumPrice === null) return
    const orderItemForApi = currentOrderItem || await UStoreProvider.api.orders.addOrderItem(model.ID)

    const priceModel = await UStoreProvider.api.orders.getPriceOrderItem(orderItemForApi.ID, { ...orderItemForApi, Quantity: newQuantity })
    setCalculatedPriceModel(priceModel.Price)
    setCurrentOrderItem(orderItemForApi)
    return priceModel.Price
  }

  const addToCart = async () => {
    if (isQuantityValid) {
      const { model } = props
      const orderItemForApi = currentOrderItem || await UStoreProvider.api.orders.addOrderItem(model.ID)
      // call the update order api if quantity is updated
      if (quantity) {
        const updated = {
          ...orderItemForApi,
          Quantity: quantity
        }

        await UStoreProvider.api.orders.updateOrderItem(orderItemForApi.ID, updated)
      }
      await UStoreProvider.api.orders.addToCart(orderItemForApi.ID)

      if (UStoreProvider.state.get()['currentStore']?.Attributes?.find((attr) => attr.Name === 'ForceCartAspx' && attr.Value === 'False')) {
        await UStoreProvider.state.store.loadCartItemsCount()
      }

      return true
    }

    return false
  }

  const onAddToCartClick = async () => {
    if (isProcessingClick.current) return
    isProcessingClick.current = true

    const success = await addToCart()

    if (success) {
      setAddToCartShowSuccess(true)
      setCurrentOrderItem(null)
      clearQuantity()
      setAddToCartShowSuccessTimer(setTimeout(() => {
        setAddToCartShowSuccess(false)
        setCalculatedPriceModel(null)
      }, 3000))
    }
    isProcessingClick.current = false
  }

  const onClick = (url) => {
    if (typeof url === "string") {
      navigate(url)
    }
  }

  // onKeyDown implemented based on WCAG (content accessibility) adds and removes a border
  function onKeyDown(e) {
    if (e.key === 'Tab') {
      if (focusedElement && focusedElement.matches('select')) {
        focusedElement.classList.remove('quantity-focused')
      }
      setTimeout(function () {
        focusedElement = document.activeElement
        if (focusedElement && focusedElement.matches('select')) {
          focusedElement.classList.add('quantity-focused')
        }
      }, 0)
    }
  }

  useEffect(() => {
    return () => {
      clearTimeout(addToCartShowSuccessTimer)
    }
  }, [addToCartShowSuccessTimer])

  useEffect(() => {
    clearQuantity()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!model) {
    return null
  }

  productNameLines = productNameLines ? productNameLines : 2
  descriptionLines = descriptionLines ? descriptionLines : 4

  const imageUrl = (model && model.ImageUrl) ? prependServerDomain(model.ImageUrl) : require(`$assets/images/default.png`)

  const productNameAndCatalog = model.CatalogNumber && model.CatalogNumber.trim().length > 0 ? `${model.Name} / ${model.CatalogNumber}` : model.Name
  const showQuickAddToCart = model.Configuration && model.Configuration.AllowQuickAddToCart
  const priceModelToDisplay = calculatedPriceModel || model.MinimumPrice
  const isMinimumPrice = !calculatedPriceModel && !showQuickAddToCart
  const quantityToShow = quantity || model.MinimumQuantity

  return (
    <div className={`product-item ${className ? className : ''}`} data-qaautomationinfo={model.FriendlyID} onKeyDown={onKeyDown}>
      <LinkAria className="image-wrapper" to={url}>
        <ImageLoader className="image" src={imageUrl} alt={productNameAndCatalog}/>
      </LinkAria>
      <div className="product-name" style={{maxHeight: `${productNameLines * 1.5}em`}} onClick={() => onClick(url)}>
        <Tooltip placement="top" text={productNameAndCatalog} maxLine={productNameLines}/>
        <Slot name="category_next_to_item_name" data={model} />
      </div>
      {/* MCF base: product-type pill driven by quick-add capability (Ready = buyable from grid). */}
      <div className="product-type">
        <span className={`product-type-pill ${showQuickAddToCart ? 'is-ready' : 'is-custom'}`}>
          {showQuickAddToCart ? 'Ready' : 'Customise'}
        </span>
      </div>
      {detailed && <div className="product-description" style={{maxHeight: `${descriptionLines * 1.5}em`}}>
        <Tooltip placement="bottom" text={model.ShortDescription} maxLine={descriptionLines}/>
      </div>}
      <Inventory model={model.Inventory} minQuantity={model.MinimumQuantity}/>
      {model.HasPricing && priceModelToDisplay && <div>
        <div className="product-units">
          <UnitsOfMeasure minQuantity={model.MinimumQuantity} model={model.Unit} isMinimumPrice={isMinimumPrice}/>
        </div>
        <div className="product-price">
          {isPriceCalculating ?
            <LoadingDots/> : <Price model={priceModelToDisplay} isMinimumPrice={isMinimumPrice}/>
          }
        </div>
      </div>}
      <div className="anchor-flex-end"/>
      {showQuickAddToCart && <div className='add-to-cart'>
        {!addToCartShowSuccess && <div className='add-to-cart-controls'>
          <div className='add-to-cart-product-quantity'>
            <ProductItemQuantity
              supportsInventory={true}
              onQuantityChange={onQuantityChange}
              productModel={model}
              orderModel={{Quantity: quantityToShow}}
            />
          </div>
          <div className="add-to-cart-button-wrapper">
            <ButtonAria
              className="button-secondary add-to-cart-button-aria"
              text={t('ProductItem.Add_to_cart_button_text')}
              onClick={() => onAddToCartClick()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onAddToCartClick()
                }
              }}
            >
              {t('ProductItem.Add_to_cart_button_text')}
            </ButtonAria>
            <ButtonAria className="button-secondary add-button" text={t('ProductItem.Add_button_text')}
                    onClick={() => onAddToCartClick()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onAddToCartClick()
                      }
                    }}
            />
          </div>
        </div>
        }
        {addToCartShowSuccess &&
          <div className='add-to-cart-success'>
            <div>{t('ProductItem.Added_successfully_message')}
              <span className='success-checkmark-icon-wrapper'>
                  <Icon name="Homepage_quickAddtoCart_success.svg" width="20px" height="20px" className="success-checkmark-icon"/>
                </span>
            </div>
          </div>
        }
      </div>
      }
      <Slot name="category_bottom_of_item_box" data={model} />
    </div>
  )
}


export default ProductItem
