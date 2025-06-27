'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { DrawingLine, CanvasConfig, BrushSettings, Point } from './types';
import ResponsiveCanvas, { CanvasScalingAPI } from './ResponsiveCanvas';

interface DrawingCanvasProps {
  config: CanvasConfig;
  brushSettings: BrushSettings;
  lines: DrawingLine[];
  onLinesChange?: (lines: DrawingLine[]) => void;
}

/**
 * INTENTION: Check if point is within canvas boundaries
 * REQUIRES: Valid point and config
 * MODIFIES: None (pure function)
 * EFFECTS: None
 * RETURNS: Boolean indicating if point is within bounds
 */
const isPointWithinBounds = (point: Point, config: CanvasConfig): boolean => {
  return point.x >= 0 && point.x <= config.width && 
         point.y >= 0 && point.y <= config.height;
};

/**
 * INTENTION: Check if mouse button is currently pressed
 * REQUIRES: Valid Konva event
 * MODIFIES: None (pure function)
 * EFFECTS: None
 * RETURNS: Boolean indicating if mouse/touch is pressed
 */
const isMousePressed = (e: KonvaEventObject<MouseEvent | TouchEvent>): boolean => {
  return (e.evt as MouseEvent)?.buttons === 1 || e.evt.type.includes('touch');
};

/**
 * INTENTION: Apply real-time smoothing to point n-1 using neighbor averaging
 * REQUIRES: points array with at least 3 points
 * MODIFIES: The second-to-last point in the points array
 * EFFECTS: Point n-1 becomes weighted average of points n-2, n-1, and n
 * RETURNS: void (mutates input array)
 * 
 * ALGORITHM: Real-time neighbor averaging
 * - Only smooths point n-1 (second to last) when n is added
 * - Uses 3-point moving average with configurable strength
 * - Provides immediate smooth feedback during drawing
 * ASSUMPTIONS: Called during active drawing with sufficient points
 */
const applyRealTimeSmoothing = (points: Point[], strength: number = 0.5): void => {
  if (points.length < 3) return;
  
  const smoothIndex = points.length - 2; // Point n-1 (second to last)
  
  // Get the three points: n-2, n-1, n
  const prev = points[smoothIndex - 1];
  const current = points[smoothIndex];
  const next = points[smoothIndex + 1];
  
  // Apply neighbor averaging
  const avgX = (prev.x + current.x + next.x) / 3;
  const avgY = (prev.y + current.y + next.y) / 3;
  
  points[smoothIndex] = {
    x: current.x * (1 - strength) + avgX * strength,
    y: current.y * (1 - strength) + avgY * strength
  };
};

/**
 * INTENTION: Create a new drawing line at the specified point
 * REQUIRES: Valid point coordinates and brush settings
 * MODIFIES: None (pure function)
 * EFFECTS: Returns new line object
 * RETURNS: DrawingLine with duplicate start point for Konva rendering
 */
const createNewLine = (point: Point, brushSettings: BrushSettings, lineId: number): DrawingLine => {
  return {
    id: `line_${lineId}`,
    points: [point, point], // Duplicate point for Konva visibility
    color: brushSettings.color,
    width: brushSettings.width,
    tool: 'brush'
  };
};

/**
 * INTENTION: Provide core drawing functionality with Konva
 * REQUIRES: Valid config and brushSettings
 * MODIFIES: Canvas drawing state, calls onLinesChange when lines change
 * EFFECTS: Renders interactive drawing canvas, handles mouse/touch drawing
 * RETURNS: JSX canvas component wrapped in responsive scaling
 * 
 * ASSUMPTIONS: Konva is available
 * INVARIANTS: Lines array is immutable, each line has unique ID
 * GHOST STATE: Drawing session state (start/continue/end)
 */
const DrawingCanvas = ({ config, brushSettings, lines, onLinesChange }: DrawingCanvasProps) => {
  const isDrawing = useRef(false);
  const lineIdCounter = useRef(0);
  
  // Local state for immediate rendering during drawing
  const [currentLines, setCurrentLines] = useState<DrawingLine[]>(lines);
  
  // Sync with prop changes (from undo/redo)
  useEffect(() => {
    setCurrentLines(lines);
  }, [lines]);

  const updateLinesTemporary = useCallback((newLines: DrawingLine[]) => {
    // Update local state for immediate rendering
    setCurrentLines(newLines);
  }, []);

  const pushToHistory = useCallback((newLines: DrawingLine[]) => {
    // Push to history when line is complete
    onLinesChange?.(newLines);
  }, [onLinesChange]);

  const getCanvasPoint = useCallback((e: KonvaEventObject<MouseEvent | TouchEvent>, scaling: CanvasScalingAPI): Point | null => {
    const stage = e.target.getStage();
    const rawPoint = stage?.getPointerPosition();
    return rawPoint ? scaling.screenToCanvas(rawPoint) : null;
  }, []);

  const createEventHandlers = useCallback((scaling: CanvasScalingAPI) => {
    const handleMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      e.evt.preventDefault();
      const point = getCanvasPoint(e, scaling);
      
      if (point) {
        isDrawing.current = true;
        const newLine = createNewLine(point, brushSettings, ++lineIdCounter.current);
        updateLinesTemporary([...currentLines, newLine]);
      }
    };

    const handleMouseMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      e.evt.preventDefault();
      const point = getCanvasPoint(e, scaling);
      
      if (!point) return;

      // Handle out-of-bounds behavior
      if (!isPointWithinBounds(point, config)) {
        isDrawing.current = false;
        return;
      }

      // Handle re-entry while mouse is pressed
      if (!isDrawing.current && isMousePressed(e)) {
        isDrawing.current = true;
        const newLine = createNewLine(point, brushSettings, ++lineIdCounter.current);
        updateLinesTemporary([...currentLines, newLine]);
        return;
      }

      // Continue drawing on current line
      if (isDrawing.current) {
        const updatedLines = [...currentLines];
        const lastLine = updatedLines[updatedLines.length - 1];
        lastLine.points.push(point);
        applyRealTimeSmoothing(lastLine.points, 1);
        updateLinesTemporary(updatedLines);
      }
    };

    const handleMouseUp = () => {
      if (isDrawing.current && currentLines.length > 0) {
        // Push completed line to history
        pushToHistory(currentLines);
      }
      isDrawing.current = false;
    };

    const handleMouseLeave = () => {
      isDrawing.current = false;
    };

    return { handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave };
  }, [currentLines, config, brushSettings, updateLinesTemporary, pushToHistory, getCanvasPoint]);

  return (
    <ResponsiveCanvas 
      logicalWidth={config.width} 
      logicalHeight={config.height}
    >
      {(scaling) => {
        const { handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave } = createEventHandlers(scaling);
        
        return (
          <Stage
            width={scaling.getVisualDimensions().width}
            height={scaling.getVisualDimensions().height}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            className="bg-white cursor-crosshair w-full h-full"
            {...scaling.getStageScaling()}
          >
            <Layer>
              {currentLines.map((line) => (
                <Line
                  key={line.id}
                  points={line.points.flatMap(p => [p.x, p.y])}
                  stroke={line.color}
                  strokeWidth={line.width}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation="source-over"
                />
              ))}
            </Layer>
          </Stage>
        );
      }}
    </ResponsiveCanvas>
  );
};

export default DrawingCanvas; 