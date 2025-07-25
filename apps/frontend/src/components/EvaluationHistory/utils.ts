/**
 * INTENTION: Provide utility functions for evaluation level categorization
 * REQUIRES: Error rate percentages as input
 * MODIFIES: None (pure utility functions)
 * EFFECTS: Maps error rates to visual and textual representations
 * RETURNS: Color classes, text labels, and emoji representations
 *
 * ASSUMPTIONS: Error rates are numeric percentages (0-100+)
 * INVARIANTS: Level mappings are consistent across all functions
 * GHOST STATE: Visual representation preferences
 */

interface LevelMapping {
  threshold: number;
  color: string;
  text: string;
  emoji: string;
}

/**
 * INTENTION: Centralized level mapping configuration
 * RETURNS: Array of level mappings ordered by threshold
 *
 * ASSUMPTIONS: Thresholds are in ascending order for proper lookup
 * INVARIANTS: Each level has color, text, and emoji representation
 * GHOST STATE: Design system color preferences
 */
const LEVEL_MAPPINGS: LevelMapping[] = [
  { threshold: 2, color: 'bg-teal-500 shadow-lg shadow-teal-500/20', text: 'Perfect', emoji: '🌟' },
  { threshold: 3, color: 'bg-green-500', text: 'Amazing', emoji: '🥇' },
  { threshold: 4, color: 'bg-lime-500', text: 'Professional', emoji: '👏' },
  { threshold: 5, color: 'bg-yellow-500', text: 'Good', emoji: '👍' },
  { threshold: 6, color: 'bg-orange-500', text: 'Ok', emoji: '👌' },
  { threshold: 7, color: 'bg-amber-500', text: 'Getting there', emoji: '🫡' },
  { threshold: Infinity, color: 'bg-red-500', text: 'Keep practicing', emoji: '💪' }
];

/**
 * INTENTION: Find appropriate level mapping for given error rate
 * REQUIRES: Numeric error rate percentage
 * EFFECTS: Returns first level mapping where error rate is below threshold
 * RETURNS: LevelMapping object
 *
 * ASSUMPTIONS: LEVEL_MAPPINGS is ordered by threshold ascending
 * INVARIANTS: Always returns a valid mapping (fallback to last entry)
 */
const getLevelMapping = (level: number): LevelMapping => {
  const levelMapping = LEVEL_MAPPINGS.find(mapping => level < mapping.threshold);
  if (!levelMapping) {
    return LEVEL_MAPPINGS[LEVEL_MAPPINGS.length - 1];
  }
  return levelMapping;
};

export const levelToColor = (level: number): string => {
  return getLevelMapping(level).color;
};

export const levelToText = (level: number): string => {
  return getLevelMapping(level).text;
};

export const levelToEmoji = (level: number): string => {
  return getLevelMapping(level).emoji;
}; 