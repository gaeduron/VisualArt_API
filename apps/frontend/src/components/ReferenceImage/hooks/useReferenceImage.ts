'use client';

import { useState, useCallback, useEffect } from 'react';

interface UseReferenceImageReturn {
  imageUrl?: string;
  isLoading: boolean;
  error?: string;
  loadImage: (url?: string) => void;
}

/**
 * INTENTION: Manage loading state for an optional reference image
 * REQUIRES: Optional initial URL string
 * MODIFIES: Internal loading and error state
 * EFFECTS: Provides helpers to load new reference images
 * RETURNS: Image url, loading boolean, error string and loader function
 */
export const useReferenceImage = (
  initialUrl?: string
): UseReferenceImageReturn => {
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const loadImage = useCallback((url?: string) => {
    if (!url) {
      setImageUrl(undefined);
      return;
    }

    setIsLoading(true);
    setError(undefined);
    const img = new Image();
    img.onload = () => {
      setImageUrl(url);
      setIsLoading(false);
    };
    img.onerror = () => {
      setError('Failed to load reference image');
      setIsLoading(false);
    };
    img.src = url;
  }, []);

  useEffect(() => {
    if (initialUrl) loadImage(initialUrl);
  }, [initialUrl, loadImage]);

  return { imageUrl, isLoading, error, loadImage };
};
