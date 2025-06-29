import { useEffect } from 'react';
import { ComponentActions, ComponentName } from './types';
import { shortcutRegistry } from './registry';

/**
 * INTENTION: Hook for components to register their shortcut-able actions
 * REQUIRES: Component name and stable action references
 * MODIFIES: Global shortcut registry
 * EFFECTS: Registers actions on mount, unregisters on unmount
 * RETURNS: void (side effects only)
 * 
 * ASSUMPTIONS: Component name is unique, actions are stable
 * INVARIANTS: Clean registration/unregistration lifecycle
 * GHOST STATE: Component mount/unmount lifecycle
 */
export const useShortcutRegistry = (componentName: ComponentName, actions: ComponentActions) => {
  useEffect(() => {
    shortcutRegistry.register(componentName, actions);

    // Cleanup when component unmounts
    return () => {
      shortcutRegistry.unregister(componentName);
    };
  }, [componentName, actions]);
}; 