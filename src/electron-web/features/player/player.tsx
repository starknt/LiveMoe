import useDragable from 'electron-web/hooks/useDragable';
import useEventListener from 'electron-web/hooks/useEventListener';
import useMouse from 'electron-web/hooks/useMouse';
import { useCallback, useRef } from 'react';
import styled from 'styled-components';

const PlayerContainer = styled.div`
  position: absolute;
  width: 50px;
  height: 50px;
  background-color: red;
  z-index: 99;
`;

export default function Player() {
  const { x, y } = useMouse();
  const player = useRef<HTMLDivElement | null>(null);

  const calculatePositionIsCanMove = useCallback(() => {}, [x, y]);

  const { isDragging } = useDragable(player, {
    onStart: (pos) => {
      return true;
    },
    onMove: (pos) => {
      if (player.current) {
        player.current.style.left = `${pos.x}px`;
        player.current.style.top = `${pos.y}px`;
      }
    },
    onEnd: (pos) => {},
  });

  // Dev
  useEventListener(
    'keyup',
    (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'e') {
        window.location.reload();
      }
    },
    { target: window }
  );

  return (
    <PlayerContainer ref={player}>
      {isDragging ? 'Dragging' : 'Not Dragging'}
    </PlayerContainer>
  );
}
