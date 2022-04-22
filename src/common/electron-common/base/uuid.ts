const UUIDPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUUID(value: string): boolean {
  return UUIDPattern.test(value);
}

const data = new Uint8Array(16);
const hex: string[] = [];
for (let i = 0; i < 256; i++) {
  hex.push(i.toString(16).padStart(2, '0'));
}

const _fillRandomValues = function (bucket: Uint8Array): Uint8Array {
  for (let i = 0; i < bucket.length; i++) {
    bucket[i] = Math.floor(Math.random() * 256);
  }
  return bucket;
};

export function generateUuid(): string {
  // get data
  _fillRandomValues(data);

  // set version bits
  data[6] = (data[6] & 0x0f) | 0x40;
  data[8] = (data[8] & 0x3f) | 0x80;

  // print as string
  let i = 0;
  let result = '';
  result += hex[data[i++]];
  result += hex[data[i++]];
  result += hex[data[i++]];
  result += hex[data[i++]];
  result += '-';
  result += hex[data[i++]];
  result += hex[data[i++]];
  result += '-';
  result += hex[data[i++]];
  result += hex[data[i++]];
  result += '-';
  result += hex[data[i++]];
  result += hex[data[i++]];
  result += '-';
  result += hex[data[i++]];
  result += hex[data[i++]];
  result += hex[data[i++]];
  result += hex[data[i++]];
  result += hex[data[i++]];
  result += hex[data[i++]];
  return result;
}
