'use client';

import Canvas from './index';
import ReferenceImage from '../ReferenceImage';
import { useReferenceImage } from './hooks/useReferenceImage';

/**
 * INTENTION: Arrange reference image and drawing canvas side by side
 * REQUIRES: None (uses internal hook for reference image state)
 * MODIFIES: None
 * EFFECTS: Renders responsive layout for evaluation step
 * RETURNS: JSX layout container
 */
const CanvasLayout = () => {
  const { imageUrl, isLoading, error } = useReferenceImage();

  return (
    <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
      <ReferenceImage imageUrl={imageUrl} isLoading={isLoading} error={error} />
      <Canvas />
    </div>
  );
};

export default CanvasLayout;
