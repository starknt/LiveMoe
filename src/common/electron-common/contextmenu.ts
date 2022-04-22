export interface ICommonContextMenuItem {
  id?: string;
  label?: string;

  type?: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio';

  accelerator?: string;

  enabled?: boolean;
  visible?: boolean;
  checked?: boolean;
}

export interface ISerializableContextMenuItem extends ICommonContextMenuItem {
  submenu?: ISerializableContextMenuItem[];
}

export interface IContextMenuItem extends ICommonContextMenuItem {
  click?: (event: IContextMenuEvent) => void;
  submenu?: IContextMenuItem[];
}

export interface IContextMenuEvent {
  shiftKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

export interface IPopupOptions {
  x?: number;
  y?: number;
  positioningItem?: number;
}

export const CONTEXT_MENU_CHANNEL = 'ipc:contextmenu';
export const CONTEXT_MENU_CLOSE_CHANNEL = 'ipc:onCloseContextMenu';
