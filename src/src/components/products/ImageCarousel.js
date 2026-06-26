import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Carousel, CarouselItem } from 'reactstrap-wc'
import { useSwipeable } from 'react-swipeable'
import DotCarousel from './DotCarousel'
import { debounce} from 'throttle-debounce'
import { ImageZoom, LoadingDots, ImageLoader } from '$core-components'
import MultiItemsCarousel from './MultiItemsCarousel'
import { ReactComponent as LeftArrow } from '$assets/icons/left_arrow.svg'
import { ReactComponent as RightArrow } from '$assets/icons/right_arrow.svg'
import './ImageCarousel.scss'

const IMAGES_LIMIT = 20

const moveOnHover = debounce(500, (nextActive, setActiveImage) => {
  if (nextActive !== -1)
    setActiveImage(nextActive)
})


const ImageCarousel = ({images = [], zoomAllowed = true, showLoaderDots = false, isStretched = false }) => {
  const wrapper = useRef(null)
  const [animating, setAnimating] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [activeHoveredImage, setActiveHoveredImage] = useState(-1)
  const [showArrows, setShowArrows] = useState(true)

  useEffect(() => {
    setAnimating(false)
    if (images.length < activeImage) {
      setActiveImage(images.length - 1)
    }

    setActiveHoveredImage(-1)
    setShowArrows(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images])

  useEffect(() => {
      moveOnHover(activeHoveredImage, setActiveImage)
  }, [activeHoveredImage])

  const handlers = useSwipeable({
    onSwipedLeft: () => slides.length > 1 && next(),
    onSwipedRight: () => slides.length > 1 && previous(),
    preventDefaultTouchmoveEvent: true,
    trackTouch: true,
  })

  const triggerZoomed = useCallback((imageZoomed) => {
    if (imageZoomed) {
      setShowArrows(false)
    } else {
      setShowArrows(true)
    }
  }, [])

  const next = () => {
    if (animating) return
    const nextIndex = activeImage === images.length - 1 ? 0 : activeImage + 1
    setActiveImage(nextIndex)
  }

  const previous = () => {
    if (animating) return
    const nextIndex = activeImage === 0 ? images.length - 1 : activeImage - 1
    setActiveImage(nextIndex)
  }

  const slides = images.map((image, index) => (
    <CarouselItem
      key={image.Url + index}
      onExiting={() => setAnimating(true)}
      onExited={() => setAnimating(false)}
    >
      <div className="image-wrapper">
        {zoomAllowed
          ? <ImageZoom onImageZoomed={triggerZoomed} src={image.Url} isStretched={isStretched} />
          : <ImageLoader className='image' src={image.Url} isStretched={isStretched}/>
        }
      </div>
    </CarouselItem>
  ))

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

  if (!images || images.length === 0) return null

  return (
    <div ref={wrapper} className="main-carousel-wrapper">
      <div
        id="image-carousel-wrapper"
        className="image-carousel-wrapper carousel-fade"
      >
        {slides.length > 1 &&
          <span className={`arrows left-arrow${showArrows ? ' show' : ''}`}>
            <LeftArrow width="40px" height="40px" onClick={previous} />
          </span>
        }
        <div {...handlers}>
          <Carousel
            interval={false}
            previous={previous}
            next={next}
            activeIndex={activeImage}>
            {slides}
          </Carousel>
        </div>
        {slides.length > 1 &&
          <span className={`arrows right-arrow${showArrows ? ' show' : ''}`}>
            <RightArrow width="40px" height="40px" onClick={next} />
          </span>
        }
      </div>
      {getThumbnailTitleWrapper()}
      {images.length > 1 &&
        <MultiItemsCarousel
          leftArrow={{
            width: 7, height: 12
          }}
          rightArrow={{
            width: 7, height: 12
          }}
          styles={{ width: `100%` }}
          images={images.map(image => image.Url)}
          onItemClicked={setActiveImage}
          onItemHovered={setActiveHoveredImage}
          activeImage={activeImage}
          hideDisabledArrows={false}
        />}
      <DotCarousel images={images} active={activeImage} onDotClick={(id) => setActiveImage(id)} />
      {showLoaderDots && <div className="carousel-dots-loader">
        <LoadingDots/>
      </div>}
    </div>
  )
}

export default ImageCarousel
