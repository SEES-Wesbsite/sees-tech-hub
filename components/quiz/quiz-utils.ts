import { TIER_THRESHOLDS } from '@/lib/constants';
import { QUIZ_SCORING } from './quiz-constants';

export function calculatePoints(isCorrect: boolean, timeLimit: number, timeRemaining: number): { base: number, bonus: number, total: number } {
  if (!isCorrect) {
    return { base: 0, bonus: 0, total: 0 };
  }

  const timeSpent = timeLimit - timeRemaining;
  let bonus = 0;

  // Speed bonus only available if answered within the first cutoff seconds
  if (timeSpent <= QUIZ_SCORING.SPEED_BONUS_CUTOFF_SECONDS) {
    // Formula guarantees max bonus at 0s, 0 bonus at cutoff seconds
    const ratio = (QUIZ_SCORING.SPEED_BONUS_CUTOFF_SECONDS - timeSpent) / QUIZ_SCORING.SPEED_BONUS_CUTOFF_SECONDS;
    bonus = Math.floor(ratio * QUIZ_SCORING.SPEED_BONUS_MAX);
  }

  return {
    base: QUIZ_SCORING.BASE_POINTS_PER_QUESTION,
    bonus,
    total: QUIZ_SCORING.BASE_POINTS_PER_QUESTION + bonus,
  };
}

export function getRankLetter(score: number): string {
  if (score >= TIER_THRESHOLDS.S) return 'S';
  if (score >= TIER_THRESHOLDS.A) return 'A';
  if (score >= TIER_THRESHOLDS.B) return 'B';
  if (score >= TIER_THRESHOLDS.C) return 'C';
  if (score >= TIER_THRESHOLDS.D) return 'D';
  return 'E';
}

export function getPersistedState<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const saved = localStorage.getItem(key);
  if (!saved) return fallback;
  try {
    return JSON.parse(saved);
  } catch {
    return fallback;
  }
}

export function persistState(key: string, value: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export function clearPersistedState(key: string) {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
}
