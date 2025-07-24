import { useCallback, useState } from 'react';

export interface EvaluationResult {
  top_5_error_rate: number; // percentage 0-100
  numberOfPixels: number;
  comparisonImage: string; // base64 or URL
  referenceImageUrl: string;
  userDrawingDataUrl: string;
  createdAt: number; // unix timestamp in milliseconds
}

/**
 * INTENTION: Provide pure evaluation function and store evaluation history
 * REQUIRES: Reference image URL and user drawing data URL as parameters
 * MODIFIES: Internal evaluation store state
 * EFFECTS: Returns mock evaluation results and manages evaluation history
 * RETURNS: Evaluation function, history store, and store management functions
 *
 * ASSUMPTIONS: Mock data for development, will be replaced with real evaluation
 * INVARIANTS: Always returns consistent mock structure, store maintains chronological order
 * GHOST STATE: Future evaluation API integration
 */
export const useEvaluation = () => {
  const [evaluationStore, setEvaluationStore] = useState<EvaluationResult[]>([]);

  const evaluate = (referenceImageUrl?: string, userDrawingDataUrl?: string): EvaluationResult => {
    // Mock evaluation logic
    console.log('Evaluating against reference:', referenceImageUrl);
    console.log('User drawing data URL length:', userDrawingDataUrl?.length || 0);

    if (!referenceImageUrl || !userDrawingDataUrl) {
      throw new Error('Reference image URL and user drawing data URL are required');
    }

    const mockResult: EvaluationResult = {
      top_5_error_rate: Math.random() * 12, // 0-12%
      numberOfPixels: Math.floor(Math.random() * 30000) + 50000,
      comparisonImage: '/evaluated_image_exemple.png',
      referenceImageUrl,
      userDrawingDataUrl,
      createdAt: Date.now(),
    };

    return mockResult;
  };

  const pushToEvaluationStore = useCallback((result: EvaluationResult) => {
    setEvaluationStore(prev => [...prev, result]);
  }, []);

  return { 
    evaluate, 
    evaluationStore, 
    pushToEvaluationStore 
  };
}; 