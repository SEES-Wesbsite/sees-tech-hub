export const TIER_THRESHOLDS: Record<string, number> = {
  E: 0,
  D: 100,
  C: 300,
  B: 600,
  A: 1000,
  S: 2500,
}

export const NEXT_TIER_MAP: Record<string, string | null> = {
  E: 'D',
  D: 'C',
  C: 'B',
  B: 'A',
  A: 'S',
  S: null,
}
