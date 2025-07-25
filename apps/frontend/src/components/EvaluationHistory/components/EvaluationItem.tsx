'use client';

import { useState } from 'react';
import EvaluationThumbnail from './EvaluationThumbnail';
import EvaluationDetails from './EvaluationDetails';
import { EvaluationResult } from '../../Canvas/hooks/useEvaluation';

interface EvaluationItemProps {
  result: EvaluationResult;
  index: number;
  isLoading?: boolean;
  error?: string;
}

/**
 * INTENTION: Display individual evaluation result as thumbnail card with click-to-details functionality
 * REQUIRES: EvaluationResult with images and score
 * MODIFIES: Dialog open state when clicked
 * EFFECTS: Renders clickable thumbnail with full verbose label and opens details dialog
 * RETURNS: JSX card component with dialog integration
 *
 * ASSUMPTIONS: Uses EvaluationThumbnail with verbose mode, manages details dialog state
 * INVARIANTS: Always shows full evaluation info with hover states and click interaction
 * GHOST STATE: Dialog open/closed state, hover interaction state
 */
const EvaluationItem = ({ result, index, isLoading = false, error }: EvaluationItemProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleClick = () => {
    if (!isLoading && !error) {
      setIsDetailsOpen(true);
    }
  };

  return (
    <>
      <div 
        className={`
          hover:shadow-md transition-shadow border-2 border-gray-200 rounded-lg overflow-hidden
          ${!isLoading && !error ? 'cursor-pointer hover:border-gray-300' : ''}
        `}
        onClick={handleClick}
      >
        <EvaluationThumbnail
          result={result}
          index={index}
          verbose={true}
          className="aspect-square w-full"
          isLoading={isLoading}
          error={error}
        />
      </div>

      {/* Details Dialog */}
      <EvaluationDetails
        result={result}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>
  );
};

export default EvaluationItem; 