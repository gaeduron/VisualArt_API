'use client';

import { Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';

interface ClearCanvasButtonProps {
  onClear: () => void;
  disabled?: boolean;
}

const ClearCanvasButton = ({ onClear, disabled = false }: ClearCanvasButtonProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClear}
            disabled={disabled}
            className="flex flex-col items-center gap-1 w-12 py-2 bg-white text-red-600 border border-red-300 rounded-md hover:bg-red-50 hover:border-red-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 size={20} />
            <span className={`text-xs font-medium ${disabled ? 'text-gray-400' : 'text-red-600'}`}>C</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Clear Canvas</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ClearCanvasButton; 