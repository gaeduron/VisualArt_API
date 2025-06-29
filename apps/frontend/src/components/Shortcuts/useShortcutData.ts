import { shortcutRegistry } from '../../lib/shortcuts/registry';
import { globalShortcuts } from '../../app/shortcuts.config';

interface ShortcutData {
  key: string;
  description: string;
}

/**
 * INTENTION: Retrieve and format shortcut data as a simple list
 * REQUIRES: Global shortcut registry and configuration
 * MODIFIES: None (pure data retrieval)
 * EFFECTS: Matches config shortcuts with registered actions
 * RETURNS: Simple shortcut data array
 * 
 * ASSUMPTIONS: Registry and config are properly synchronized
 * INVARIANTS: Only returns shortcuts that are actually registered
 * GHOST STATE: Current registry state, component registrations
 */
export const useShortcutData = (): ShortcutData[] => {
  const getShortcutList = (): ShortcutData[] => {
    const shortcuts: ShortcutData[] = [];
    const allActions = shortcutRegistry.getAllActions();
    
    Object.entries(globalShortcuts).forEach(([keyCombo, config]) => {
      const componentActions = allActions[config.component];
      const action = componentActions?.[config.action];
      
      if (action) {
        shortcuts.push({
          key: keyCombo,
          description: action.description
        });
      }
    });
    
    return shortcuts;
  };

  return getShortcutList();
}; 