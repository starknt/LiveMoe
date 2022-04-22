import { useCallback, useState } from 'react';

export default function useUpdate() {
  const [_, setUpdate] = useState({});

  return useCallback(() => setUpdate({}), []);
}
