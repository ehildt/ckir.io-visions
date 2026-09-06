/** Normalize a cognition insight into the snapshot shape. */
export function mapInsight(
  insight: {
    id?: string;
    text?: unknown;
    path?: string;
    isConsolidated?: boolean;
    isReflected?: boolean;
    isFriction?: boolean;
    superseded?: boolean;
    supersededBy?: string;
    heatAmount?: number;
    heatTimestamp?: string;
  },
  index: number,
) {
  return {
    id: insight.id ?? `insight-${index}`,
    text: insight.text as string,
    path: insight.path,
    isConsolidated: insight.isConsolidated,
    isReflected: insight.isReflected,
    isFriction: insight.isFriction,
    superseded: insight.superseded,
    supersededBy: insight.supersededBy,
    heatAmount: insight.heatAmount,
    heatTimestamp: insight.heatTimestamp,
  };
}
