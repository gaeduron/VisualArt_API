'use client';

import { Stage, Layer, Line } from 'react-konva';
import { DrawingLine, CanvasConfig, ToolSettings } from '../types';
import ResponsiveCanvas from './ResponsiveCanvas';
import { useDrawingState } from '../hooks/useDrawingState';
import { useDrawingEvents } from '../hooks/useDrawingEvents';

interface DrawingCanvasProps {
  config: CanvasConfig;
  toolSettings: ToolSettings;
  lines: DrawingLine[];
  onLinesChange?: (lines: DrawingLine[]) => void;
}

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
const DrawingCanvas = ({ config, toolSettings, lines, onLinesChange }: DrawingCanvasProps) => {
  const { 
    linesForRendering, 
    isDrawing, 
    updateForImmediateRendering, 
    commitToHistory, 
    generateNextLineId 
  } = useDrawingState(lines, onLinesChange);

  const { createEventHandlers } = useDrawingEvents({
    config,
    toolSettings,
    currentLines: linesForRendering,
    isDrawing,
    updateLinesTemporary: updateForImmediateRendering,
    pushToHistory: commitToHistory,
    getNextLineId: generateNextLineId
  });

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
              {linesForRendering.map((line) => (
                <Line
                  key={line.id}
                  points={line.points.flatMap(p => [p.x, p.y])}
                  stroke={line.color}
                  strokeWidth={line.width}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={
                    line.tool === 'eraser' ?
                    'destination-out'
                    : 'source-over'
                  }
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