'use client';

import { Download } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';

interface ExportButtonProps {
  onExport: () => void;
  disabled?: boolean;
}

const ExportButton = ({ onExport, disabled = false }: ExportButtonProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onExport}
            disabled={disabled}
            className="flex flex-col items-center gap-1 w-12 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Download size={20} />
            <span className={`text-xs font-medium ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
              PNG
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export as PNG</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ExportButton; 