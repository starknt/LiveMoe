import { useEffect } from 'react';

export default function useOnceEffect(effect: React.EffectCallback) {
  useEffect(effect, []);
}
