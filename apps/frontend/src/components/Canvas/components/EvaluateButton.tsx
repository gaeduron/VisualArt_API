'use client';

import { View } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';

interface EvaluateButtonProps {
  onEvaluate: () => void;
  disabled?: boolean;
}

const EvaluateButton = ({ onEvaluate, disabled = false }: EvaluateButtonProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onEvaluate}
            disabled={disabled}
            className="flex flex-col items-center gap-1 w-12 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <View size={20} />
            <span className={`text-xs font-medium ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
              Tab
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Evaluate</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default EvaluateButton; 