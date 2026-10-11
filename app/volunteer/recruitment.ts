export const APPLICATION_URL = 'https://forms.gle/g8Soucwzh3hiXfBf6';
// Africa/Lagos observes UTC+1; explicit offset makes this independent of visitor timezone.
export const DEADLINE_ISO = '2026-10-18T23:59:00+01:00';
export const DEADLINE_MS = Date.parse(DEADLINE_ISO);
export const DEADLINE_LABEL = 'Sunday, October 18, 2026, at 11:59 PM WAT';

export function recruitmentState(now: number) {
  const seconds = Math.max(0, Math.ceil((DEADLINE_MS - now) / 1000));
  return {
    closed: now >= DEADLINE_MS,
    days: Math.floor(seconds / 86400),
    hours: Math.floor(seconds / 3600) % 24,
    minutes: Math.floor(seconds / 60) % 60,
    seconds: seconds % 60,
  };
}
