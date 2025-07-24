/**
 * INTENTION: Display real-time evaluation feedback during drawing
 * REQUIRES: Evaluation state from streaming evaluator
 * MODIFIES: UI visual state only
 * EFFECTS: Shows live top-5 error score with visual feedback
 * RETURNS: JSX evaluation display component
 * 
 * BUSINESS VALUE: Enables real-time drawing guidance and immediate feedback
 * - Students see accuracy improve/worsen as they draw
 * - Instructors can observe student progress live
 * - Gamification potential with score improvement
 */

import React from 'react';
import { StreamingEvaluationState } from '../hooks/useStreamingEvaluation';

interface LiveEvaluationDisplayProps {
  evaluationState: StreamingEvaluationState;
  className?: string;
}

/**
 * INTENTION: Provide color-coded visual feedback based on evaluation score
 * REQUIRES: Numeric score (0-100 range expected)
 * MODIFIES: None (pure function)
 * EFFECTS: Returns appropriate styling for score visualization
 * RETURNS: Object with colors and styling properties
 * 
 * ALGORITHM: Score-based color mapping
 * - Excellent (0-5%): Green - very accurate drawing
 * - Good (5-15%): Yellow-green - acceptable accuracy
 * - Fair (15-25%): Orange - needs improvement  
 * - Poor (25%+): Red - significant errors
 * ASSUMPTIONS: Lower scores are better (error percentages)
 */
const getScoreVisualization = (score: number) => {
  if (score <= 5) {
    return {
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'Excellent',
      emoji: '🎯'
    };
  } else if (score <= 15) {
    return {
      color: 'text-yellow-700', 
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      label: 'Good',
      emoji: '👍'
    };
  } else if (score <= 25) {
    return {
      color: 'text-orange-700',
      bgColor: 'bg-orange-50', 
      borderColor: 'border-orange-200',
      label: 'Fair',
      emoji: '📈'
    };
  } else {
    return {
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200', 
      label: 'Needs Work',
      emoji: '🎨'
    };
  }
};

/**
 * INTENTION: Show loading state while evaluation system initializes
 * REQUIRES: None
 * MODIFIES: None (pure component)
 * EFFECTS: Displays loading indicator with helpful text
 * RETURNS: JSX loading state component
 * 
 * ASSUMPTIONS: Loading state is temporary during initialization
 * INVARIANTS: Loading indicator is visually consistent with app design
 * GHOST STATE: User understands evaluation will be available soon
 */
const LoadingState = () => (
  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
    <span className="text-blue-700 text-sm font-medium">
      Initializing evaluation system...
    </span>
  </div>
);

/**
 * INTENTION: Show error state when evaluation system fails
 * REQUIRES: Error message string
 * MODIFIES: None (pure component)
 * EFFECTS: Displays error with retry suggestion
 * RETURNS: JSX error state component
 * 
 * ASSUMPTIONS: Error is recoverable or informational
 * INVARIANTS: Error state doesn't prevent drawing functionality
 * GHOST STATE: User can continue drawing without evaluation
 */
const ErrorState = ({ error }: { error: string }) => (
  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
    <span className="text-red-600">⚠️</span>
    <div className="flex-1">
      <div className="text-red-700 text-sm font-medium">
        Evaluation temporarily unavailable
      </div>
      <div className="text-red-600 text-xs mt-1">
        {error}
      </div>
    </div>
  </div>
);

/**
 * INTENTION: Display live evaluation score with visual feedback
 * REQUIRES: Valid evaluation state with current score
 * MODIFIES: None (pure component)
 * EFFECTS: Shows color-coded score with descriptive labels
 * RETURNS: JSX score display component
 * 
 * ALGORITHM: Dynamic styling based on score ranges
 * - Color coding provides immediate visual feedback
 * - Descriptive labels help interpret numeric scores
 * - Emoji adds friendly, approachable visual element
 * ASSUMPTIONS: Score represents error percentage (lower = better)
 */
const ScoreDisplay = ({ score }: { score: number }) => {
  const viz = getScoreVisualization(score);
  
  return (
    <div className={`p-3 rounded-lg border ${viz.bgColor} ${viz.borderColor}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{viz.emoji}</span>
            <span className={`text-sm font-medium ${viz.color}`}>
              {viz.label}
            </span>
          </div>
          <div className={`text-xs mt-1 ${viz.color} opacity-75`}>
            Drawing accuracy
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-bold ${viz.color}`}>
            {score.toFixed(1)}%
          </div>
          <div className={`text-xs ${viz.color} opacity-75`}>
            error rate
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * INTENTION: Main component orchestrating evaluation display states
 * REQUIRES: StreamingEvaluationState from evaluation hook
 * MODIFIES: None (pure component)
 * EFFECTS: Renders appropriate state (loading/error/score) based on evaluation status
 * RETURNS: JSX live evaluation display
 * 
 * ALGORITHM: State-based rendering
 * - Loading: Show initialization progress
 * - Error: Show error with context
 * - Ready: Show live score with visual feedback
 * - Hidden: Render nothing if evaluation disabled
 * ASSUMPTIONS: Evaluation state accurately reflects system status
 */
const LiveEvaluationDisplay = ({ 
  evaluationState, 
  className = "" 
}: LiveEvaluationDisplayProps) => {
  // Don't render anything if evaluation is not configured
  if (!evaluationState) return null;

  // Show loading state during initialization
  if (evaluationState.isLoading) {
    return (
      <div className={`${className}`}>
        <LoadingState />
      </div>
    );
  }

  // Show error state if initialization failed
  if (evaluationState.error) {
    return (
      <div className={`${className}`}>
        <ErrorState error={evaluationState.error} />
      </div>
    );
  }

  // Show live score if evaluation is ready
  if (evaluationState.isInitialized) {
    return (
      <div className={`${className}`}>
        <ScoreDisplay score={evaluationState.currentScore} />
      </div>
    );
  }

  // Default: render nothing if state is unclear
  return null;
};

export default LiveEvaluationDisplay; 