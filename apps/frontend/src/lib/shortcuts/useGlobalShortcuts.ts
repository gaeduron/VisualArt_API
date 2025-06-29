import { useEffect } from 'react';
import { GlobalShortcutConfig } from './types';
import { shortcutRegistry } from './registry';

const parseKeyCombo = (e: KeyboardEvent): string => {
  const parts: string[] = [];
  
  if (e.metaKey || e.ctrlKey) {
    parts.push(e.metaKey ? 'cmd' : 'ctrl');
  }
  if (e.shiftKey) parts.push('shift');
  if (e.altKey) parts.push('alt');
  
  parts.push(e.key.toLowerCase());
  
  return parts.join('+');
};

/**
 * INTENTION: Manage global keyboard shortcuts at app level
 * REQUIRES: Shortcut configuration mapping keys to component actions
 * MODIFIES: Document keyboard event listeners
 * EFFECTS: Executes registered component actions based on key combinations
 * RETURNS: void (side effects only)
 * 
 * ASSUMPTIONS: Document is available, components register their actions
 * INVARIANTS: Only enabled actions are executed
 * GHOST STATE: Keyboard focus, component registration state
 */
export const useGlobalShortcuts = (config: GlobalShortcutConfig) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyCombo = parseKeyCombo(e);
      const shortcutConfig = config[keyCombo];
      
      if (!shortcutConfig) return;
      
      const action = shortcutRegistry.getAction(shortcutConfig.component, shortcutConfig.action);
      if (action) {
        e.preventDefault();
        action.fn();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [config]);
}; 