'use client';

import { useState, useRef } from 'react';
import DrawingCanvas, { DrawingCanvasRef } from './components/DrawingCanvas';
import UndoRedoControls from './components/UndoRedoControls';
import ToolSelector from './components/ToolSelector';
import ClearCanvasButton from './components/ClearCanvasButton';
import ExportButton from './components/ExportButton';
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
const Canvas = () => {
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
  
  const clearCanvas = () => {
    pushToHistory([]);
  };

  const canvasActions = useCanvasActions({
    undo,
    redo,
    clearCanvas,
    setCurrentTool
  });

  useShortcutRegistry('canvas', canvasActions);

  const stageRef = canvasRef.current?.getStageRef() || { current: null };
  const { downloadPNG } = useCanvasExport({ 
    stageRef, 
    canvasName: 'drawing' 
  });

  const handleExport = async () => {
    await downloadPNG({ backgroundColor: 'white' });
  };

  return (
    <div className="flex flex-col items-start gap-2">

          <DrawingCanvas
            ref={canvasRef}
            config={canvasConfig}
            toolSettings={getToolSettings()}
            lines={lines}
            onLinesChange={pushToHistory}
          />
          
          {/* Floating toolbar positioned at bottom left */}
          <div className="flex gap-6">
            <div className="bg-white rounded-lg shadow-lg p-3">
              <div className="flex gap-2">
                <ToolSelector
                  currentTool={currentTool}
                  onToolChange={setCurrentTool}
                  />
                
                <div className="w-px bg-gray-200 mx-1"></div>
                
                <UndoRedoControls
                  onUndo={undo}
                  onRedo={redo}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  />
                
                <div className="w-px bg-gray-200 mx-1"></div>

                <ClearCanvasButton
                  onClear={clearCanvas}
                  disabled={lines.length === 0}
                />
                
                <div className="w-px bg-gray-200 mx-1"></div>
                
                <ExportButton
                  onExport={handleExport}
                  disabled={lines.length === 0}
                />
              </div>
            </div>
          </div>
    </div>
  );
};

export default Canvas; 