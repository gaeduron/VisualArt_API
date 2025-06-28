"use client"

import { useEffect } from 'react';
import { DrawingTool } from '../types';

/**
 * INTENTION: Handle keyboard shortcuts for tool switching
 * REQUIRES: Tool change handler function
 * MODIFIES: None (pure event handling)
 * EFFECTS: Listens for B and E key presses to switch tools
 * RETURNS: void (side effects only)
 * 
 * ASSUMPTIONS: Document is available, function is stable reference
 */
export const useToolShortcuts = (onToolChange: (tool: DrawingTool) => void) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toLowerCase();
      
      if (key === 'b') {
        e.preventDefault();
        onToolChange('brush');
      } else if (key === 'e') {
        e.preventDefault();
        onToolChange('eraser');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onToolChange]);
}; 