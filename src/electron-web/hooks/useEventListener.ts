import { useEffect, useRef } from 'react';
import useLatest from './useLatest';
import useUnmount from './useUnmount';
import { BasicTarget, getTargetElement } from './utils';

export interface Options<T extends Target = Target> {
  target?: T;
  capture?: boolean;
  once?: boolean;
  passive?: boolean;
}

export type Target = BasicTarget<HTMLElement | Element | Window | Document>;

export default function useEventListener<K extends keyof HTMLElementEventMap>(
  eventName: K,
  handler: (ev: HTMLElementEventMap[K]) => void,
  options?: Options<HTMLElement>
): void;
export default function useEventListener<K extends keyof ElementEventMap>(
  eventName: K,
  handler: (ev: ElementEventMap[K]) => void,
  options?: Options<Element>
): void;
export default function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (ev: DocumentEventMap[K]) => void,
  options?: Options<Document>
): void;
export default function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (ev: WindowEventMap[K]) => void,
  options?: Options<Window>
): void;
export default function useEventListener(
  type: string,
  handler: (...p: any[]) => void,
  options?: Options
): void {
  const hasInitRef = useRef(false);
  const handlerRef = useLatest<null | ((...p: any[]) => void)>(handler);
  const unListenerRef = useLatest<null | ((...p: any[]) => void)>(null);

  useEffect(() => {
    if (!hasInitRef.current) {
      hasInitRef.current = true;

      const targetElement = getTargetElement(options?.target, window);

      if (!targetElement?.addEventListener) {
        return;
      }

      handlerRef.current = handler;

      const eventListener = (event: Event) => {
        handlerRef.current?.(event);
      };

      targetElement.addEventListener(type, eventListener, {
        capture: options?.capture,
        once: options?.once,
        passive: options?.passive,
      });

      if (!unListenerRef.current) {
        unListenerRef.current = () => {
          targetElement.removeEventListener(type, eventListener, {
            capture: options?.capture,
          });
        };
      }
    }
  }, []);

  useUnmount(() => {
    hasInitRef.current = false;
    unListenerRef.current?.();
  });
}
