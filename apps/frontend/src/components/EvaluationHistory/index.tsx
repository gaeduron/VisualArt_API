'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { EvaluationResult } from '../Canvas/hooks/useEvaluation';
import EvaluationItem from './components/EvaluationItem';

interface EvaluationHistoryProps {
  evaluationStore: EvaluationResult[];
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * INTENTION: Display evaluation history in an animated side sheet
 * REQUIRES: Array of evaluation results and open/close controls
 * MODIFIES: None (controlled by parent)
 * EFFECTS: Renders animated side sheet with scrollable evaluation history
 * RETURNS: JSX sheet component
 *
 * ASSUMPTIONS: Newest results should appear at the top
 * INVARIANTS: Sheet visibility controlled by parent
 * GHOST STATE: User interaction preferences
 */
const EvaluationHistory = ({ evaluationStore, isOpen, onToggle }: EvaluationHistoryProps) => {
  const sortedEvaluations = evaluationStore.slice().sort((a, b) => b.createdAt - a.createdAt);

  return (
    <Sheet open={isOpen} onOpenChange={onToggle}>
      <SheetContent side="right" className="w-80 sm:max-w-80">
        <SheetHeader>
          <SheetTitle>Evaluation History</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {evaluationStore.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className="mx-auto mb-4 opacity-50 text-5xl">📊</div>
              <p>No evaluations yet</p>
              <p className="text-sm">Draw something and click Evaluate</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedEvaluations.map((result, index) => (
                <EvaluationItem
                  key={evaluationStore.length - 1 - index}
                  result={result}
                  index={evaluationStore.length - 1 - index}
                />
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EvaluationHistory;