'use client';

import Canvas from '../Canvas/index';
import ReferenceImage from '../ReferenceImage';
import { useReferenceImage } from '../ReferenceImage/hooks/useReferenceImage';

const DEFAULT_REFERENCE = "/drawing_reference.png"

/**
 * INTENTION: Arrange reference image and drawing canvas side by side
 * REQUIRES: None (uses internal hook for reference image state)
 * MODIFIES: None
 * EFFECTS: Renders responsive layout for evaluation step
 * RETURNS: JSX layout container
 */
const Workspace = () => {
  const { imageUrl, isLoading, error } = useReferenceImage(DEFAULT_REFERENCE);

  return (
    <div className="min-h-screen p-32 rounded-lg bg-gray-200 flex items-center justify-center gap-6 md:flex-row md:items-start">
      <ReferenceImage imageUrl={imageUrl} isLoading={isLoading} error={error} />
      <Canvas />
    </div>
  );
};

export default Workspace;
