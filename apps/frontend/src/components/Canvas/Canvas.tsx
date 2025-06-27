'use client';

import { useState } from 'react';
import DrawingCanvas from './DrawingCanvas';
import UndoRedoControls from './components/UndoRedoControls';
import { CanvasConfig, BrushSettings } from './types';
import { useUndoRedo } from './hooks/useUndoRedo';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

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

  const [brushSettings] = useState<BrushSettings>({
    color: '#000000',
    width: 4
  });

  const { current: lines, pushToHistory, undo, redo, canUndo, canRedo } = useUndoRedo([]);
  useKeyboardShortcuts(undo, redo);

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <DrawingCanvas
        config={canvasConfig}
        brushSettings={brushSettings}
        lines={lines}
        onLinesChange={pushToHistory}
      />
      
      <UndoRedoControls
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
    </div>
  );
};

export default Canvas; 