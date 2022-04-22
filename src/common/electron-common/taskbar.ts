export enum ACCENT { // Values passed to SetWindowCompositionAttribute determining the appearance of a window
  ACCENT_ENABLE_GRADIENT = 1, // Use a solid color specified by nColor. This mode ignores the alpha value and is fully opaque.
  ACCENT_ENABLE_TRANSPARENTGRADIENT = 2, // Use a tinted transparent overlay. nColor is the tint color.
  ACCENT_ENABLE_BLURBEHIND = 3, // Use a tinted blurry overlay. nColor is the tint color.
  ACCENT_ENABLE_FLUENT = 4, // Use an aspect similar to Fluent design. nColor is tint color. This mode bugs if the alpha value is 0.

  ACCENT_NORMAL = 150, // (Fake value) Emulate regular taskbar appearance
}

export interface TASKBAR_APPEARANCE {
  /**
   * @description ACCENT_ENABLE_GRADIENT = 1 该配置会忽略透明值, 并且完全不透明
   * @description ACCENT_ENABLE_TRANSPARENTGRADIENT = 2 使用有色透明覆盖层, 颜色是色调颜色.
   * @description ACCENT_ENABLE_BLURBEHIND = 3 使用有色模糊叠加, 颜色是色调颜色.
   * @description ACCENT_ENABLE_FLUENT = 4 使用类似于 Fluent 设计的方面.nColor 是色调颜色. 如果 alpha 值为 0,则此模式会出错.
   * @description ACCENT_NORMAL = 150, // 假值(Fake value) 模拟常规任务栏外观
   */
  ACCENT: ACCENT;
  /**
   * @description COLOR是一个32位的16进制的aRGB(AARRGGBB)格式的值
   */
  COLOR: number;
}

export const REGULAR_APPEARANCE: TASKBAR_APPEARANCE = {
  ACCENT: ACCENT.ACCENT_ENABLE_TRANSPARENTGRADIENT,
  COLOR: 0x00263238,
};
export const MAXIMISED_APPEARANCE: TASKBAR_APPEARANCE = {
  ACCENT: ACCENT.ACCENT_ENABLE_BLURBEHIND,
  COLOR: 0xaa000000,
};
export const START_APPEARANCE: TASKBAR_APPEARANCE = {
  ACCENT: ACCENT.ACCENT_NORMAL,
  COLOR: 0x00263238,
};
export const CORTANA_APPEARANCE: TASKBAR_APPEARANCE = {
  ACCENT: ACCENT.ACCENT_NORMAL,
  COLOR: 0x0,
};
export const TIMELINE_APPEARANCE: TASKBAR_APPEARANCE = {
  ACCENT: ACCENT.ACCENT_NORMAL,
  COLOR: 0x0,
};
export const BLURBEHIND_APPEARANCE: TASKBAR_APPEARANCE = {
  ACCENT: ACCENT.ACCENT_ENABLE_BLURBEHIND,
  COLOR: 0x0,
};
export const FLUENT_APPEARANCE: TASKBAR_APPEARANCE = {
  ACCENT: ACCENT.ACCENT_ENABLE_FLUENT,
  COLOR: 0x0,
};

export function makeAppearance(
  accent: ACCENT,
  color: number
): TASKBAR_APPEARANCE {
  return {
    ACCENT: accent,
    COLOR: color,
  };
}

export interface ITaskbarCofniguration {
  enabled: boolean;
  style: TASKBAR_APPEARANCE;
}

export function toARGB(rgba: string | number) {
  if (typeof rgba === 'number') {
    const r = (rgba & 0xffffffff) >>> 24;
    const g = (rgba & 0x00ffffff) >>> 16;
    const b = (rgba & 0x0000ffff) >>> 8;
    const a = (rgba & 0x000000ff) >>> 0;
    return (a << 24) + (r << 16) + (g << 8) + b;
  } else {
    if (rgba.includes('#')) {
      if (rgba.length !== 9) {
        return undefined;
      }

      const _rgba = rgba.substring(1);

      const r = Number.parseInt(_rgba.substring(0, 2), 16);
      const g = Number.parseInt(_rgba.substring(2, 4), 16);
      const b = Number.parseInt(_rgba.substring(4, 6), 16);
      const a = Number.parseInt(_rgba.substring(6, 8), 16);

      return ((a << 24) + (r << 16) + (g << 8) + b) >>> 0;
    }

    if (rgba.includes('rgba')) {
      let _rgba = rgba.replace('rgba(', '').replace(')', '').split(',');

      _rgba = _rgba.map((v) => v.trim());

      if (_rgba.length !== 4) {
        return undefined;
      }

      const r = Math.floor(Number.parseInt(_rgba[0]));
      const g = Math.floor(Number.parseInt(_rgba[1]));
      const b = Math.floor(Number.parseInt(_rgba[2]));
      const a = Math.floor(Number.parseInt(_rgba[3]) * 255);

      return ((a << 24) + (r << 16) + (g << 8) + b) >>> 0;
    }
  }

  return undefined;
}

export function toRGBA(argb: number) {
  const a = (argb & 0xffffffff) >>> 24;
  const r = (argb & 0x00ffffff) >>> 16;
  const g = (argb & 0x0000ffff) >>> 8;
  const b = (argb & 0x000000ff) >>> 0;

  return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
}
