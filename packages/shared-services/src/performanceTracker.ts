import { monitoringService } from "./monitoringService";

export type PerformanceMetric = {
  durationMs: number;
  label: string;
  route?: string;
};

const performanceMetrics: PerformanceMetric[] = [
  { durationMs: 132, label: "Admin dashboard render", route: "/admin" },
  { durationMs: 118, label: "Hospital portal render", route: "/hospital" },
  { durationMs: 96, label: "Mobile preview render", route: "/mobile" }
];

export function performanceTracker(metric: PerformanceMetric) {
  performanceMetrics.unshift(metric);
  monitoringService({
    durationMs: metric.durationMs,
    message: `Performance: ${metric.label}`,
    metadata: { route: metric.route ?? "local" },
    status: metric.durationMs > 800 ? "warning" : "ok",
    type: "PERFORMANCE"
  });

  return metric;
}

export function measurePerformance<T>(label: string, action: () => T, route?: string) {
  const started = Date.now();
  const result = action();
  performanceTracker({ durationMs: Date.now() - started, label, route });
  return result;
}

export function listPerformanceMetrics() {
  return performanceMetrics;
}
