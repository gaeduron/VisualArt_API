'use client';

import { useState } from 'react';
import DrawingCanvas from './components/DrawingCanvas';
import UndoRedoControls from './components/UndoRedoControls';
import ToolSelector from './components/ToolSelector';
import { CanvasConfig, ToolSettings, DrawingTool } from './types';
import { useUndoRedo } from './hooks/useUndoRedo';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useToolShortcuts } from './hooks/useToolShortcuts';

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
        width: 20
      };
    }
    
    return {
      tool: 'brush',
      color: '#000000', // Black brush
      width: 4 // 2px brush (doubled for high resolution)
    };
  };

  const { current: lines, pushToHistory, undo, redo, canUndo, canRedo } = useUndoRedo([]);
  useKeyboardShortcuts(undo, redo);
  useToolShortcuts(setCurrentTool);

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <DrawingCanvas
        config={canvasConfig}
        toolSettings={getToolSettings()}
        lines={lines}
        onLinesChange={pushToHistory}
      />
      
      <div className="flex gap-4">
        <ToolSelector
          currentTool={currentTool}
          onToolChange={setCurrentTool}
        />
        
        <UndoRedoControls
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      </div>
    </div>
  );
};

export default Canvas; 