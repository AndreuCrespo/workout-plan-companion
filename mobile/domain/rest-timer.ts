/** Converts common Spanish rest prescriptions such as "90 s" or "1 min 30 s" to seconds. */
export function restDurationInSeconds(rest: string): number | null {
  const normalizedRest = rest.trim().toLowerCase().replace(',', '.');
  const minutesMatch = normalizedRest.match(/(\d+(?:\.\d+)?)\s*(?:min|mins|minuto|minutos)\b/);
  const secondsMatch = normalizedRest.match(/(\d+(?:\.\d+)?)\s*(?:s|seg|segs|segundo|segundos)\b/);
  const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;
  const seconds = secondsMatch ? Number(secondsMatch[1]) : 0;
  const duration = Math.round(minutes * 60 + seconds);

  return Number.isFinite(duration) && duration > 0 ? duration : null;
}

export function formatDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = `${safeSeconds % 60}`.padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}
