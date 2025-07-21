'use client';

import Canvas from '../Canvas/index';
import ReferenceImage from '../ReferenceImage';
import { useReferenceImage } from '../ReferenceImage/hooks/useReferenceImage';
import { useEvaluation } from '../Canvas/hooks/useEvaluation';

const DEFAULT_REFERENCE = "/drawing_reference.png"

/**
 * INTENTION: Arrange reference image and drawing canvas side by side with evaluation
 * REQUIRES: None (uses internal hook for reference image state)
 * MODIFIES: None
 * EFFECTS: Renders responsive layout for evaluation step, manages evaluation flow
 * RETURNS: JSX layout container
 */
const Workspace = () => {
  const { imageUrl, isLoading, error } = useReferenceImage(DEFAULT_REFERENCE);
  
  const { evaluate, evaluationStore, pushToEvaluationStore } = useEvaluation();

  const handleEvaluate = async (userDrawingDataUrl: string) => {
    if (!imageUrl || !userDrawingDataUrl) return;
    
    const result = evaluate(imageUrl, userDrawingDataUrl);
    pushToEvaluationStore(result);
    
    console.log('Evaluation result:', result);
    console.log('Evaluation store now has:', evaluationStore.length + 1, 'results');
  };

  return (
    <div className="min-h-screen p-32 rounded-lg bg-gray-200 flex items-center justify-center gap-6 md:flex-row md:items-start">
      <ReferenceImage imageUrl={imageUrl} isLoading={isLoading} error={error} />
      <Canvas 
        onEvaluate={handleEvaluate}
      />
    </div>
  );
};

export default Workspace;
