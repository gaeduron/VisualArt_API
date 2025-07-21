import { useMemo } from 'react';
import { ComponentActions } from '../../../lib/shortcuts/types';
import { DrawingTool } from '../types';

interface UseCanvasActionsProps {
  undo: () => void;
  redo: () => void;
  clearCanvas: () => void;
  setCurrentTool: (tool: DrawingTool) => void;
  evaluate: () => void;
}

/**
 * INTENTION: Expose Canvas actions for global shortcut binding
 * REQUIRES: Defensive canvas functions (handle invalid states gracefully)
 * MODIFIES: None (pure action exposure)
 * EFFECTS: Provides stable action references for shortcut registry
 * RETURNS: ComponentActions object for registration
 * 
 * ASSUMPTIONS: Functions are defensive, UI manages its own state
 * INVARIANTS: Actions are always callable (functions handle validity)
 * GHOST STATE: None (decoupled from canvas state)
 */
export const useCanvasActions = ({
  undo,
  redo,
  clearCanvas,
  setCurrentTool,
  evaluate
}: UseCanvasActionsProps): ComponentActions => {
  return useMemo(() => ({
    undo: {
      fn: undo,
      description: 'Undo last drawing action'
    },
    redo: {
      fn: redo,
      description: 'Redo last undone action'
    },
    clear: {
      fn: clearCanvas,
      description: 'Clear entire canvas'
    },
    setBrushTool: {
      fn: () => setCurrentTool('brush'),
      description: 'Switch to brush tool'
    },
    setEraserTool: {
      fn: () => setCurrentTool('eraser'),
      description: 'Switch to eraser tool'
    },
    evaluate: {
      fn: evaluate,
      description: 'Evaluate drawing against reference'
    }
  }), [undo, redo, clearCanvas, setCurrentTool, evaluate]);
}; 