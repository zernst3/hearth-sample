export function safeRedirect(next: string | null | undefined, fallback = '/'): string {
  if (!next) return fallback;
  if (!next.startsWith('/') || next.startsWith('//')) return fallback;
  if (/[\\\r\n]/.test(next)) return fallback;
  return next;
}
