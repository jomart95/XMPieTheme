import { useEffect, useRef, useState } from 'react'

const useUpdateProperties = () => {
  const promises = useRef([])
  const [loading, setLoading] = useState(false)
  const lastPromise = useRef(null)
  const lastCallback = useRef(null)

  const addPromise = (promise, callback) => {
    promises.current =  [...promises.current, promise]
    lastPromise.current = promise
    lastCallback.current = callback
  }

  useEffect(() => {
    const resolvePromises = async () => {
      setLoading(true)
      try {
        const promiseToResolve = await promises.current[0]
        if (promises.current[0] === lastPromise.current) {
          await lastCallback.current(promiseToResolve)
        }
        promises.current = promises.current.slice(1)
      } catch (e) {
        console.error(e)
        await lastCallback.current(null, e)
      }
      setLoading(false)
    }

    if (promises.current.length > 0) {
      resolvePromises()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promises.current])

  return {
    addPromise,
    loading
  }
}

export default useUpdateProperties
