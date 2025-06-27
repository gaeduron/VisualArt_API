"use client"

import { useState, useCallback } from 'react';
import { DrawingLine } from '../types';

/**
 * INTENTION: Manage undo/redo history for drawing operations with memory limits
 * REQUIRES: Initial state array
 * MODIFIES: History state arrays (capped at MAX_HISTORY_SIZE)
 * EFFECTS: Tracks drawing states for undo/redo functionality
 * RETURNS: History management functions and state
 * 
 * ALGORITHM: Command pattern with history stacks and memory management
 * - undoStack: Previous states (can undo to these) - max 50 items
 * - redoStack: Future states (can redo to these)  
 * - When drawing: push current to undo, clear redo, trim if over limit
 * - When undo: move current to redo, pop from undo
 * - When redo: move current to undo, pop from redo
 * ASSUMPTIONS: States are immutable snapshots, memory usage controlled
 */
export const useUndoRedo = (initialState: DrawingLine[], maxHistorySize: number = 50) => {
  const [current, setCurrent] = useState<DrawingLine[]>(initialState);
  const [undoStack, setUndoStack] = useState<DrawingLine[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawingLine[][]>([]);

  const pushToHistory = useCallback((newState: DrawingLine[]) => {
    setUndoStack(prev => {
      const newStack = [...prev, current];
      return newStack.length > maxHistorySize 
        ? newStack.slice(-maxHistorySize)
        : newStack;
    });
    setRedoStack([]); // Clear redo stack when new action performed
    setCurrent(newState);
  }, [current, maxHistorySize]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    
    const previousState = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, current]);
    setCurrent(previousState);
  }, [undoStack, current]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, current]);
    setCurrent(nextState);
  }, [redoStack, current]);

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  return { current, pushToHistory, undo, redo, canUndo, canRedo };
}; 