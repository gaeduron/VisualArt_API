'use client';

import { useState, useRef } from 'react';
import DrawingCanvas, { DrawingCanvasRef } from './components/DrawingCanvas';
import UndoRedoControls from './components/UndoRedoControls';
import ToolSelector from './components/ToolSelector';
import ClearCanvasButton from './components/ClearCanvasButton';
import ExportButton from './components/ExportButton';
import EvaluateButton from './components/EvaluateButton';
import { ActionBar, VertivalSeparator } from '@/components/ui/actionBar' 
import { CanvasConfig, ToolSettings, DrawingTool } from './types';
import { useUndoRedo } from './hooks/useUndoRedo';
import { useCanvasActions } from './hooks/useCanvasActions';
import { useShortcutRegistry } from '../../lib/shortcuts/useShortcutRegistry';
import { useCanvasExport } from './hooks/useCanvasExport';

/**
 * INTENTION: Orchestrate canvas system, manage drawing state and tool settings
 * REQUIRES: None (uses sensible defaults)
 * MODIFIES: Drawing lines state with undo/redo history
 * EFFECTS: Renders complete canvas interface with tools and keyboard shortcuts
 * RETURNS: JSX canvas system
 * 
 * ASSUMPTIONS: Default settings match spec requirements
 * INVARIANTS: Canvas config remains constant during session
 * GHOST STATE: Future tool state (color palette, eraser, etc.)
 */
interface CanvasProps {
  onEvaluate: (userDrawingDataUrl: string) => void;
}

const Canvas = ({ onEvaluate }: CanvasProps) => {
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const canvasConfig: CanvasConfig = {
    width: 1000,
    height: 1000,
    backgroundColor: '#ffffff'
  };

  const [currentTool, setCurrentTool] = useState<DrawingTool>('brush');
  
  const getToolSettings = (): ToolSettings => {
    if (currentTool === 'eraser') {
      return {
        tool: 'eraser',
        color: '#000000', // Color irrelevant for eraser (uses destination-out)
        width: 40
      };
    }
    
    return {
      tool: 'brush',
      color: '#000000', // Black brush
      width: 4 // 2px brush (doubled for high resolution)
    };
  };

  const { current: lines, pushToHistory, undo, redo, canUndo, canRedo } = useUndoRedo([]);
  
  const stageRef = canvasRef.current?.getStageRef() || { current: null };
  const { exportAsPNG, downloadPNG } = useCanvasExport({ 
    stageRef, 
    canvasName: 'drawing' 
  });

  const handleEvaluate = async () => {
    const userDrawingDataUrl = await exportAsPNG({ backgroundColor: 'white' });
    if (userDrawingDataUrl) {
      onEvaluate(userDrawingDataUrl);
    }
  };

  const clearCanvas = () => {
    pushToHistory([]);
  };

  const canvasActions = useCanvasActions({
    undo,
    redo,
    clearCanvas,
    setCurrentTool,
    evaluate: handleEvaluate
  });

  useShortcutRegistry('canvas', canvasActions);

  const handleExport = async () => {
    await downloadPNG({ backgroundColor: 'white' });
  };

  return (
    <div className="flex flex-col items-start gap-2">
          <span className="text-sm font-medium text-gray-600 bg-white p-2 rounded-lg">Observation</span>
          <DrawingCanvas
            ref={canvasRef}
            config={canvasConfig}
            toolSettings={getToolSettings()}
            lines={lines}
            onLinesChange={pushToHistory}
          />
          
          <ActionBar>
            <ToolSelector
              currentTool={currentTool}
              onToolChange={setCurrentTool}
            />
            <VertivalSeparator/>
            <UndoRedoControls
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
              />
            <VertivalSeparator/>
            <EvaluateButton
              onEvaluate={handleEvaluate}
              disabled={lines.length === 0}
              />
            <ExportButton
              onExport={handleExport}
              disabled={lines.length === 0}
            />
            <VertivalSeparator/>
            <ClearCanvasButton
              onClear={clearCanvas}
              disabled={lines.length === 0}
            />
          </ActionBar>
    </div>
  );
};

export default Canvas; 