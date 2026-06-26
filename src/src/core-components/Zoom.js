import React, { useEffect, useState, useRef } from 'react'
import './ImageLoader.scss'
import { ImageLoader } from './index'
import { useControls, useTransformEffect, useTransformContext } from 'react-zoom-pan-pinch'

const Zoom = ({
  className,
  src,
  setShowLoading,
  activeImage,
  index,
  setIsImageZoomed,
}) => {
  const [scale, setScale] = useState(1)
  const [isPanning, setIsPanning] = useState()
  const transformCoordinates = useRef(null)
  const [allowPanning, setAllowPanning] = useState(false)
  const { resetTransform, zoomIn, zoomOut } = useControls()
  const context = useTransformContext()

  useEffect(() => {
    if (scale > 1 && index !== activeImage) {
      resetTransform()
    }
    return () => resetTransform()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeImage])

  useTransformEffect(({ state, instance }) => {
    setIsImageZoomed(state.scale > 1)
    setScale(state.scale)
    setIsPanning(instance.isPanning)
  })

  const onClick = (e) => {
    if (isPanning) return
    transformCoordinates.current = {
      x: e.pageX,
      y: e.pageY
    }
    const { transformState } = context
    if (transformState.scale === 1) {
      zoomIn()
    } else {
      zoomOut()
    }
    setAllowPanning(!allowPanning)
  }

  const onMouseMove = (e) => {
    if (allowPanning) {
      const currentCoordinates = {
        x: e.pageX,
        y: e.pageY
      }
      const deltaX = transformCoordinates.current.x - currentCoordinates.x
      const deltaY = transformCoordinates.current.y - currentCoordinates.y
      transformCoordinates.current = currentCoordinates

      const newCoordinateX = context.transformState.positionX + deltaX
      const newCoordinateY = context.transformState.positionY + deltaY
      context.setTransformState(context.transformState.scale, newCoordinateX, newCoordinateY)
    }
  }

  const onMouseLeave = () => {
    setAllowPanning(false)
    resetTransform()
  }

  const getPinchPanClasses = () => {
    if (isPanning) return 'panning'
    return scale > 1 ? 'zoomOut' : 'zoomIn'
  }

  return (
    <ImageLoader
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onMouseMove={onMouseMove}
      className={`${className || ''} ${getPinchPanClasses()}`}
      setShowLoading={setShowLoading}
      src={src}
      activeImage={activeImage}
    />
  )
}

export default Zoom
