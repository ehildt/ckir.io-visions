/**
 * Mix a `#rrggbb` hex color toward a target hex color by `ratio`
 * (0 = base, 1 = target), returning a hex string. Used to warm a dot's halo
 * with its retrieval heat: the cluster's identity color while cold, warming
 * toward the heat ramp's hot end as access concentrates.
 */
export function mixColor(
  hex: string,
  targetHex: string,
  ratio: number,
): string {
  const base = parseHex(hex);
  const target = parseHex(targetHex);
  if (!base || !target) return hex;
  const t = Math.max(0, Math.min(1, ratio));
  const lerp = (a: number, b: number): number => Math.round(a + (b - a) * t);
  return `#${toHex(lerp(base[0], target[0]))}${toHex(lerp(base[1], target[1]))}${toHex(lerp(base[2], target[2]))}`;
}

/** Parse a `#rrggbb` hex color into [r, g, b], or null when the shape differs. */
function parseHex(hex: string): [number, number, number] | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!match) return null;
  const value = match[1];
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

/** One channel as two hex digits. */
function toHex(channel: number): string {
  return channel.toString(16).padStart(2, '0');
}
