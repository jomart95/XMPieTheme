import PreviewErrorBalloon from './static/PreviewErrorBalloon'
import Proof from './static/Proof'
import RefreshPreviewButton from './static/RefreshPreviewButton'
import React, { useEffect, useState } from 'react'
import './static/ProductProperties.scss'
import './static/StaticProduct.scss'
import './kit/KitProduct.scss'
import './Preview.scss'
import { productTypes } from '$themeservices'
import { Carousel } from 'react-responsive-carousel'
import DotCarousel from './DotCarousel'
import { ReactComponent as LeftArrow } from '$assets/icons/left_arrow.svg'
import { ReactComponent as RightArrow } from '$assets/icons/right_arrow.svg'
import MultiItemsCarousel from './MultiItemsCarousel'
import { debounce } from 'throttle-debounce'
import { LoadingDots, ImageView } from '$core-components'
import { PDFViewer } from './upload/PDFViewer'

const IMAGES_LIMIT = 20
const THAMBNAILS_LIMIT = 10

const moveOnHover = debounce(500, (nextActive, setActiveImage) => {
  if (nextActive !== -1)
    setActiveImage(nextActive)
})

const Preview = ({
  poofPreviewError,
  productThumbnails,
  isMobile,
  product,
  orderItem,
  setProofModalOpen,
  proofModalOpen,
  showRefreshPreview,
  onProofPreviewClick,
  showLoaderDots,
  disabledRefreshPreviewButton,
  isKitProduct = false,
  showThumbs = false,
  changeStickyThumbnail,
  productApprovalThumbnails = null,
  isNewUpload = false,
  isMobilePreview = false,
  properties
}) => {

  const [activeImage, setActiveImage] = useState(0)
  const [activeHoveredImage, setActiveHoveredImage] = useState(-1)
  const [isImageZoomed, setIsImageZoomed] = useState(false)
  const [swipeScrollTolerance, setSwipeScrollTolerance] = useState(30)
  const isMultiThumbnails = () => !isNewUpload && (productApprovalThumbnails?.length > 1 || productThumbnails?.Thumbnails?.length > 1)

  const isThumbsShown = () => !isNewUpload && (showThumbs && isMultiThumbnails() && productThumbnails.Thumbnails.length <= THAMBNAILS_LIMIT)
  const isDotsShown = () => isMultiThumbnails() &&
    (!showThumbs || (product && (product.Type === productTypes.DYNAMIC || product.Type === productTypes.STATIC) && productThumbnails.Thumbnails && productThumbnails.Thumbnails.length > THAMBNAILS_LIMIT))

  const changeActiveImage = (image) => {
    setActiveImage(image)
    changeStickyThumbnail && changeStickyThumbnail(image)
  }

  useEffect(() => {
    if (!isNewUpload) {
      moveOnHover(activeHoveredImage, changeActiveImage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeHoveredImage])



  const images = !isNewUpload && (productApprovalThumbnails || productThumbnails.Thumbnails || [])
  const arrowStyles = {
    position: 'absolute',
    zIndex: 2,
    top: 'calc(50% - 15px)',
    cursor: 'pointer',
  }

  const getThumbnailTitleWrapper = () => {
    const titleShouldAppear = images[activeImage]?.DisplayName && images[activeImage]?.DisplayName?.trim().length > 0
    const getTitle = (value) => <div className="thumbnail-title-wrapper">{value}</div>
    if (titleShouldAppear) {
      return getTitle(images[activeImage].DisplayName)
    }
    if (images.length > IMAGES_LIMIT) {
      return getTitle(`${activeImage + 1}/${images.length}`)
    }
    return null
  }

    const wrapperClass = ['preview-wrapper',
    product?.Type === productTypes.STATIC ? isMultiThumbnails() ? 'multi-static' : 'single-static' : '',
    product?.Type === productTypes.KIT ? 'kit' : '',
    product?.Type === productTypes.DYNAMIC ? isMultiThumbnails() ? 'multi-dynamic' : 'single-dynamic' : '',
    product?.Type === productTypes.DYNAMIC && showRefreshPreview ? 'with-preview-button' : '',
  ].filter(s => s).join(' ')

  const swipeStartHandler = (e) => {
    if (isImageZoomed) {
      setSwipeScrollTolerance(10000)
      return
    }
    return e.touches.length > 1 ? setSwipeScrollTolerance(10000) : setSwipeScrollTolerance(30)
  }

  const onFastSwipeLeft = () => (activeImage === productThumbnails?.Thumbnails.length - 1) ?
      setActiveImage(0) :
      setActiveImage( activeImage + 1)

  const onFastSwipeRight = () => (activeImage === 0) ?
      setActiveImage(productThumbnails?.Thumbnails.length - 1) :
      setActiveImage(activeImage - 1)

  return (
    <>
      <div className={wrapperClass}>
        {isNewUpload ? <PDFViewer properties={properties} isMobile={isMobile} product={product} orderItem={orderItem} stickyPreview={true} isMobilePreview={isMobilePreview}/> :
        <div className="preview-area-wrapper">
          <Carousel
              infiniteLoop={true}
              showIndicators={false}
              showStatus={false}
              useKeyboardArrows={true}
              showThumbs={false}
              thumbWidth={64}
              onChange={changeActiveImage}
              selectedItem={activeImage}
              preventMovementUntilSwipeScrollTolerance={true}
              swipeable={true}
              swipeScrollTolerance={swipeScrollTolerance}
              onSwipeStart={swipeStartHandler}
              onSwipeForward={() =>  setActiveImage(Math.min(productThumbnails?.Thumbnails.length - 1, activeImage + 1))}
              onSwipeBackwards={() => setActiveImage(Math.max(0, activeImage - 1))}
              renderArrowPrev={(onClickHandler, hasPrev, label) =>
                  hasPrev && !isImageZoomed && (
                      <LeftArrow width="40px" height="40px" onClick={onClickHandler}
                                 style={{ ...arrowStyles, left: 35 }}/>
                  )
              }
              renderArrowNext={(onClickHandler, hasNext, label) =>
                  hasNext && !isImageZoomed && (
                      <RightArrow width="40px" height="40px" onClick={onClickHandler}
                                  style={{ ...arrowStyles, right: 35 }}/>
                  )
              }
          >
            {images.length && images.map((image, index) => {
              return (
                  <div className="inner-carousel-image-wrapper" key={image.Url || image + index}>
                    {!isKitProduct && <PreviewErrorBalloon {...{ poofPreviewError }}/>}
                    {showLoaderDots && <div className="carousel-dots-loader">
                      <LoadingDots/>
                    </div>}
                    <div className="image-wrapper">
                      <ImageView index={index} activeImage={activeImage} src={image.Url || image}
                                 zoomAllowed={true} isImageZoomed={isImageZoomed} setIsImageZoomed={setIsImageZoomed}
                                 onFastSwipeLeft={onFastSwipeLeft}

                                 onFastSwipeRight={onFastSwipeRight}
                      />
                    </div>
                  </div>
              )
            })}
          </Carousel>
          <div className="preview-thumbnail-title">
            {!isKitProduct && getThumbnailTitleWrapper()}
            {
              isMobile && product &&
              <Proof
                currentProduct={product}
                isMobile={isMobile}
                hasThumbnails
                orderItemId={orderItem.ID}
                onToggle={() => setProofModalOpen(!proofModalOpen)}
                hideLink={isMobile ? product.Type === productTypes.STATIC && !product.Proof : false}
              />
            }
          </div>
          {isThumbsShown() &&
              <MultiItemsCarousel
                  leftArrow={{
                    width: 7, height: 12
                  }}
                  rightArrow={{
                    width: 7, height: 12
                  }}
                  styles={{ width: `100%` }}
                  images={images.map(image => image.Url)}
                  onItemClicked={changeActiveImage}
                  onItemHovered={setActiveHoveredImage}
                  activeImage={activeImage}
                  hideDisabledArrows={false}
              />}
          {isDotsShown() &&
              <DotCarousel images={images} active={activeImage} onDotClick={(id) => setActiveImage(id)}/>}
          {!isMobile && product && product.Proof &&
              <Proof
                  currentProduct={product}
                  isMobile={isMobile}
                  hasThumbnails
                  orderItemId={orderItem.ID}
                  onToggle={() => setProofModalOpen(!proofModalOpen)}
                  hideLink={isMobile ? product.Type === productTypes.STATIC && !product.Proof : false}
              />
          }
        </div>
        }
      </div>
        {!isNewUpload && !isKitProduct && <RefreshPreviewButton {...{
          showRefreshPreview,
          onProofPreviewClick,
          disabled: disabledRefreshPreviewButton
        }}/>}
    </>
  )
}

export default Preview
