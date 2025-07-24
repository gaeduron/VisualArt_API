'use client';

import { useState } from 'react';
import Canvas from '../Canvas/index';
import ReferenceImage from '../ReferenceImage';
import EvaluationHistory from '../EvaluationHistory';
import { default as EvaluationHistoryToggleButton } from '../EvaluationHistory/components/ToggleButton';
import { useReferenceImage } from '../ReferenceImage/hooks/useReferenceImage';
import { useEvaluation } from '../Canvas/hooks/useEvaluation';

const DEFAULT_REFERENCE = "/drawing_reference.png"

/**
 * INTENTION: Arrange reference image, drawing canvas, and evaluation history
 * REQUIRES: None (uses internal hook for reference image state)
 * MODIFIES: History panel open/close state
 * EFFECTS: Renders responsive layout with toggleable evaluation history side panel
 * RETURNS: JSX layout container
 */
const Workspace = () => {
  const { imageUrl, isLoading, error } = useReferenceImage(DEFAULT_REFERENCE);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const { evaluate, evaluationStore, pushToEvaluationStore } = useEvaluation();

  const handleEvaluate = async (userDrawingDataUrl: string) => {
    if (!imageUrl || !userDrawingDataUrl) return;
    
    const result = evaluate(imageUrl, userDrawingDataUrl);
    pushToEvaluationStore(result);
    
    console.log('Evaluation result:', result);
    console.log('Evaluation store now has:', evaluationStore.length + 1, 'results');
  };

  const toggleHistory = () => {
    setIsHistoryOpen(!isHistoryOpen);
  };
  const lastEvaluation = evaluationStore.length > 0 ? evaluationStore[evaluationStore.length - 1] : undefined;

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Main content area */}
      <div className="p-32 flex items-center justify-center gap-6 md:flex-row md:items-start">
        <ReferenceImage imageUrl={imageUrl} isLoading={isLoading} error={error} />
        <Canvas 
          onEvaluate={handleEvaluate}
        />
      </div>
      

      {/* Evaluation History Side Panel */}
      <EvaluationHistory 
        evaluationStore={evaluationStore}
        isOpen={isHistoryOpen}
        onToggle={toggleHistory}
      />
      <EvaluationHistoryToggleButton 
        onClick={toggleHistory}
        evaluationCount={evaluationStore.length}
        lastEvaluation={lastEvaluation}
      />
    </div>
  );
};

export default Workspace;
