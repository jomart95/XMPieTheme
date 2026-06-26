import {useEffect} from 'react'

const useOutsideClick = (ref, callback, documentRoot) => {
  useEffect(() => {
    const doc = process.env.REACT_APP_WEB_COMPONENT ? documentRoot : document

    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback(event)
      }
    }

    doc.addEventListener('mousedown', handleClickOutside)

    return () => {
      doc.removeEventListener('mousedown', handleClickOutside)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, callback])
}

export default useOutsideClick
