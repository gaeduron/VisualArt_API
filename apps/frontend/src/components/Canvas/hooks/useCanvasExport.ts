import { useCallback } from 'react';
import type { Stage as KonvaStage } from 'konva/lib/Stage';

interface UseCanvasExportProps {
  stageRef: React.RefObject<KonvaStage | null>;
  canvasName?: string;
}

interface ExportOptions {
  format?: 'png' | 'jpeg';
  quality?: number;
  pixelRatio?: number;
  backgroundColor?: string;
}

/**
 * INTENTION: Export canvas as PNG without modifying original drawing
 * REQUIRES: Konva Stage reference
 * MODIFIES: None (creates separate canvas for background compositing)
 * EFFECTS: Downloads PNG or returns image data for processing
 * RETURNS: Export functions
 * 
 * WHY POST-PROCESSING: We composite background on a separate canvas
 * instead of modifying the original stage. Keeps export pure + drawing untouched.
 */
export const useCanvasExport = ({ stageRef, canvasName = 'canvas' }: UseCanvasExportProps) => {
  
  const exportAsPNG = useCallback(async (options: ExportOptions = {}) => {
    const stage = stageRef.current;
    if (!stage) {
      console.warn('Canvas not ready for export');
      return null;
    }

    const {
      format = 'png',
      quality = 1,
      pixelRatio = 1,
      backgroundColor = 'white'
    } = options;

    try {
      const dataURL = stage.toDataURL({
        mimeType: `image/${format}`,
        quality,
        pixelRatio
      });

      // Add white background via compositing (keeps original canvas pure)
      if (backgroundColor === 'white') {
        const compositeCanvas = document.createElement('canvas');
        const ctx = compositeCanvas.getContext('2d');
        const originalImage = new Image();
        
        return new Promise<string>((resolve) => {
          originalImage.onload = () => {
            compositeCanvas.width = originalImage.width;
            compositeCanvas.height = originalImage.height;
            
            if (ctx) {
              // Layer 1: Background color (bottom layer)
              ctx.fillStyle = backgroundColor;
              ctx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);
              
              // Layer 2: Original drawing (top layer)
              // Transparent areas will show background color
              ctx.drawImage(originalImage, 0, 0);
            }
            resolve(compositeCanvas.toDataURL(`image/${format}`, quality));
          };
          
          // Load the original transparent export that triggers the onload event
          originalImage.src = dataURL;
        });
      }

      return dataURL;
    } catch (error) {
      console.error('Export failed:', error);
      return null;
    }
  }, [stageRef]);

  const downloadPNG = useCallback(async (options: ExportOptions = {}) => {
    const dataURL = await exportAsPNG(options);
    if (!dataURL) return false;

    try {
      const link = document.createElement('a');
      link.download = `${canvasName}_${Date.now()}.png`;
      link.href = dataURL;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Download failed:', error);
      return false;
    }
  }, [exportAsPNG, canvasName]);

  const getImageDataForProcessing = useCallback(async (options: ExportOptions = {}) => {
    const dataURL = await exportAsPNG(options);
    if (!dataURL) return null;

    return {
      dataURL,
      timestamp: Date.now(),
      format: options.format || 'png',
      pixelRatio: options.pixelRatio || 2
    };
  }, [exportAsPNG]);

  return {
    exportAsPNG,
    downloadPNG,
    getImageDataForProcessing // For future web worker integration
  };
}; 