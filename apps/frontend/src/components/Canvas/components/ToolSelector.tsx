import { Brush, Eraser } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import { DrawingTool } from '../types';

interface ToolSelectorProps {
  currentTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
}

const ToolSelector = ({ currentTool, onToolChange }: ToolSelectorProps) => {
  const tools = [
    { 
      id: 'brush' as DrawingTool, 
      label: 'Brush', 
      shortcut: 'B',
      icon: Brush
    },
    { 
      id: 'eraser' as DrawingTool, 
      label: 'Eraser', 
      shortcut: 'E',
      icon: Eraser
    }
  ];

  return (
    <TooltipProvider>
      <div className="flex gap-2">
        {tools.map((tool) => {
          const IconComponent = tool.icon;
          return (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onToolChange(tool.id)}
                  className={`
                    flex flex-col items-center gap-1 w-12 py-2 rounded-md border transition-colors
                    ${currentTool === tool.id 
                      ? 'bg-blue-500 text-white border-blue-500 shadow-sm' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }
                  `}
                >
                  <IconComponent size={20} />
                  <span className={`text-xs font-medium ${currentTool === tool.id ? 'text-white' : 'text-gray-500'}`}>
                    {tool.shortcut}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tool.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default ToolSelector; 