export function liveDisplay(seconds: number): string {
  const total = Math.max(0, seconds);
  const minutes = Math.floor(total / 60);
  const secs = Math.floor(total) % 60;
  const tenths = Math.floor((total - Math.floor(total)) * 10);
  return `${minutes}:${secs.toString().padStart(2, '0')}.${tenths}`;
}

export function compact(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
