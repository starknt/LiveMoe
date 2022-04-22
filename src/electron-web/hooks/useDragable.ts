import { useCallback, useState } from 'react';
import useEventListener from './useEventListener';
import useLatest from './useLatest';
import { BasicTarget, getTargetElement } from './utils';

interface Options {
  onStart?: (position: Position, ev: PointerEvent) => boolean;
  onMove?: (position: Position, ev: PointerEvent) => void;
  onEnd?: (position: Position, ev: PointerEvent) => void;
}

export interface Position {
  x: number;
  y: number;
}

export default function useDragable(
  target: BasicTarget<HTMLElement>,
  options: Options = {}
) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragingElement = useLatest(window);
  const [processDelta, setProcessDelta] = useState<Position | null>(null);
  const optionsRef = useLatest(options);

  const handleEvent = useCallback((e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const start = useCallback((e: PointerEvent) => {
    const _target = getTargetElement(target);

    if (!_target) return;

    if (e.target !== _target) return;

    const rect = _target.getBoundingClientRect();

    const pos: Position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    if (optionsRef.current.onStart?.(pos, e) === true) {
      setProcessDelta(pos);
    }

    handleEvent(e);
  }, []);

  const move = useCallback(
    (e: PointerEvent) => {
      if (!processDelta) return;

      const position = {
        x: e.pageX - processDelta.x,
        y: e.pageY - (processDelta.y * 2),
      };
      setPosition(position);
      optionsRef.current.onMove?.(position, e);
      handleEvent(e);
    },
    [processDelta, position]
  );

  const end = useCallback(
    (e: PointerEvent) => {
      if (!processDelta) return;

      setProcessDelta(null);
      optionsRef.current.onEnd?.(position, e);
      handleEvent(e);
    },
    [processDelta, position]
  );

  useEventListener('mousedown', start, { target });

  useEventListener('mousemove', move, { target: dragingElement });

  useEventListener('mouseup', end, { target: dragingElement });

  return { ...position, isDragging: !!processDelta };
}
