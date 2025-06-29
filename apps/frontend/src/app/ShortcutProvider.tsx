'use client';

import { ReactNode } from 'react';
import { useGlobalShortcuts } from '../lib/shortcuts/useGlobalShortcuts';
import { globalShortcuts } from './shortcuts.config';

interface ShortcutProviderProps {
  children: ReactNode;
}

/**
 * INTENTION: Higher-order component that provides global shortcut functionality
 * REQUIRES: Global shortcut configuration
 * MODIFIES: Document keyboard event listeners
 * EFFECTS: Initializes global shortcut handling for entire app
 * RETURNS: Provider component that wraps app content
 * 
 * ASSUMPTIONS: Components register their actions after mounting
 * INVARIANTS: Global shortcuts are active throughout app lifecycle
 * GHOST STATE: Keyboard event capture, component registration timing
 */
const ShortcutProvider = ({ children }: ShortcutProviderProps) => {
  useGlobalShortcuts(globalShortcuts);

  return (
    <>
      {children}
    </>
  );
};

export default ShortcutProvider; 