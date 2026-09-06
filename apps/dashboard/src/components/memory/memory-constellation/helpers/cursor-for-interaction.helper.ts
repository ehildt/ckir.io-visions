/**
 * The canvas cursor for one frame: grabbing while the camera drags or pans,
 * pointer over a dot (every dot selects — the metadata column shows its
 * payload), grab otherwise (the scene invites rotation).
 */
export function cursorForInteraction(
  interacting: boolean,
  hoveringDot: boolean,
): string {
  if (interacting) return 'grabbing';
  return hoveringDot ? 'pointer' : 'grab';
}
