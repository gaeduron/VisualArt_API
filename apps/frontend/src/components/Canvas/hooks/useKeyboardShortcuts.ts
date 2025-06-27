"use client"

import { useEffect } from 'react';

/**
 * INTENTION: Handle keyboard shortcuts for canvas operations
 * REQUIRES: Valid undo and redo functions
 * MODIFIES: None (pure event handling)
 * EFFECTS: Listens for Cmd/Ctrl+Z and Cmd/Ctrl+Shift+Z shortcuts
 * RETURNS: void (side effects only)
 * 
 * ASSUMPTIONS: Document is available, functions are stable references
 */
export const useKeyboardShortcuts = (undo: () => void, redo: () => void) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifierPressed = e.metaKey || e.ctrlKey;
      
      if (!isModifierPressed) return;

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);
}; 