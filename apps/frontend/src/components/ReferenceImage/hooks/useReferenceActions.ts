import { useMemo } from 'react';
import { ComponentActions } from '../../../lib/shortcuts/types';

interface UseReferenceActionsProps {
  pauseOrStart: () => void;
}

/**
 * INTENTION: Expose Reference actions for global shortcut binding
 * REQUIRES: Defensive Reference functions (handle invalid states gracefully)
 * MODIFIES: None (pure action exposure)
 * EFFECTS: Provides stable action references for shortcut registry
 * RETURNS: ComponentActions object for registration
 * 
 * ASSUMPTIONS: Functions are defensive, UI manages its own state
 * INVARIANTS: Actions are always callable (functions handle validity)
 * GHOST STATE: None (decoupled from Reference state)
 */
export const useReferenceActions = ({
  pauseOrStart
}: UseReferenceActionsProps): ComponentActions => {
  return useMemo(() => ({
    "pause/start": {
      fn: pauseOrStart,
      description: 'Pause or start the timer'
    },
  }), [pauseOrStart]);
}; 