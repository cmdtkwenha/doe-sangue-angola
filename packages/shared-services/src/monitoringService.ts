import { loggerService } from "./loggerService";

export type MonitoringEventType =
  | "LOGIN"
  | "REQUEST_CREATED"
  | "DONOR_ACCEPTED"
  | "PIN_VALIDATED"
  | "FAILED_ACTION"
  | "ERROR"
  | "API_REQUEST"
  | "PERFORMANCE"
  | "USER_ACTION";

export type MonitoringRecord = {
  id: string;
  actor?: string;
  durationMs?: number;
  message: string;
  metadata?: Record<string, string | number | boolean>;
  status: "ok" | "warning" | "error";
  time: string;
  type: MonitoringEventType;
};

const monitoringRecords: MonitoringRecord[] = [
  {
    id: "mon-seed-login",
    actor: "admin@sangueangola.ao",
    message: "Login demo monitorizado",
    metadata: { role: "admin" },
    status: "ok",
    time: "2026-05-13T09:00:00.000Z",
    type: "LOGIN"
  },
  {
    id: "mon-seed-api",
    durationMs: 124,
    message: "API /api/health respondeu 200",
    metadata: { path: "/api/health", status: 200 },
    status: "ok",
    time: "2026-05-13T09:01:00.000Z",
    type: "API_REQUEST"
  },
  {
    id: "mon-seed-warning",
    durationMs: 860,
    message: "Integração futura Sentry: latência alta simulada",
    metadata: { provider: "future-sentry" },
    status: "warning",
    time: "2026-05-13T09:02:00.000Z",
    type: "PERFORMANCE"
  }
];

export function monitoringService(input: Omit<MonitoringRecord, "id" | "time">) {
  const record: MonitoringRecord = {
    ...input,
    id: `mon-${Date.now()}-${monitoringRecords.length + 1}`,
    time: new Date().toISOString()
  };

  monitoringRecords.unshift(record);
  if (record.status === "error") {
    loggerService("error", record.message, { feature: record.type, metadata: record.metadata });
  } else if (record.status === "warning") {
    loggerService("warn", record.message, { feature: record.type, metadata: record.metadata });
  } else {
    loggerService("info", record.message, { feature: record.type, metadata: record.metadata });
  }

  return record;
}

export function trackApiRequest(path: string, status: number, durationMs: number) {
  return monitoringService({
    durationMs,
    message: `API ${path} respondeu ${status}`,
    metadata: { path, status },
    status: status >= 400 ? "error" : "ok",
    type: "API_REQUEST"
  });
}

export function trackFailedAction(message: string, metadata?: MonitoringRecord["metadata"]) {
  return monitoringService({ message, metadata, status: "error", type: "FAILED_ACTION" });
}

export function listMonitoringRecords() {
  return monitoringRecords;
}

export function listApiRequestLogs() {
  return monitoringRecords.filter((record) => record.type === "API_REQUEST");
}

export function listErrorLogs() {
  return monitoringRecords.filter((record) => record.status === "error");
}

export function getMonitoringSummary() {
  const errors = listErrorLogs().length;
  const apiLogs = listApiRequestLogs();
  const performance = monitoringRecords.filter((record) => record.type === "PERFORMANCE");

  return {
    apiRequests: apiLogs.length,
    averageApiMs: average(apiLogs.map((log) => log.durationMs ?? 0)),
    errors,
    events: monitoringRecords.length,
    performanceSamples: performance.length
  };
}

export function clearMonitoringRecords() {
  monitoringRecords.length = 0;
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
