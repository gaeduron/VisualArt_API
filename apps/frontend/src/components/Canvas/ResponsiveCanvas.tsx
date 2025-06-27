'use client';

import { useRef, useState, useEffect, ReactNode } from 'react';

export interface ResponsiveCanvasProps {
  logicalWidth: number;
  logicalHeight: number;
  children: (scaling: CanvasScalingAPI) => ReactNode;
  className?: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface CanvasScalingAPI {
  /** Convert screen coordinates to logical canvas coordinates */
  screenToCanvas: (screenPoint: Point) => Point;
  /** Get visual dimensions for Stage component */
  getVisualDimensions: () => { width: number; height: number };
  /** Get scaling properties for Stage component */
  getStageScaling: () => { scaleX: number; scaleY: number };
  /** Container ref for measuring */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Current scale factor for debugging */
  scale: number;
}

/**
 * INTENTION: Provide responsive canvas scaling as a reusable component
 * REQUIRES: Logical canvas dimensions and render function
 * MODIFIES: Manages scaling state and container measurement
 * EFFECTS: Renders responsive canvas container with scaling utilities
 * RETURNS: JSX wrapper that handles all scaling concerns
 * 
 * EXAMPLE USAGE:
 * ```tsx
 * <ResponsiveCanvas logicalWidth={500} logicalHeight={500}>
 *   {(scaling) => (
 *     <Stage 
 *       width={scaling.getVisualDimensions().width}
 *       height={scaling.getVisualDimensions().height}
 *       {...scaling.getStageScaling()}
 *     >
 *       <Layer>...</Layer>
 *     </Stage>
 *   )}
 * </ResponsiveCanvas>
 * ```
 */
const ResponsiveCanvas = ({ 
  logicalWidth, 
  logicalHeight, 
  children, 
  className = "border border-gray-400 rounded-lg overflow-hidden shadow-sm w-full"
}: ResponsiveCanvasProps) => {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate responsive scale factor
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Scale down if container is smaller than logical size, otherwise keep 1:1
        const newScale = Math.min(1, containerWidth / logicalWidth);
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [logicalWidth]);

  // Scaling API for child components
  const scalingAPI: CanvasScalingAPI = {
    screenToCanvas: (screenPoint: Point): Point => ({
      x: screenPoint.x / scale,
      y: screenPoint.y / scale
    }),

    getVisualDimensions: () => ({
      width: logicalWidth * scale,
      height: logicalHeight * scale
    }),

    getStageScaling: () => ({
      scaleX: scale,
      scaleY: scale
    }),

    containerRef,
    scale
  };

  return (
    <div className={className} style={{ maxWidth: `${logicalWidth}px` }}>
      <div ref={containerRef} className="w-full aspect-square">
        {children(scalingAPI)}
      </div>
    </div>
  );
};

export default ResponsiveCanvas; 