export function isVaildValue(x: any) {
  return !isNil(x) && x ? true : false;
}

export function isNull(x: any) {
  return x === null ? true : false;
}

export function isUndefined(x: any) {
  return x === undefined ? true : false;
}

export function isNil(x: any) {
  return isNull(x) || isUndefined(x) ? true : false;
}

export function withNullAsUndefined(x: any) {
  return x === null ? undefined : x;
}

export function withUndefinedAsNull(x: any) {
  return x === undefined ? null : x;
}

export function withT1AsT2<T2, T1 = any>(x: T1) {
  return x as unknown as T2;
}

export function withMinAndMax(x: number, min: number, max: number) {
  return x >= min && x <= max;
}
