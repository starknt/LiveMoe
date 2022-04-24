import { useCallback, useState } from 'react'

export default function useToggle(
  initalize = false,
): [boolean, () => void] {
  const [state, setState] = useState(() => initalize)

  const toggle = useCallback(() => {
    setState(prev => !prev)
  }, [])

  return [state, toggle]
}
