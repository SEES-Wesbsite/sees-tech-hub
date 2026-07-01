import { TIER_THRESHOLDS } from '@/lib/constants';

export const RANK_TITLES: Record<string, string> = {
  'S': 'Supreme Sage',
  'A': 'Apex Architect',
  'B': 'Binary Builder',
  'C': 'Code Crafter',
  'D': 'Debug Detective',
  'E': 'Explorer',
};

export const QUIZ_SCORING = {
  BASE_POINTS_PER_QUESTION: 20,
  SPEED_BONUS_MAX: 39.9,
  SPEED_BONUS_CUTOFF_SECONDS: 10,
};
