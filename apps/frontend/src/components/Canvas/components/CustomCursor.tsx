'use client';

import { Circle } from 'react-konva';
import { Point, ToolSettings } from '../types';

interface CustomCursorProps {
  position: Point | null;
  isVisible: boolean;
  toolSettings: ToolSettings;
}

/**
 * INTENTION: Render custom cursor showing brush/eraser size
 * REQUIRES: Valid position and tool settings
 * MODIFIES: Canvas visual state (cursor overlay)
 * EFFECTS: Shows thin grey circle outline at cursor position
 * RETURNS: JSX cursor visualization or null
 * 
 * ASSUMPTIONS: Position coordinates are in canvas space
 * INVARIANTS: Cursor size matches tool width exactly
 * GHOST STATE: Mouse hover feedback for user
 */
const CustomCursor = ({ position, isVisible, toolSettings }: CustomCursorProps) => {
  if (!position || !isVisible) {
    return null;
  }

  return (
    <Circle
      x={position.x}
      y={position.y}
      radius={toolSettings.width / 2}
      stroke="#808080"
      strokeWidth={1}
      fill="transparent"
      listening={false} // Don't interfere with drawing events
      perfectDrawEnabled={false}
    />
  );
};

export default CustomCursor; 