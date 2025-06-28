"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import { DrawingLine } from '../types';

/**
 * INTENTION: Manage drawing state with dual-state pattern for undo/redo
 * REQUIRES: Initial lines array and optional history change handler
 * MODIFIES: Local rendering state and line ID counter
 * EFFECTS: Provides immediate rendering updates and history integration
 * RETURNS: State and functions for drawing operations
 * 
 * ALGORITHM: Dual-state pattern
 * - linesForRendering: Local state for immediate visual feedback
 * - Syncs with initialLines for undo/redo integration
 * - Separates immediate updates from history commits
 * ASSUMPTIONS: onHistoryChange handles undo/redo system integration
 */
export const useDrawingState = (
  initialLines: DrawingLine[], 
  onHistoryChange?: (lines: DrawingLine[]) => void
) => {
  const isDrawing = useRef(false);
  const lineIdCounter = useRef(0);
  
  const [linesForRendering, setLinesForRendering] = useState<DrawingLine[]>(initialLines);
  
  useEffect(() => {
    setLinesForRendering(initialLines);
  }, [initialLines]);

  const updateForImmediateRendering = useCallback((newLines: DrawingLine[]) => {
    setLinesForRendering(newLines);
  }, []);

  const commitToHistory = useCallback((completedLines: DrawingLine[]) => {
    onHistoryChange?.(completedLines);
  }, [onHistoryChange]);

  const generateNextLineId = useCallback(() => {
    return ++lineIdCounter.current;
  }, []);

  return {
    linesForRendering,
    isDrawing,
    updateForImmediateRendering,
    commitToHistory,
    generateNextLineId
  };
}; 