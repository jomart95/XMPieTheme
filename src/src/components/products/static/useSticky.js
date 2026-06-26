import { useEffect, useRef, useState } from 'react'

export const useSticky = (topMarkerRef, bottomMarkerRef, easyUploadTopMarkerRef) => {
  const [showStickyPrice, setShowStickyPrice] = useState(true)
  const [topIntersecting, setTopIntersecting] = useState(false)
  const [bottomIntersecting, setBottomIntersecting] = useState(false)
  const [topEasyUploadIntersecting, setTopEasyUploadIntersecting] = useState(false)

  const topObserver = useRef(null)
  const easyUploadTopObserver = useRef(null)
  const bottomObserver = useRef(null)

  useEffect(() => {
    setShowStickyPrice(!topIntersecting && !bottomIntersecting && !topEasyUploadIntersecting)
  }, [topIntersecting, bottomIntersecting, topEasyUploadIntersecting])

  const observeCallback = (entries) => {
    entries.forEach((entry) => {
      if (easyUploadTopMarkerRef && entry.target === easyUploadTopMarkerRef.current) {
        setTopEasyUploadIntersecting(entry.isIntersecting)
        setTopIntersecting(entry.isIntersecting)
      }
      if (topMarkerRef && entry.target === topMarkerRef.current) {
        setTopIntersecting(entry.isIntersecting)
      }
      if (bottomMarkerRef && entry.target === bottomMarkerRef.current) {
        setBottomIntersecting(entry.isIntersecting)
      }
    })
  }

  const stickyConnect = () => {
    if (topMarkerRef) {
      topObserver.current = new IntersectionObserver(observeCallback, {
        root: null,
        rootMargin: '0px',
        threshold: 0.2,
      })
      topObserver.current.observe(topMarkerRef.current)
    }

    if (bottomMarkerRef) {
      bottomObserver.current = new IntersectionObserver(observeCallback, {
        root: null,
        rootMargin: '0px',
        threshold: 0.999,
      })
      bottomObserver.current.observe(bottomMarkerRef.current)
    }

    if (easyUploadTopMarkerRef && easyUploadTopMarkerRef.current) {
      easyUploadTopObserver.current = new IntersectionObserver(observeCallback, {
        root: null,
        rootMargin: '0px',
        threshold: 0.2,
      })
      easyUploadTopObserver.current.observe(easyUploadTopMarkerRef.current)
    }
  }

  const stickyDisconnect = () => {
    topObserver?.current?.disconnect()
    bottomObserver?.current?.disconnect()
    easyUploadTopMarkerRef?.current?.disconnect()
  }

  return {
    showStickyPrice,
    stickyConnect,
    stickyDisconnect
  }

}



