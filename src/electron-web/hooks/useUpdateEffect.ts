import { useEffect, useRef } from 'react'

export default function useUpdateEffect(effect: () => void, deps: any[]) {
  const mounted = useRef(false)

  useEffect(() => {
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!mounted.current)
      mounted.current = true
    else
      return effect()
  }, deps)
}
