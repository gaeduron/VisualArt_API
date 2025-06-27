'use client';

import { useState } from 'react';
import DrawingCanvas from './DrawingCanvas';
import { DrawingLine, CanvasConfig, BrushSettings } from './types';

/**
 * INTENTION: Orchestrate canvas system, manage drawing state and tool settings
 * REQUIRES: None (uses sensible defaults)
 * MODIFIES: Drawing lines state
 * EFFECTS: Renders complete canvas interface with tools
 * RETURNS: JSX canvas system
 * 
 * ASSUMPTIONS: Default settings match spec requirements
 * INVARIANTS: Canvas config remains constant during session
 * GHOST STATE: Future tool state (color palette, eraser, etc.)
 */
const Canvas = () => {
  // Step 1: 1000x1000px canvas with 2px black brush (doubled resolution for smoother drawing)
  const canvasConfig: CanvasConfig = {
    width: 1000,
    height: 1000,
    backgroundColor: '#ffffff'
  };

  const [brushSettings] = useState<BrushSettings>({
    color: '#000000', // Black as specified
    width: 4 // 2px as specified
  });

  const [lines, setLines] = useState<DrawingLine[]>([]);

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      
      <DrawingCanvas
        config={canvasConfig}
        brushSettings={brushSettings}
        onLinesChange={setLines}
      />
      
      {/* Future: Tools will go here */}
      <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
        Lines drawn: {lines.length}
      </div>
    </div>
  );
};

export default Canvas; 