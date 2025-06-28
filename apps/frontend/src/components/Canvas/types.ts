/**
 * INTENTION: Define core types for the drawing canvas system
 * REQUIRES: None
 * MODIFIES: Type system
 * EFFECTS: Provides type safety and extensibility for canvas components
 * RETURNS: Type definitions
 * 
 * ASSUMPTIONS: Using Konva for canvas implementation
 * INVARIANTS: Point coordinates are always positive numbers within canvas bounds
 * GHOST STATE: Drawing state transitions (idle -> drawing -> idle)
 */

export interface Point {
  x: number;
  y: number;
}

export interface DrawingLine {
  id: string;
  points: Point[];
  color: string;
  width: number;
  tool: DrawingTool;
}

export type DrawingTool = 'brush' | 'eraser';

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
}

export interface ToolSettings {
  tool: DrawingTool;
  color?: string;
  width: number;
}