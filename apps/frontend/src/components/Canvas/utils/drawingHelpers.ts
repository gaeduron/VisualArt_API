import { DrawingLine, ToolSettings, Point, CanvasConfig } from '../types';

/**
 * INTENTION: Check if point is within canvas boundaries
 * REQUIRES: Valid point and config
 * MODIFIES: None (pure function)
 * EFFECTS: None
 * RETURNS: Boolean indicating if point is within bounds
 */
export const isPointWithinBounds = (point: Point, config: CanvasConfig): boolean => {
  return point.x >= 0 && point.x <= config.width && 
         point.y >= 0 && point.y <= config.height;
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
export const applyRealTimeSmoothing = (points: Point[], strength = 0.5): void => {
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
 * REQUIRES: Valid point coordinates and tool settings
 * MODIFIES: None (pure function)
 * EFFECTS: Returns new line object with appropriate tool settings
 * RETURNS: DrawingLine with duplicate start point for Konva rendering
 */
export const createNewLine = (point: Point, toolSettings: ToolSettings, lineId: string): DrawingLine => {
  return {
    id: lineId,
    points: [point, point], // Duplicate point for Konva visibility
    color: toolSettings.color || '#000000',
    width: toolSettings.width,
    tool: toolSettings.tool
  };
}; 