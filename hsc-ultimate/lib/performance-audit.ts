export function percentile(values: number[], ratio: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1));
  return sorted[index];
}

export function summarizeLatency(values: number[]) {
  if (values.length === 0) return { min: 0, p50: 0, p95: 0, max: 0 };
  return {
    min: Math.min(...values),
    p50: percentile(values, 0.5),
    p95: percentile(values, 0.95),
    max: Math.max(...values),
  };
}

export function collectPlanIndexes(plan: unknown, indexes = new Set<string>()): string[] {
  if (!plan || typeof plan !== "object") return [...indexes];
  const record = plan as Record<string, unknown>;
  if (typeof record["Index Name"] === "string") indexes.add(record["Index Name"]);
  if (Array.isArray(record.Plans)) {
    for (const child of record.Plans) collectPlanIndexes(child, indexes);
  }
  return [...indexes].sort();
}

export function classifyFindMany(input: {
  hasWhere: boolean;
  hasLimit: boolean;
  intentionalFullRead: boolean;
}): "BOUNDED" | "INTENTIONAL_FULL_READ" | "SCOPED_UNBOUNDED" | "GLOBAL_UNBOUNDED" {
  if (input.hasLimit) return "BOUNDED";
  if (input.intentionalFullRead) return "INTENTIONAL_FULL_READ";
  return input.hasWhere ? "SCOPED_UNBOUNDED" : "GLOBAL_UNBOUNDED";
}
