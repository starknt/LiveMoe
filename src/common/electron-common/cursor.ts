export interface CursorResourceStruct {
  APPSTARTING: string;
  Normal: string;
  Hand: string;
  Cross: string;
  IBeam: string;
  No: string;
  SizeAll: string;
  SizeNESW: string;
  SizeNS: string;
  SizeNWSE: string;
  SizeWE: string;
  SizeUpArrow: string;
  SizeWait: string;
}

export interface CursorConfiguration {
  schema: CursorConfigurationSchema;
  enabled: boolean;
  preview: string;
  baseUrl: string; // 运行时添加
}

export interface CursorConfigurationSchema {
  OCR_APPSTARTING: string;
  OCR_NORMAL: string;
  OCR_IBEAM: string;
  OCR_CROSS: string;
  OCR_HAND: string;
  OCR_NO: string;
  OCR_SIZEALL: string;
  OCR_SIZENESW: string;
  OCR_SIZENS: string;
  OCR_SIZENWSE: string;
  OCR_SIZEWE: string;
  OCR_UP: string;
  OCR_WAIT: string;
}
