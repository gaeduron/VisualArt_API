'use client';

import EvaluationThumbnail from './EvaluationThumbnail';
import { EvaluationResult } from '../../Canvas/hooks/useEvaluation';

interface EvaluationItemProps {
  result: EvaluationResult;
  index: number;
  isLoading?: boolean;
  error?: string;
}

/**
 * INTENTION: Display individual evaluation result as thumbnail card with overlays
 * REQUIRES: EvaluationResult with images and score
 * MODIFIES: None (pure display component)
 * EFFECTS: Renders thumbnail with full verbose label and hover effects
 * RETURNS: JSX card component
 *
 * ASSUMPTIONS: Uses EvaluationThumbnail with verbose mode
 * INVARIANTS: Always shows full evaluation info with hover states
 * GHOST STATE: Hover interaction state
 */
const EvaluationItem = ({ result, index, isLoading = false, error }: EvaluationItemProps) => {
  return (
    <div className="hover:shadow-md transition-shadow border-2 border-gray-200 rounded-lg overflow-hidden">
      <EvaluationThumbnail
        result={result}
        index={index}
        verbose={true}
        className="aspect-square w-full"
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default EvaluationItem; 