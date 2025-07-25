'use client';

import { useState } from 'react';
import { View } from 'lucide-react';
import { EvaluationResult } from '../../Canvas/hooks/useEvaluation';
import EvaluationThumbnail from './EvaluationThumbnail';
import EvaluationDetails from './EvaluationDetails';

interface ToggleButtonProps {
  onClick: () => void;
  evaluationCount: number;
  lastEvaluation?: EvaluationResult;
}

/**
 * INTENTION: Provide toggle button for evaluation history panel with clickable preview
 * REQUIRES: Click handler, evaluation count, and optional last evaluation
 * MODIFIES: Details dialog open state when preview is clicked
 * EFFECTS: Renders floating button in top-right corner with clickable preview
 * RETURNS: JSX button component with preview and modal integration
 *
 * ASSUMPTIONS: Button is positioned absolutely in top-right, preview opens details dialog
 * INVARIANTS: Always shows evaluation count when > 0, preview when available and clickable
 * GHOST STATE: Panel visibility state managed by parent, dialog open/closed state
 */
const ToggleButton = ({ onClick, evaluationCount, lastEvaluation }: ToggleButtonProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const evaluationCountText = (evaluationCount: number) => {
    if (evaluationCount > 99) return '99+';
    if (evaluationCount === 0) return '';
    return evaluationCount;
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the main button click
    if (lastEvaluation) {
      setIsDetailsOpen(true);
    }
  };

  return (
    <>
      <div className="fixed top-8 right-[-20px] z-40">
        <button
          onClick={onClick}
          className="bg-white shadow-lg rounded-lg p-3 pr-[50px] border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <div className="relative">
            <View size={20} className="text-gray-700" />
          </div>
          <span className="text-sm font-medium text-gray-700 text-left flex gap-2">
              <div>Evaluations</div>
              <div className="text-gray-500 min-w-5">{evaluationCountText(evaluationCount)}</div>
          </span>
        </button>

        {lastEvaluation && (
          <div 
            className="mt-2 bg-white shadow-lg rounded-lg border border-gray-300 p-2 pr-[30px] cursor-pointer hover:border-gray-400 transition-colors"
            onClick={handlePreviewClick}
          >
            <EvaluationThumbnail
              result={lastEvaluation}
              verbose={false}
              className="aspect-square bg-gray-100 rounded overflow-hidden w-32"
            />
          </div>
        )}
      </div>

      {/* Details Dialog */}
      {lastEvaluation && (
        <EvaluationDetails
          result={lastEvaluation}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
        />
      )}
    </>
  );
};

export default ToggleButton; 