'use client';

interface ClearCanvasButtonProps {
  onClear: () => void;
  disabled?: boolean;
}

/**
 * INTENTION: Provide immediate canvas clearing with undo safety
 * REQUIRES: onClear callback function
 * MODIFIES: Canvas state through onClear callback
 * EFFECTS: Clears canvas immediately (can be undone)
 * RETURNS: JSX button for clearing
 * 
 * ASSUMPTIONS: Undo functionality makes confirmation unnecessary
 * INVARIANTS: Clear action is reversible via undo
 * GHOST STATE: None - simple stateless button
 */
const ClearCanvasButton = ({ onClear, disabled = false }: ClearCanvasButtonProps) => {
  return (
    <button
      onClick={onClear}
      disabled={disabled}
      className="px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      Clear Canvas
    </button>
  );
};

export default ClearCanvasButton; 