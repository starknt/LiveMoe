import { isNull } from "./types";

function deepProxy<T extends Record<string, any>>(
  target: T,
  handler: ProxyHandler<T>
): T {
  for (const key in target) {
    let value = target[key];
    if (typeof value === 'object') {
      if(isNull(value)) {
        // @ts-ignore
        value = {};
      }

      target[key] = deepProxy(value, handler);
    }
  }

  return new Proxy(target, handler);
}

export const reactive = <T extends Record<string | symbol | number, any>>(
  target: T,
  handler: ProxyHandler<T>
) => {
  return deepProxy(target, handler);
};
