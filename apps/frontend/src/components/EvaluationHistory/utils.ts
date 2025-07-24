/**
 * INTENTION: Provide shared utilities for evaluation level styling
 * REQUIRES: Error rate percentage as input
 * MODIFIES: None (pure functions)
 * EFFECTS: Returns consistent colors and emojis based on error rate
 * RETURNS: Color classes and emoji strings
 *
 * ASSUMPTIONS: Lower error rates are better (green), higher are worse (red)
 * INVARIANTS: Color scale is consistent across all components
 * GHOST STATE: None (stateless utilities)
 */

export const levelToColor = (level: number): string => {
  if (level < 2) return 'bg-teal-500 shadow-lg shadow-teal-500/20';
  if (level < 3) return 'bg-green-500'; 
  if (level < 4) return 'bg-lime-500'; 
  if (level < 5) return 'bg-yellow-500';
  if (level < 6) return 'bg-orange-500'; 
  if (level < 7) return 'bg-amber-500'; 
  return 'bg-red-500'; 
};

export const levelToEmoji = (level: number): string => {
  if (level < 2) return '🌟';
  if (level < 3) return '🥇';
  if (level < 4) return '🥈';
  if (level < 5) return '🥉';
  return '';
}; 