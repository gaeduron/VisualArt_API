'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

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
  return (
    <div className="aspect-square w-[500px] border rounded-lg overflow-hidden flex items-center justify-center bg-white relative">
      {isLoading && (
        <span className="text-sm text-gray-500">Loading...</span>
      )}
      {!imageUrl && !isLoading && !error && (
        <span className="text-gray-400 text-sm">No reference</span>
      )}
      {error && !isLoading && (
        <span className="text-red-500 text-sm">{error}</span>
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
    </div>
  );
};

export default ReferenceImage;
