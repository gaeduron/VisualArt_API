"use client"

import { useCallback } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { CanvasConfig, BrushSettings, DrawingLine } from '../types';
import { CanvasScalingAPI } from '../components/ResponsiveCanvas';
import { isPointWithinBounds, applyRealTimeSmoothing, createNewLine } from '../utils/drawingHelpers';
import { isMousePressed, getCanvasPoint } from '../utils/canvasGeometry';

interface UseDrawingEventsProps {
  config: CanvasConfig;
  brushSettings: BrushSettings;
  currentLines: DrawingLine[];
  isDrawing: { current: boolean };
  updateLinesTemporary: (lines: DrawingLine[]) => void;
  pushToHistory: (lines: DrawingLine[]) => void;
  getNextLineId: () => number;
}

/**
 * INTENTION: Handle all drawing-related mouse and touch events
 * REQUIRES: Drawing state and configuration objects
 * MODIFIES: Drawing state through provided callbacks
 * EFFECTS: Creates event handlers for mouse/touch drawing interactions
 * RETURNS: Event handler functions for Konva Stage
 * 
 * ALGORITHM: State machine for drawing
 * - MouseDown: Start new line
 * - MouseMove: Continue line or handle re-entry
 * - MouseUp: Complete line and push to history
 * - MouseLeave: Stop drawing
 * ASSUMPTIONS: Konva events are properly formatted
 */
export const useDrawingEvents = ({
  config,
  brushSettings,
  currentLines,
  isDrawing,
  updateLinesTemporary,
  pushToHistory,
  getNextLineId
}: UseDrawingEventsProps) => {
  
  const createEventHandlers = useCallback((scaling: CanvasScalingAPI) => {
    const startNewLine = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      e.evt.preventDefault();
      const point = getCanvasPoint(e, scaling);
      
      if (point) {
        isDrawing.current = true;
        const newLine = createNewLine(point, brushSettings, getNextLineId());
        updateLinesTemporary([...currentLines, newLine]);
      }
    };

    const continueDrawing = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      e.evt.preventDefault();
      const point = getCanvasPoint(e, scaling);
      
      if (!point) return;

      if (!isPointWithinBounds(point, config)) {
        isDrawing.current = false;
        return;
      }

      // Edge Case: Handle re-entry while mouse is pressed
      if (!isDrawing.current && isMousePressed(e)) {
        isDrawing.current = true;
        const newLine = createNewLine(point, brushSettings, getNextLineId());
        updateLinesTemporary([...currentLines, newLine]);
        return;
      }

      if (isDrawing.current) {
        const updatedLines = [...currentLines];
        const lastLine = updatedLines[updatedLines.length - 1];
        lastLine.points.push(point);
        applyRealTimeSmoothing(lastLine.points, 1);
        updateLinesTemporary(updatedLines);
      }
    };

    const finishDrawing = () => {
      if (isDrawing.current && currentLines.length > 0) {
        pushToHistory(currentLines);
      }
      isDrawing.current = false;
    };

    const stopDrawing = () => {
      isDrawing.current = false;
    };

    return { 
      handleMouseDown: startNewLine, 
      handleMouseMove: continueDrawing, 
      handleMouseUp: finishDrawing, 
      handleMouseLeave: stopDrawing 
    };
  }, [config, brushSettings, currentLines, isDrawing, updateLinesTemporary, pushToHistory, getNextLineId]);

  return { createEventHandlers };
}; 