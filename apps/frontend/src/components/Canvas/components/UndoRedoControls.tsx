interface UndoRedoControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * INTENTION: Provide undo/redo button controls for canvas operations
 * REQUIRES: Valid callback functions and state flags
 * MODIFIES: None (pure UI component)
 * EFFECTS: Renders interactive undo/redo buttons with proper accessibility
 * RETURNS: JSX button controls
 * 
 * ASSUMPTIONS: Tailwind CSS classes are available
 */
const UndoRedoControls = ({ onUndo, onRedo, canUndo, canRedo }: UndoRedoControlsProps) => {
  return (
    <div className="flex gap-3">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
        title="Undo (⌘Z / Ctrl+Z)"
      >
        Undo
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
        title="Redo (⌘⇧Z / Ctrl+Shift+Z)"
      >
        Redo
      </button>
    </div>
  );
};

export default UndoRedoControls; 