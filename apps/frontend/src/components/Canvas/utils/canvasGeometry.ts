import { KonvaEventObject } from 'konva/lib/Node';
import { Point } from '../types';
import { CanvasScalingAPI } from '../components/ResponsiveCanvas';

/**
 * INTENTION: Check if mouse button is currently pressed
 * REQUIRES: Valid Konva event
 * MODIFIES: None (pure function)
 * EFFECTS: None
 * RETURNS: Boolean indicating if mouse/touch is pressed
 */
export const isMousePressed = (e: KonvaEventObject<MouseEvent | TouchEvent>): boolean => {
  return (e.evt as MouseEvent)?.buttons === 1 || e.evt.type.includes('touch');
};

/**
 * INTENTION: Extract canvas coordinates from Konva event
 * REQUIRES: Valid Konva event and scaling API
 * MODIFIES: None (pure function)
 * EFFECTS: None
 * RETURNS: Canvas point or null if extraction fails
 */
export const getCanvasPoint = (
  e: KonvaEventObject<MouseEvent | TouchEvent>, 
  scaling: CanvasScalingAPI
): Point | null => {
  const stage = e.target.getStage();
  const rawPoint = stage?.getPointerPosition();
  return rawPoint ? scaling.screenToCanvas(rawPoint) : null;
}; 