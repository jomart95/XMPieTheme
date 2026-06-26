import { useCallback, useEffect, useRef, useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import ImageLoader from '$core-components/ImageLoader'
import { ReactComponent as LeftArrow } from '$assets/icons/dark_left_arrow.svg'
import { ReactComponent as RightArrow } from '$assets/icons/dark_right_arrow.svg'
import './MultiItemsCarousel.scss'

const MultiItemsCarousel = (props) => {
  const {
    leftArrow = {
      width: 20, height: 40
    },
    rightArrow = {
      width: 20, height: 40
    },
    hideDisabledArrows = true,
    itemWidth = 64,
    itemHeight = 64,
    borderWidth = 1,
    marginBetween = 9,
    responsive = {
      1919: { items: 7 },
      1199: { items: 4 }
    },
    images = [],
    items = [],
    onItemHovered,
    onItemClicked,
    activeImage = -1,
    styles
  } = props

  const [carouselWidth, setCarouselWidth] = useState('0')
  const [activeIndex, setActiveIndex] = useState(0)
  const [children, setChildren] = useState([])
  const [leftPos, setLeftPos] = useState(borderWidth)
  const carouselWrapperRef = useRef()
  const carouselInnerWrapperRef = useRef()
  const calculateLeftPos = useCallback(() => {
    if (activeIndex === 0) {
      setLeftPos(borderWidth)
    } else {
      const left = (itemWidth + marginBetween) * activeIndex - borderWidth
      setLeftPos(`-${left}`)
    }
  }, [activeIndex, borderWidth, itemWidth, marginBetween])

  useEffect(() => {
    const itemsPerSlide = getItemsPerSlide()
    const dif = activeImage - activeIndex

    if (dif === itemsPerSlide) {
      setActiveIndex(activeImage - itemsPerSlide + 1)
    }
    if (activeIndex === activeImage && activeIndex !==0) {
      setActiveIndex(activeImage - 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeImage, responsive])

  useEffect(() => {
    setActiveIndex(0)
  }, [children.length])

  useEffect(() => {
    setChildren(images && images.length ? images : items)
  }, [images, items])

  useEffect(() => {
    calculateLeftPos()
  }, [activeIndex, calculateLeftPos])

  const handlers = useSwipeable({
    onSwipedLeft: () => !rightArrowDisabled && setActiveIndex(next),
    onSwipedRight: () => !leftArrowDisabled && setActiveIndex(prev),
    preventDefaultTouchmoveEvent: true,
    trackTouch: true,
  })

  const getHideArrows = () => {
    return (carouselWrapperRef.current?.clientWidth + marginBetween) / (itemWidth + marginBetween) > images.length
  }

  const calculateLeftPosCallbackRef = useRef(calculateLeftPos)
  const getHideArrowsCallbackRef  = useRef(getHideArrows)
  useEffect(() => {
    calculateLeftPosCallbackRef.current = calculateLeftPos
    getHideArrowsCallbackRef.current = getHideArrows
  });

  useEffect(() => {
    const calculateLeftPosCallback = e => calculateLeftPosCallbackRef.current(e);
    const getHideArrowsCallback = e => getHideArrowsCallbackRef.current(e);

    const calculateCarouselWidth = () => {
      setCarouselWidth(getHideArrowsCallback() ? '100%' : '80%')// `${itemWidth * itemsPerSlide + marginBetween * (itemsPerSlide - 1) + borderWidth * 2}px`)
    }

    const onResize = () => {
      setActiveIndex(0)
      calculateCarouselWidth()
      calculateLeftPosCallback()
    }

    onResize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    const getHideArrowsCallback = e => getHideArrowsCallbackRef.current(e);
    setCarouselWidth(getHideArrowsCallback() ? '100%' : '80%')
  }, [images, items])

  const calculateSlideTo = (length) => {
    const itemsPerSlide = getItemsPerSlide()
    const itemsLeft = length - itemsPerSlide - activeIndex

    const next = itemsLeft >= itemsPerSlide ? activeIndex + itemsPerSlide : activeIndex + itemsLeft
    const prev = activeIndex < itemsPerSlide ? 0 : activeIndex - itemsPerSlide

    return { next, prev }
  }

  const getItemsPerSlide = () => Math.floor((carouselWrapperRef?.current?.clientWidth + marginBetween) / (itemWidth + marginBetween)) || 1

  const itemsPerSlide = getItemsPerSlide()

  const rightArrowDisabled = activeIndex + itemsPerSlide >= children.length
  const leftArrowDisabled = activeIndex === 0

  const { next, prev } = calculateSlideTo(children.length)

  if ((!images || !images.length) && (!items || !items.length)) {
    return null
  }

  return (
    <div style={styles} className="multi-carousel-container" {...handlers}>
      {!getHideArrows() && <div
        style={{ width: leftArrow.width }}
        className={`multi-carousel-arrow left-arrow${leftArrowDisabled ? ' disabled' : ''}`}
      >
        {hideDisabledArrows && leftArrowDisabled ? null
          : <LeftArrow
            onClick={() => !leftArrowDisabled && setActiveIndex(prev)}
            name={leftArrow.svg}
            width={`${leftArrow.width}px`}
            height={`${leftArrow.height}px`}
          />
        }
      </div>}
      <div
        style={{
          width: carouselWidth,
          height: `${itemHeight + borderWidth * 2}px`
        }}
        className="multi-carousel-wrapper"
        ref={carouselWrapperRef}
      >
        <div
          style={{ left: `${leftPos}px` }}
          className="multi-carousel"
          ref={carouselInnerWrapperRef}
        >
          {items && items.length
            ? items.map((item, i) => (
              <div
                onMouseOver={() => onItemHovered && onItemHovered(i)}
                onMouseLeave={() => onItemHovered && onItemHovered(-1)}
                onClick={() => onItemClicked && onItemClicked(i)}
                style={{ width: `${itemWidth}px`, height: `${itemHeight}px`, marginRight: `${marginBetween}px` }}
                className="multi-carousel-item-wrapper"
                key={`item_${i}`}
              >
                {item}
              </div>
            ))
            : images.map((image, i) => (
              <div
                onMouseOver={() => onItemHovered && onItemHovered(i)}
                onMouseLeave={() => onItemHovered && onItemHovered(-1)}
                onClick={() => onItemClicked && onItemClicked(i)}
                style={{ width: `${itemWidth}px`, height: `${itemHeight}px`, marginRight: `${marginBetween}px` }}
                className={`multi-carousel-item-wrapper${i === activeImage ? ' highlight-border' : ''}`}
                key={`image_${i}`}
              >
                <ImageLoader className="multi-carousel-image" src={image} />
              </div>
            ))}
        </div>
      </div>
      {!getHideArrows() && <div
        style={{ width: rightArrow.width }}
        className={`multi-carousel-arrow right-arrow${rightArrowDisabled ? ' disabled' : ''}`}
      >
        {hideDisabledArrows && rightArrowDisabled ? null
          : <RightArrow
            onClick={() => !rightArrowDisabled && setActiveIndex(next)}
            width={`${rightArrow.width}px`}
            height={`${rightArrow.height}px`}
          />
        }
      </div>}
    </div>
  )
}

export default MultiItemsCarousel
