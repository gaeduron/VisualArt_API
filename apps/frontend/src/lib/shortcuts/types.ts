// Key combination format: [modifier+]key
export type KeyCombo = 
  | `cmd+${string}`           // Mac: cmd+z, cmd+shift+z, cmd+s
  | `ctrl+${string}`          // PC: ctrl+z, ctrl+shift+z, ctrl+s  
  | `alt+${string}`           // alt+tab, alt+f4
  | `shift+${string}`         // shift+tab
  | string;                   // Single keys: c, b, e, escape, enter

export type ComponentName = string;
export type ActionName = string;

export type Registry = Record<ComponentName, ComponentActions>;

export interface ShortcutAction {
  fn: () => void;
  description: string;
}

export interface ComponentActions {
  [actionName: ActionName]: ShortcutAction;
}

export interface ShortcutMapping {
  [keyCombo: KeyCombo]: ShortcutAction;
}

export interface ShortcutRegistry {
  register: (component: ComponentName, actions: ComponentActions) => void;
  unregister: (component: ComponentName) => void;
  getAction: (component: ComponentName, actionName: ActionName) => ShortcutAction | undefined;
  getAllActions: () => Record<ComponentName, ComponentActions>;
  subscribe: (listener: () => void) => () => void;
}

export interface GlobalShortcutConfig {
  [keyCombo: KeyCombo]: {
    component: ComponentName;
    action: ActionName;
  };
} 