'use client';

import Image from 'next/image';
import { EvaluationResult } from '../../Canvas/hooks/useEvaluation';
import { levelToColor, levelToEmoji, levelToText } from '../utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../ui/dialog';
import { Separator } from '../../ui/separator';

interface EvaluationDetailsProps {
  result: EvaluationResult;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * INTENTION: Display comprehensive evaluation details in a modal dialog
 * REQUIRES: EvaluationResult with all images and metrics
 * MODIFIES: Dialog open/closed state through onClose callback
 * EFFECTS: Renders full evaluation data with images and statistics
 * RETURNS: JSX dialog component with detailed evaluation view
 *
 * ASSUMPTIONS: All image URLs/data are valid and accessible
 * INVARIANTS: Dialog controls state through props, shows complete evaluation data
 * GHOST STATE: Image loading states, dialog animation states
 */
const EvaluationDetails = ({ result, isOpen, onClose }: EvaluationDetailsProps) => {
  const createdAtDate = new Date(result.createdAt);
  const errorColor = levelToColor(result.top_5_error_rate);
  const errorEmoji = levelToEmoji(result.top_5_error_rate);
  const errorText = levelToText(result.top_5_error_rate);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Evaluation Details</DialogTitle>
          <DialogDescription>
            Drawing evaluation results from {createdAtDate.toLocaleDateString()} at {createdAtDate.toLocaleTimeString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statistics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-800">
                {result.top_5_error_rate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Error Rate</div>
              <div className="text-lg mt-1">
                <span className={`inline-block px-2 py-1 rounded text-white text-xs ${errorColor}`}>
                  {errorEmoji} {errorText}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-800">
                🚧
              </div>
              <div className="text-sm text-gray-600">Speed level</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-800">
                Duration
              </div>
              <div className="text-sm text-gray-600">
                Comming soon
              </div>
            </div>
          </div>

          <Separator />

          {/* Images Comparison */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Visual Comparison</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Reference Image */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Reference Image</h4>
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                  <Image
                    src={result.referenceImageUrl}
                    alt="Reference image"
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                </div>
              </div>

              {/* User Drawing */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Your Drawing</h4>
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                  <Image
                    src={result.userDrawingDataUrl}
                    alt="User drawing"
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                </div>
              </div>

              {/* Comparison/Analysis */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Analysis Result</h4>
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                  <Image
                    src={result.comparisonImage}
                    alt="Comparison analysis"
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Detailed Metrics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detailed Metrics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Error Rate:</span>
                  <span className="font-medium">{result.top_5_error_rate.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pixels Analyzed:</span>
                  <span className="font-medium">{result.numberOfPixels.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Evaluation Date:</span>
                  <span className="font-medium">{createdAtDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Evaluation Time:</span>
                  <span className="font-medium">{createdAtDate.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EvaluationDetails; 