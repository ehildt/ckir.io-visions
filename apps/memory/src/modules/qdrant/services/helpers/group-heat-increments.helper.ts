/** One batched heat write: hit ids sharing the same current count. */
interface HeatIncrementGroup {
  /** The `heat_amount` to write for this group (current count + 1). */
  nextAmount: number;
  ids: string[];
}

/**
 * Group search hits by their current heat count so the increment lands as
 * one batched setPayload per distinct value (Qdrant's setPayload applies one
 * payload object to a point list — it cannot increment per point). A hit
 * without a stored `heat_amount` counts as cold (0 → 1).
 */
export function groupHeatIncrements(
  hits: ReadonlyArray<{ id: string; heatAmount?: number }>,
): HeatIncrementGroup[] {
  const byCount = new Map<number, string[]>();
  for (const hit of hits) {
    const current = hit.heatAmount ?? 0;
    const ids = byCount.get(current) ?? [];
    ids.push(hit.id);
    byCount.set(current, ids);
  }
  return [...byCount.entries()].map(([current, ids]) => ({
    nextAmount: current + 1,
    ids,
  }));
}
