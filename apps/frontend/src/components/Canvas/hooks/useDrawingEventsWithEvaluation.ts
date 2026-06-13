/**
 * INTENTION: Enhanced drawing events with real-time evaluation feedback
 * REQUIRES: Drawing state, evaluation hook, and configuration
 * MODIFIES: Drawing state and evaluation state simultaneously
 * EFFECTS: Provides drawing interaction with live scoring
 * RETURNS: Event handlers with integrated evaluation updates
 * 
 * PERFORMANCE: Direct coordinate evaluation bypasses PNG pipeline
 * - Evaluation happens on every stroke completion (~1ms total)
 * - No blocking operations during drawing
 * - Live feedback enables real-time drawing guidance
 */

import { useCallback } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { CanvasConfig, ToolSettings, DrawingLine } from '../types';
import { CanvasScalingAPI } from '../components/ResponsiveCanvas';
import { isPointWithinBounds, applyRealTimeSmoothing, createNewLine } from '../utils/drawingHelpers';
import { isMousePressed, getCanvasPoint } from '../utils/canvasGeometry';
import { useStreamingEvaluation } from './useStreamingEvaluation';

interface UseDrawingEventsWithEvaluationProps {
  config: CanvasConfig;
  toolSettings: ToolSettings;
  currentLines: DrawingLine[];
  isDrawing: { current: boolean };
  updateLinesTemporary: (lines: DrawingLine[]) => void;
  pushToHistory: (lines: DrawingLine[]) => void;
  getNextLineId: () => string;
  referenceImagePath?: string;
  onScoreUpdate?: (score: number) => void;
}

/**
 * INTENTION: Enhanced drawing events with integrated real-time evaluation
 * REQUIRES: All drawing dependencies plus evaluation configuration
 * MODIFIES: Drawing state and triggers evaluation updates
 * EFFECTS: Provides smooth drawing with live accuracy feedback
 * RETURNS: Event handlers and evaluation state
 * 
 * ALGORITHM: Dual-state management
 * - Drawing events modify visual state immediately
 * - Evaluation updates happen asynchronously after stroke completion
 * - No blocking operations during active drawing
 * ASSUMPTIONS: Reference image is available and evaluation is desired
 */
export const useDrawingEventsWithEvaluation = ({
  config,
  toolSettings,
  currentLines,
  isDrawing,
  updateLinesTemporary,
  pushToHistory,
  getNextLineId,
  referenceImagePath,
  onScoreUpdate
}: UseDrawingEventsWithEvaluationProps) => {

  // Initialize streaming evaluation
  const {
    state: evaluationState,
    updateEvaluation,
    getFinalEvaluation,
    resetEvaluation
  } = useStreamingEvaluation({
    referenceImagePath,
    canvasWidth: config.width,
    canvasHeight: config.height,
    onScoreUpdate
  });

  const createEventHandlers = useCallback((scaling: CanvasScalingAPI) => {
    const startNewLine = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      e.evt.preventDefault();
      const point = getCanvasPoint(e, scaling);
      
      if (point) {
        isDrawing.current = true;
        const newLine = createNewLine(point, toolSettings, getNextLineId());
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
        const newLine = createNewLine(point, toolSettings, getNextLineId());
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

    /**
     * INTENTION: Complete drawing stroke and trigger real-time evaluation
     * REQUIRES: Active drawing session with completed stroke
     * MODIFIES: Drawing history and evaluation state
     * EFFECTS: Commits stroke to history, updates live evaluation score
     * RETURNS: void
     * 
     * ALGORITHM: Async evaluation after drawing commit
     * - Drawing commit happens immediately (visual feedback)
     * - Evaluation update happens asynchronously (no blocking)
     * - Error handling ensures drawing continues even if evaluation fails
     * ASSUMPTIONS: Evaluation performance is fast enough for real-time use
     */
    const finishDrawing = async () => {
      if (isDrawing.current && currentLines.length > 0) {
        // Commit drawing immediately (visual feedback)
        pushToHistory(currentLines);
        
        // Update evaluation asynchronously (no blocking)
        if (evaluationState.isInitialized) {
          try {
            await updateEvaluation(currentLines);
          } catch (error) {
            console.warn('Evaluation update failed, continuing drawing:', error);
          }
        }
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
  }, [
    config, 
    toolSettings, 
    currentLines, 
    isDrawing, 
    updateLinesTemporary, 
    pushToHistory, 
    getNextLineId,
    evaluationState.isInitialized,
    updateEvaluation
  ]);

  /**
   * INTENTION: Get comprehensive evaluation when drawing is complete
   * REQUIRES: Completed drawing with evaluation data
   * MODIFIES: None (read-only operation)
   * EFFECTS: Returns detailed evaluation metrics
   * RETURNS: Promise resolving to complete evaluation result
   * 
   * ASSUMPTIONS: Drawing is finished and ready for final assessment
   * INVARIANTS: Result format matches existing evaluation API
   * GHOST STATE: Provides detailed analysis for storage/display
   */
  const getComprehensiveEvaluation = useCallback(async () => {
    return await getFinalEvaluation();
  }, [getFinalEvaluation]);

  /**
   * INTENTION: Reset evaluation for new drawing session
   * REQUIRES: None
   * MODIFIES: Evaluation state (clears observation data)
   * EFFECTS: Prepares evaluator for new drawing
   * RETURNS: Promise resolving when reset complete
   * 
   * ASSUMPTIONS: User wants to start fresh drawing
   * INVARIANTS: Reference computation remains cached
   * GHOST STATE: Maintains performance optimization across sessions
   */
  const resetDrawingEvaluation = useCallback(async () => {
    await resetEvaluation();
  }, [resetEvaluation]);

  return { 
    createEventHandlers,
    evaluationState,
    getComprehensiveEvaluation,
    resetDrawingEvaluation
  };
}; 