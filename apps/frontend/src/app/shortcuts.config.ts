import { GlobalShortcutConfig, KeyCombo } from '../lib/shortcuts/types';

/**
 * INTENTION: Define global keyboard shortcuts for the entire application
 * REQUIRES: Components to register their actions in the registry
 * MODIFIES: None (pure configuration)
 * EFFECTS: Maps key combinations to component actions
 * RETURNS: Shortcut configuration object
 * 
 * ASSUMPTIONS: Components use consistent action names
 * INVARIANTS: Key combinations are unique (no conflicts)
 * GHOST STATE: Component registration state, action availability
 */

export const globalShortcuts: GlobalShortcutConfig = {
  // Canvas shortcuts - Undo/Redo
  'cmd+z': {
    component: 'canvas',
    action: 'undo'
  },
  'cmd+shift+z': {
    component: 'canvas', 
    action: 'redo'
  },
  
  // Canvas shortcuts - Tools
  'b': {
    component: 'canvas',
    action: 'setBrushTool'
  },
  'e': {
    component: 'canvas',
    action: 'setEraserTool'
  },
  
  // Canvas shortcuts - Actions
  'c': {
    component: 'canvas',
    action: 'clear'
  },

  // Future: App-level shortcuts
  // 'cmd+s': {
  //   component: 'app',
  //   action: 'saveProject'
  // },
} satisfies Record<KeyCombo, { component: string; action: string }>; 