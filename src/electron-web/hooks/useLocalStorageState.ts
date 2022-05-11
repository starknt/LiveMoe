import { useCallback, useEffect, useState } from 'react'
import useMemoizedFn from './useMemoizedFn'
import useUpdateEffect from './useUpdateEffect'

export default function useLocalStorageState<T>(
  key: string,
  initialValue: T,
  watch?: boolean,
): [T | undefined, (value?: T | ((prevState?: T) => T)) => void] {
  watch = watch ?? false

  const getStoredValue = useCallback(() => {
    try {
      const value = localStorage.getItem(key)
      if (value)
        return JSON.parse(value)

      if (typeof initialValue === 'function')
        return initialValue()

      return initialValue
    }
    catch (error) {
      console.error(error)

      if (typeof initialValue === 'function')
        return initialValue()

      return initialValue
    }
  }, [])

  const [storage, setValue] = useState<T | undefined>(() => getStoredValue())

  useEffect(() => {
    if (!watch)
      return

    const timer = setInterval(() => {
      try {
        const value = localStorage.getItem(key)

        if (value && JSON.stringify(value) !== JSON.stringify(storage))
          setValue(JSON.parse(value))
      }
      catch {}
    }, 50)

    return () => clearInterval(timer)
  }, [watch])

  useUpdateEffect(() => {
    setValue(getStoredValue())
  }, [key])

  const setStorageValue = useMemoizedFn(
    (value?: T | ((prevState?: T) => T)) => {
      if (typeof value === 'undefined') {
        setValue(undefined)
        localStorage?.removeItem(key)
      }
      else if (typeof value === 'function') {
        const currentState = (value as Function)(storage)
        try {
          setValue(currentState)
          localStorage?.setItem(key, JSON.stringify(currentState))
        }
        catch (e) {
          console.error(e)
        }
      }
      else {
        try {
          setValue(value)
          localStorage?.setItem(key, JSON.stringify(value))
        }
        catch (e) {
          console.error(e)
        }
      }
    },
  )

  return [storage, setStorageValue]
}
