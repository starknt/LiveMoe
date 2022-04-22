import { useCallback, useState } from 'react';
import useEventListener from './useEventListener';

export default function useMouse() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const onMouseMove = useCallback((e: WindowEventMap['mousemove']) => {
    if (e) {
      setPosition({ x: e.pageX, y: e.pageY });
    }
  }, []);

  const removeEventListener = useEventListener('mousemove', onMouseMove);

  return { ...position, removeEventListener };
}
