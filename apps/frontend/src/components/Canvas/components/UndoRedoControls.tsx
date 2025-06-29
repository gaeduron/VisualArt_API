import { Undo2, Redo2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';

interface UndoRedoControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const UndoRedoControls = ({ onUndo, onRedo, canUndo, canRedo }: UndoRedoControlsProps) => {
  return (
    <TooltipProvider>
      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="flex flex-col items-center gap-1 w-12 py-2 bg-white text-gray-700 border border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              <Undo2 size={20} />
              <span className="text-xs font-medium text-gray-500">⌘Z</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Undo</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="flex flex-col items-center gap-1 w-12 py-2 bg-white text-gray-700 border border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              <Redo2 size={20} />
              <span className="text-xs font-medium text-gray-500">⌘⇧Z</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Redo</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default UndoRedoControls; 