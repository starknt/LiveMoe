import { useState } from 'react'

export default function useSize() {
  const [size, setSize] = useState({ width: 0, height: 0 })
}
