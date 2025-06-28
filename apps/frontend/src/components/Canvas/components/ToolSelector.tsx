import { DrawingTool } from '../types';

interface ToolSelectorProps {
  currentTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
}

/**
 * INTENTION: Provide tool selection interface with visual feedback
 * REQUIRES: Current tool state and change handler
 * MODIFIES: None (pure UI component)
 * EFFECTS: Renders tool buttons with active state indication
 * RETURNS: JSX tool selection controls
 * 
 * ASSUMPTIONS: Keyboard shortcuts handled elsewhere
 */
const ToolSelector = ({ currentTool, onToolChange }: ToolSelectorProps) => {
  const tools = [
    { 
      id: 'brush' as DrawingTool, 
      label: 'Brush', 
      shortcut: 'B',
      icon: '🖌️'
    },
    { 
      id: 'eraser' as DrawingTool, 
      label: 'Eraser', 
      shortcut: 'E',
      icon: '🧹'
    }
  ];

  return (
    <div className="flex gap-2 bg-gray-100 p-2 rounded-lg">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolChange(tool.id)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md transition-colors
            ${currentTool === tool.id 
              ? 'bg-blue-500 text-white shadow-md' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
            }
          `}
          title={`${tool.label} (${tool.shortcut})`}
        >
          <span className="text-lg">{tool.icon}</span>
          <span className="font-medium">{tool.label}</span>
          <span className="text-xs opacity-75">({tool.shortcut})</span>
        </button>
      ))}
    </div>
  );
};

export default ToolSelector; 