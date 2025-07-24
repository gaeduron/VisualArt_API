'use client';

import Image from 'next/image';
import { EvaluationResult } from '../../Canvas/hooks/useEvaluation';
import { levelToColor, levelToEmoji } from '../utils';

interface EvaluationThumbnailProps {
  result: EvaluationResult;
  index?: number;
  verbose?: boolean;
  className?: string;
  isLoading?: boolean;
  error?: string;
}

/**
 * INTENTION: Reusable thumbnail component for evaluation results
 * REQUIRES: EvaluationResult with comparison image and error rate
 * MODIFIES: None (pure display component)
 * EFFECTS: Renders thumbnail with configurable label verbosity
 * RETURNS: JSX thumbnail component
 *
 * ASSUMPTIONS: Images are valid URLs or base64 data
 * INVARIANTS: Label always positioned at bottom-right
 * GHOST STATE: Image loading state
 */
const EvaluationThumbnail = ({ 
  result, 
  index, 
  verbose = false, 
  className = "aspect-square w-full",
  isLoading = false, 
  error 
}: EvaluationThumbnailProps) => {
  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="text-red-600 text-sm font-medium mb-2">Evaluation Failed</div>
        <div className="text-red-500 text-xs mb-3">{error}</div>
        <button className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded transition-colors">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`relative bg-gray-100 rounded overflow-hidden ${className}`}>
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <Image
            src={result.comparisonImage}
            alt={`Evaluation result ${index ? index + 1 : 'preview'}`}
            fill
            className="object-cover"
            sizes={className.includes('w-32') ? '128px' : '300px'}
          />
          
          {/* Label overlay - bottom right */}
          <div className={`absolute bottom-1 right-1 ${levelToColor(result.top_5_error_rate)} bg-opacity-75 text-white px-1 py-0.5 rounded text-xs font-medium`}>
            {verbose ? (
              <>
                {levelToEmoji(result.top_5_error_rate)} <b>{result.top_5_error_rate.toFixed(1)}%</b> error • {new Date(result.createdAt).toLocaleTimeString()}
              </>
            ) : (
              `${result.top_5_error_rate.toFixed(1)}%`
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EvaluationThumbnail; 