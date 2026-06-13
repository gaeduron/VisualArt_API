'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ActionBar } from '@/components/ui/actionBar'
import TimerOnOffButton from './components/TimerOnOffButton';
import Timer from './components/Timer'
import { useMemo } from 'react';
import { useShortcutRegistry } from '@/lib/shortcuts/useShortcutRegistry';
import { useReferenceActions } from './hooks/useReferenceActions'
import useObservationContext from '@/components/Workspace/hooks/useObservationContext';
export interface ReferenceImageProps {
  imageUrl?: string;
  isLoading?: boolean;
  error?: string;
  onImageLoad?: () => void;
  alt?: string;
}

/**
 * INTENTION: Display a reference image with loading and empty states
 * REQUIRES: Optional image url and loading flag
 * MODIFIES: None
 * EFFECTS: Renders reference placeholder or image element
 * RETURNS: JSX element representing the reference image area
 */
const ReferenceImage = ({
  imageUrl,
  isLoading = false,
  error,
  onImageLoad,
  alt = 'Reference image',
}: ReferenceImageProps) => {
  const {
    startTimer,
    stopTimer,
    startedAt,
    paused,
    previouslyElapsedTime,
  } = useObservationContext();

  const pauseOrStart = useMemo(() => {
    if (paused) return startTimer
    return stopTimer

  }, [paused, startTimer, stopTimer])

  useShortcutRegistry('reference', useReferenceActions(
    { pauseOrStart }
  ));

  return (
    <div className="flex flex-col items-start gap-2">
      <span className="text-sm font-medium text-gray-600 bg-white p-2 rounded-lg">Reference</span>
      <div className="aspect-square w-[500px] h-[500px] border-3 border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-white relative">
        {isLoading && (
          <span className="text-sm text-gray-500">Loading...</span>
        )}
        {!imageUrl && !isLoading && !error && (
          <span className="text-gray-400 text-sm">No reference</span>
        )}
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={alt}
            fill
            sizes="500px"
            onLoadingComplete={onImageLoad}
            className={cn('object-contain', isLoading && 'hidden')}
          />
        )}
        {error && !isLoading && (
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-red-500 text-sm">
            {error}
          </span>
        )}
      </div>
      <ActionBar>
        <TimerOnOffButton
          onStart={startTimer}
          onPause={stopTimer}
          paused={paused}
        />
        <Timer
          startTime={startedAt || 0}
          previouslyElapsedTime={previouslyElapsedTime}
          paused={paused}
        />
      </ActionBar>
    </div>
  );
};

export default ReferenceImage;
