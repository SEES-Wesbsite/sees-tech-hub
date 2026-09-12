export function callbackOrigin(requestUrl: string, configuredUrl?: string): string {
  const origin = new URL(configuredUrl || requestUrl);
  if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password) {
    throw new Error('Invalid site URL configuration.');
  }
  return origin.origin;
}
