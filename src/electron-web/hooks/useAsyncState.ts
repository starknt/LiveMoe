import { isPromise } from 'common/electron-common/types'
import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useState } from 'react'
import useLatest from './useLatest'

export default function useAsyncState<S>(initialStateFunc: (() => Promise<Awaited<S>>), initialState: Awaited<S>): [S, Dispatch<SetStateAction<S>>] {
  const [state, setState] = useState<S>(initialState)
  const inited = useLatest(false)

  useEffect(() => {
    if (typeof initialStateFunc === 'function' && !inited.current) {
      inited.current = true
      const initialState = initialStateFunc()

      if (isPromise(initialState)) {
        initialState.then(setState).catch(() => {
          console.error('useAsyncState', 'initialState is a promise, but it failed to resolve')
        })
      }
    }

    return () => {
      inited.current = false
    }
  }, [])

  return [state, setState]
}
