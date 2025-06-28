import { useState, useCallback } from 'react';
import { Point } from '../types';

interface CursorState {
  position: Point | null;
  isVisible: boolean;
}

/**
 * INTENTION: Track mouse position for custom cursor visualization
 * REQUIRES: Mouse events from canvas
 * MODIFIES: Cursor position and visibility state
 * EFFECTS: Provides real-time cursor position for brush size preview
 * RETURNS: Cursor state and event handlers
 * 
 * ASSUMPTIONS: Canvas coordinate system is consistent
 * INVARIANTS: Position is null when cursor is outside canvas
 * GHOST STATE: Mouse hover state over canvas
 */
export const useCursorTracking = () => {
  const [cursorState, setCursorState] = useState<CursorState>({
    position: null,
    isVisible: false
  });

  const updateCursorPosition = useCallback((position: Point) => {
    setCursorState({
      position,
      isVisible: true
    });
  }, []);

  const hideCursor = useCallback(() => {
    setCursorState(prev => ({
      ...prev,
      isVisible: false
    }));
  }, []);

  const showCursor = useCallback(() => {
    setCursorState(prev => ({
      ...prev,
      isVisible: true
    }));
  }, []);

  return {
    cursorPosition: cursorState.position,
    isCursorVisible: cursorState.isVisible,
    updateCursorPosition,
    hideCursor,
    showCursor
  };
}; 