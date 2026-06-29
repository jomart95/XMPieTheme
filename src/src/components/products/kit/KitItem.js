/**
 * A component to display an item of a product of type Kit.
 *
 * @param {object} kitItemProductModel - the product related to this kit item
 * @param {object} kitItemOrderItemModel - the order item related to this kit item
 * @param {object} kitItemViewModel - the view model of this kit item, with all the information about displaying itself
 * @param {object} [kitItemPriceModel] - the order item price model for this kit item order item
 * @param {function} [onChange] - a callback to signal the item has changed
 * @param {boolean} [doLoadIframe] - a flag to denotes a required action of loading the iframe
 * @param {boolean} [doValidate] - a flag to denotes a required action of validation
 * @param {boolean} [isPriceCalculating] - a flag to indicate if the item's price is in loading state
 * @param {number} kitQuantity - the quantity of the parent kit component, used for inventory validations.
 */

import React, { Component } from 'react'
import KitItemQuantity from './KitItemQuantity'
import Inventory, { isOutOfStock } from '../Inventory'
import Price from '../Price'
import { Tooltip, ImageLoader, LoadingDots, Icon} from '$core-components'
import ImageCarousel from '../ImageCarousel';
import { CookiesManager, storefrontCookies } from '$ustoreinternal/services/cookies'
import logger from '$ustoreinternal/services/logger'
import themeContext from '$ustoreinternal/services/themeContext'
import { withRouter } from '$ustoreinternal/services/withRouter'
import location from '$ustoreinternal/services/locationProvider'
import { UStoreProvider } from '@ustore/core'
import { t } from '$themelocalization'
import theme from '$styles/theme'
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap-wc'
import { Scrollbars } from 'react-custom-scrollbars-2'
import { kitChangeType } from './consts'
import KitItemProperties from './KitItemProperties'
import './KitItem.scss'

class KitItem extends Component {
  constructor(props) {
    super(props)
    this.externalValidation = false

    this.iframeElementModal = React.createRef()
    this.iframeElement = React.createRef()
    this.scrollbars = React.createRef()
    this.scrollableContainer = React.createRef()
    this.iframeSrc = ''
    this.shouldValidateModal = false

    this.togglePreviewModal = this.togglePreviewModal.bind(this)
    this.onClickCancel = this.onClickCancel.bind(this)
    this.onClickSave = this.onClickSave.bind(this)
    this.onClickEditOptions = this.onClickEditOptions.bind(this)
    this.onQuantityChange = this.onQuantityChange.bind(this)
    this.onRemove = this.onRemove.bind(this)
    this.onAdd = this.onAdd.bind(this)
    this.onModalCarouselChange = this.onModalCarouselChange.bind(this)
    this.onResizeHandler = this.onResizeHandler.bind(this)
    this.onInlinePropertiesValidityChange = this.onInlinePropertiesValidityChange.bind(this)

    this.state = {
      isPropertiesOpen: false,
      isPreviewOpen: false,
      activeModalImage: 0,
      isPropsModalLoading: false,
      isMediumBreak: false,
    }
  }

  componentWillUnmount() {
    // if unmounting (clicking back on the browser) when modal is open, we need to manually remove the modal class from the html tag.
    if ((this.state.isPreviewOpen || this.state.isPropertiesOpen) && document && document.querySelector('html')) {
      document.querySelector('html').classList.remove('modal-open')
    }

    window.removeEventListener('message', this.onMessageRecieved)
    window.removeEventListener('resize', this.onResizeHandler)
  }

  onMessageRecieved = (e) => {

    const { kitItemOrderItemModel, navigate } = this.props

    logger.info(e.data.type + ' message from iframe', e)

    if (e.data.type === '@SCROLL_PARENT_DISABLE') {

      var x = document.querySelector('.view').scrollLeft;
      var y = document.querySelector('.view').scrollTop;
      document.querySelector('.view').onscroll = function () { document.querySelector('.view').scrollTo(x, y); };
    }
    if (e.data.type === '@SCROLL_PARENT_ENABLE') {
      document.querySelector('.view').onscroll = function () { }
    }
    if (e.data.type === '@SCROLL_TO' && e.data.data) {
      document.querySelector('.view').scrollTo(e.data.data.x, e.data.data.y);
    }

    if (e.data.type === '@PRODUCT_PROPERTIES_STATUS') {
      const orderItemID = e.data.data.orderItemID
      const isValid = e.data.data.isValid
      if (orderItemID && orderItemID === kitItemOrderItemModel.ID) {
        this.onValidateIframeReturn(isValid)
      }
    }
    if (e.data.type === '@PRODUCT_POPERTIES_LOADED') {
      const orderItemID = e.data.data.orderItemID
      if (orderItemID && orderItemID === kitItemOrderItemModel.ID) {
        if (this.props.kitItemViewModel.iframeLoading) {
          this.setKitViewModel(kitItemOrderItemModel.ID, { iframeLoading: false, iframeLoaded: true })
        }
        else if (this.state.isPropsModalLoading) {
          this.setState({ isPropsModalLoading: false })
          if (this.shouldValidateModal) {
            this.shouldValidateModal = false
            this.externalValidation = false
            this.validate()
          }
        }
      }
    }
    if (e.data.type === '@CHANGE_DIMENSIONS') {
      const orderItemID = e.data.data.orderItemID
      if (orderItemID && orderItemID === kitItemOrderItemModel.ID) {
        const height = e.data.data.height
        const width = e.data.data.width

        if (this.iframeElementModal && this.iframeElementModal.style) {
          this.iframeElementModal.style.height = `${height}px`
          this.iframeElementModal.style.width = `${width}px`

          const modalBody = document.querySelector('.kit-item-properties-modal .modal-body')
          this.scrollableContainer.style.height = `${modalBody.clientHeight - 16}px`
          this.scrollableContainer.style.width = `${modalBody.clientWidth}px`
          this.scrollbars.scrollTop(0)
        }
      }
    }

    if (e.data.type === '@CHANGE_LEGACY_ROUTE') {
      //session expired - we need to prevent displaying login page within iframe
      if (e.data.data.match(/\/login\.aspx\?/) || e.data.data.match(/\/ShowMessage\.aspx\?.*StoreID=-1&ErrorCode=3/)) {
        const { securityToken, storeID, classicUrl, languageCode } = themeContext.get()
        const cookiesToDelete = [storefrontCookies.token, storefrontCookies.storeID, storefrontCookies.language]
        cookiesToDelete.forEach(cn => CookiesManager.deleteCookie(cn))

        const url = `${classicUrl}/logout.aspx?SecurityToken=${securityToken}&StoreGuid=${storeID}&ShowRibbon=false&forceLogin=true&NgLanguageCode=${languageCode}`
        navigate(url)
      }
    }
  }

  componentDidMount() {
    const { kitItemOrderItemModel } = this.props

    if (!kitItemOrderItemModel)
      return null

    this.iframeSrc = this.getIframeSrc(kitItemOrderItemModel.ID)

    const isMediumBreak = document.body.clientWidth <= parseInt(theme.lg.replace('px', ''))

    this.setState({ isMediumBreak: isMediumBreak })

    if (isMediumBreak) {
      const input = document.getElementsByClassName('.quantity-control.quantity-input')
      if (input && input.length === 1) input[0].addEventListener('focus', function (e) { e.target.scrollIntoView(true) })
    }

    window.addEventListener('message', this.onMessageRecieved)
    window.addEventListener('resize', this.onResizeHandler)
  }

  componentDidUpdate(prevProps, prevState) {
    const { kitItemProductModel, kitItemOrderItemModel: { ID, IsIncluded }, kitItemViewModel: { isPropertiesValid } } = this.props

    const hasProperties = !!kitItemProductModel.Configuration.Properties.length

    if (this.props.doValidate && !prevProps.doValidate) {
      if (!isPropertiesValid && IsIncluded && hasProperties) {
        this.externalValidation = true
        this.validate()
      }
      else if (IsIncluded) {
        this.setKitViewModel(ID, { isPropertiesValid: true })
      }
    }
  }

  onResizeHandler() {
    const isMediumBreak = document.body.clientWidth <= parseInt(theme.lg.replace('px', ''))
    this.setState({ isMediumBreak: isMediumBreak })
  }

  setKitViewModel(orderItemID, object) {
    UStoreProvider.state.customState.merge({ kitViewModel: { items: { [orderItemID]: object } } })
  }

  onValidateIframeReturn(isPropertiesValid) {
    const { onChange, kitItemOrderItemModel: { ID }, kitItemViewModel: { modalIsOpen: currentModalIsOpen } } = this.props
    let modalIsOpen = currentModalIsOpen  //modalIsOpen is set according to current state in kitItemViewModel

    if (!this.externalValidation && isPropertiesValid) {
      this.iframeElement && this.iframeElement.contentWindow && this.iframeElement.contentWindow.location.replace(this.getIframeSrc(ID))
      this.setState({ isPropertiesOpen: false })
      modalIsOpen = false     //if not external validation and properties are valid - modalIsOpen = false
      onChange(ID, kitChangeType.SAVE)
    }
    else if (!this.externalValidation) {
      this.scrollbars && this.scrollbars.scrollToTop()
    }

    if (this.externalValidation) {
      this.externalValidation = false
    }

    this.setKitViewModel(ID, { isPropertiesValid: !!isPropertiesValid, modalIsOpen: modalIsOpen })
  }

  onClickCancel() {
    const { kitItemOrderItemModel: { ID } } = this.props
    this.setState({ isPropertiesOpen: false })   //close even if not valid
    this.setKitViewModel(ID, { isPropertiesValid: null, modalIsOpen: false })
  }

  onClickSave() {
    this.externalValidation = false
    this.validate()
  }

  validate() {
    if (!this.externalValidation && this.iframeElement.contentWindow) {
      this.iframeElementModal.contentWindow.postMessage({
        type: '@PRODUCT_PROPERTIES_SAVE',
        data: {}
      }, '*')
    }
    else if (this.externalValidation && this.iframeElement.contentWindow) {
      this.iframeElement.contentWindow.postMessage({
        type: '@PRODUCT_PROPERTIES_SAVE',
        data: {}
      }, '*')
    }
  }

  onClickEditOptions() {
    const { kitItemOrderItemModel: { ID }, kitItemViewModel } = this.props

    if (kitItemViewModel.isPropertiesValid === false) {
      this.shouldValidateModal = true
    }

    this.setState({ isPropertiesOpen: !this.state.isPropertiesOpen, isPropsModalLoading: true })

    if (!kitItemViewModel.propsWasOpened) {
      this.setKitViewModel(ID, { propsWasOpened: true, modalIsOpen: true })
    }
    else {
      this.setKitViewModel(ID, { modalIsOpen: true })
    }
  }

  onQuantityChange(quantity, isValid) {
    const { onChange, kitItemOrderItemModel: { ID, Quantity } } = this.props
    this.setKitViewModel(ID, { isQuantityValid: isValid })

    if (quantity !== Quantity) {
      onChange(ID, kitChangeType.QUANTITY, { quantity })
    }
  }

  onRemove() {
    const { onChange, kitItemOrderItemModel: { ID } } = this.props
    onChange(ID, kitChangeType.REMOVE)
    this.setKitViewModel(ID, { isQuantityValid: null, isPropertiesValid: null })
  }

  onAdd() {
    const { onChange, kitItemOrderItemModel: { ID } } = this.props
    onChange(ID, kitChangeType.ADD)
    this.setKitViewModel(ID, { iframeLoaded: null, isPropertiesValid: null })
  }

  onInlinePropertiesValidityChange(orderItemID, isValid) {
    // Replaces the iframe @PRODUCT_PROPERTIES_STATUS signal: native fields report their own validity.
    this.setKitViewModel(orderItemID, { isPropertiesValid: !!isValid, propsWasOpened: true })
  }

  togglePreviewModal() {
    const { kitItemOrderItemModel: { ID } } = this.props
    this.setState({ isPreviewOpen: !this.state.isPreviewOpen })
    this.setKitViewModel(ID, { modalIsOpen: !this.state.isPreviewOpen })
  }


  onModalCarouselChange(value) {
    this.setState({ activeModalImage: value })
  }

  getIframeSrc(orderItemID) {
    const { storeID } = themeContext.get()
    const { currentUser } = UStoreProvider.state.get()

    const desktopBreakpoint = parseInt(theme.lg.replace('px', ''))
    const viewMobileVal = document.body.clientWidth > desktopBreakpoint ? 'viewMobile=false' : 'viewMobile=true'
    const { classicUrl , securityToken} = themeContext.get()
    return `${classicUrl}/ProductProperties.aspx?OrderItemId=${orderItemID}&${viewMobileVal}&isFrameMode=true&rand=${Math.random()}&userUniqueId=${currentUser ? currentUser.ID : ''}&parentUrl=${encodeURIComponent(location.href)}&StoreGuid=${storeID ? storeID : ''}&securityToken=${securityToken}`
  }

  renderEditLink(className, isOutOfStock) {
    const { kitItemOrderItemModel, kitItemViewModel } = this.props

    return (
      <div className={'edit-section ' + className}>
        {kitItemOrderItemModel.IsIncluded && kitItemViewModel.iframeLoading && !isOutOfStock && <LoadingDots />}
        {kitItemViewModel.isPropertiesValid === false && (<span className='edit-options-error-icon'><Icon name="error.svg" width="15px" height="15px" className="error-icon" /></span>)}
        {kitItemOrderItemModel.IsIncluded && !kitItemViewModel.iframeLoading && !isOutOfStock && (<span className={'edit-options'} onClick={this.onClickEditOptions}><Tooltip placement="top" text={t('KitItem.Edit_options')} maxLine={2} /></span>)}
        {(!kitItemOrderItemModel.IsIncluded || isOutOfStock) && (<span className='disabled-edit-options'><Tooltip placement="top" text={t('KitItem.Edit_options')} maxLine={2} /></span>)}
      </div>
    )
  }

  renderInventoryLabel(className) {
    const { kitItemProductModel } = this.props
    return (
      <span className={className}>
        {kitItemProductModel.Inventory && kitItemProductModel.Inventory.AllowOutOfStockPurchase && <Inventory model={kitItemProductModel.Inventory} minQuantity={kitItemProductModel.Configuration.Quantity.Minimum} />}
      </span>
    )
  }

  propertiesModalOnOpened() {
    document.querySelector('.kit-item-properties-modal .modal-title').classList.add('truncate')
  }

  render() {
    const { kitItemProductModel, kitItemOrderItemModel, kitItemPriceModel, doLoadIframe, isPriceCalculating, kitItemViewModel, kitQuantity } = this.props

    if (!kitItemProductModel || !kitItemOrderItemModel || !kitItemViewModel)
      return null

    const { Name, ImageUrl, Thumbnails } = kitItemProductModel
    const { IsIncluded } = kitItemOrderItemModel

    const hasProperties = !!kitItemProductModel.Configuration.Properties.length

    if (doLoadIframe && IsIncluded && hasProperties && !kitItemViewModel.iframeLoading && !kitItemViewModel.iframeLoaded) {
      this.setKitViewModel(kitItemOrderItemModel.ID, { iframeLoading: true })
    }

    let itemClasses = 'kit-item-panel'
    if (!IsIncluded) itemClasses += ' excluded'

    let kitItemClasses = 'kit-item'
    if ((kitItemViewModel.isPropertiesValid === false || kitItemViewModel.isQuantityValid === false) && !this.state.isPropertiesOpen) {
      kitItemClasses += ' not-valid'
    }
    else {
      if (IsIncluded && !kitItemViewModel.propsWasOpened && kitItemViewModel.showPropsNotOpenedWarning && hasProperties) {
        kitItemClasses += ' not-edited'
      }
    }

    const itemUnitName = kitItemProductModel.Unit.PackType ? kitItemProductModel.Unit.PackType.PluralName : kitItemProductModel.Unit.ItemType ? kitItemProductModel.Unit.ItemType.PluralName : ''
    const OutOfStock = kitItemProductModel.Inventory && isOutOfStock(kitItemProductModel.Inventory.Quantity, kitItemProductModel.Configuration.Quantity.Minimum, kitItemProductModel.Inventory.AllowOutOfStockPurchase)

    const itemName = kitItemProductModel.CatalogNumber ? `${Name} / ${kitItemProductModel.CatalogNumber.toString()}` : Name

    const priceNotZero = kitItemPriceModel && kitItemPriceModel.Price && kitItemPriceModel.Price.Price !== 0
    return (
      <div className={kitItemClasses} data-qaautomationinfo={kitItemProductModel.FriendlyID}>
        <div className={itemClasses}>
          <div className='item-image' onClick={this.togglePreviewModal}>
            <ImageLoader className="image" src={ImageUrl} />
          </div>
          <div className='item-name-price-quantity'>
            <div className='item-name-and-price'>
              <div className='item-name'>
                <Tooltip placement="top" text={itemName} maxLine={2} />
                {hasProperties && this.renderEditLink('big-screen-only', OutOfStock)}
                {this.renderInventoryLabel('big-screen-only')}
              </div>
              <div className='item-price'>
                {isPriceCalculating && kitItemPriceModel && priceNotZero && <LoadingDots />}
                {!isPriceCalculating && kitItemPriceModel && priceNotZero && <Price model={kitItemPriceModel.Price} isMinimumPrice={kitItemPriceModel.IsMinimumPrice} />}
              </div>
              {hasProperties && this.renderEditLink('medium-screen-only', OutOfStock)}
              {this.renderInventoryLabel('medium-or-small-screen-only')}
            </div>
            {IsIncluded && (!kitItemProductModel.Inventory || kitItemProductModel.Inventory.AllowOutOfStockPurchase === true || kitItemProductModel.Inventory.Quantity >= kitItemProductModel.Configuration.Quantity.Minimum) && <div className="quantity">
              <KitItemQuantity
                onQuantityChange={this.onQuantityChange}
                kitQuantity={kitQuantity}
                productModel={kitItemProductModel}
                orderModel={kitItemOrderItemModel}
              />
              {IsIncluded && <span className='quantity-label'>{itemUnitName}</span>}
              {kitItemProductModel.Unit.PackType &&
              <span className='quantity-per-pack'>
                  {t('KitItem.Units_of_measure_notation',
                    {
                      PackTypeName: kitItemProductModel.Unit.PackType.Name,
                      ItemQuantity: kitItemProductModel.Unit.ItemQuantity,
                      ItemTypePluralName: kitItemProductModel.Unit.ItemType.PluralName
                    })}
                </span>}
            </div>}

            {!IsIncluded && OutOfStock && <div className="out-of-stock"><Inventory model={kitItemProductModel.Inventory} minQuantity={kitItemProductModel.Configuration.Quantity.Minimum} /></div>}
            {!IsIncluded && !OutOfStock && <div className="add-btn"><div className="btn button button-secondary" onClick={this.onAdd}>{t('KitItem.Add')}</div></div>}
            {hasProperties && this.renderEditLink('small-screen-only', OutOfStock)}

          </div>
          {IsIncluded && <div className="remove-btn" onClick={this.onRemove}>×</div>}

        </div>
        {IsIncluded && hasProperties && (
          <KitItemProperties
            orderItemID={kitItemOrderItemModel.ID}
            onValidityChange={this.onInlinePropertiesValidityChange}
          />
        )}
        <Modal isOpen={this.state.isPropertiesOpen} modalClassName="kit-item-properties-modal" onOpened={this.propertiesModalOnOpened}>
          <ModalHeader><div dangerouslySetInnerHTML={{__html: `${t('KitItem.Edit_options')} - ${Name}`}}/><div className='modal-close'><div className='close-btn' onClick={this.onClickCancel}>×</div></div></ModalHeader>
          <ModalBody>
            {
              !this.state.isMediumBreak &&
              <div className="product-thumbnail"><ImageLoader className="image" src={ImageUrl} /></div>
            }
            <div className="scrollable-container" ref={(ref) => this.scrollableContainer = ref}>
              <Scrollbars className="scrollbar" universal renderThumbHorizontal={props => <div {...props} className="thumb-horizontal" />}
                          renderThumbVertical={props => <div {...props} className="thumb-vertical" />} renderView={props => <div {...props} className="view" />} ref={(ref) => this.scrollbars = ref}>
                {
                  this.state.isMediumBreak &&
                  <div className="product-thumbnail"><ImageLoader className="image" src={ImageUrl} /></div>
                }
                {
                  this.state.isPropsModalLoading &&
                  <div className="properties-loading-container"><LoadingDots /></div>
                }
                <iframe className={`iframe-modal ${this.state.isPropsModalLoading ? 'iframe-hidden' : ''}`} src={this.iframeSrc} ref={(ref) => this.iframeElementModal = ref} frameBorder="0" height="400px" title="Kit Item Modal" width="600px" scrolling="no" />
              </Scrollbars>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="cancel-btn button button-secondary thin" onClick={this.onClickCancel}>{t('KitItem.Properties_cancel')}</div>
            <div className="save-btn button button-primary thin" onClick={this.onClickSave}>{t('KitItem.Properties_save')}</div>
          </ModalFooter>
        </Modal>
        {
          doLoadIframe && IsIncluded && hasProperties &&
          <iframe src={this.iframeSrc} ref={(ref) => this.iframeElement = ref} className="iframe-hidden" title='iframe hidden'/>
        }

        <Modal isOpen={this.state.isPreviewOpen} modalClassName="kit-preview-modal" toggle={this.togglePreviewModal}
               backdropClassName="kit-preview-modal-backdrop"
        >
          <ModalBody>
            <div>
              <div className='modal-close'><div className='close-btn' onClick={this.togglePreviewModal}>×</div></div>
              <div className='modal-title'>
                <Tooltip placement="top" text={Name} maxLine={1} />
              </div>
              <div className='modal-carousel-wrapper'>
                <ImageCarousel id={`kitItemCarousel_${kitItemOrderItemModel.ID}`}
                               activeSlide={this.state.activeModalImage}
                               images={Thumbnails.map((image) => {
                                 return {
                                   Url: image
                                 }
                               })}
                               zoomAllowed={!this.state.isMediumBreak}
                />
              </div>
            </div>
          </ModalBody>
        </Modal>
      </div>
    )
  }
}

export default withRouter(KitItem)