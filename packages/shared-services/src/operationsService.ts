import { checkDatabaseHealth } from "./databaseService";
import { getFeatureFlags } from "./featureFlags";
import { listLoggerRecords } from "./loggerService";
import { getMonitoringSummary, listErrorLogs, listMonitoringRecords } from "./monitoringService";
import { listRealtimeEvents } from "./realtimeService";

export type SystemStatus = "degraded" | "maintenance" | "operational";

export async function getProductionMonitoring() {
  const started = Date.now();
  const database = await checkDatabaseHealth();
  const latencyMs = Date.now() - started;
  const summary = getMonitoringSummary();
  const errors = listErrorLogs();
  const realtimeEvents = listRealtimeEvents();
  const loggerRecords = listLoggerRecords();

  return {
    authHealth: database.ok ? "Operacional" : "Degradado",
    failedActions: errors.filter((item) => item.type === "FAILED_ACTION").length,
    frontendErrors: loggerRecords.filter((item) => item.level === "error").length,
    notificationDelivery: deliveryStatus(),
    realtimeStatus: realtimeEvents.length >= 0 ? "Operacional" : "Degradado",
    requestCreationFailures: countErrors("REQUEST_CREATED"),
    donorAcceptanceFailures: countErrors("DONOR_ACCEPTED"),
    status: resolveStatus(database.ok, summary.errors),
    supabaseLatencyMs: latencyMs
  };
}

export function getOperationalAlerts() {
  const records = listMonitoringRecords();
  const errors = listErrorLogs();
  return [
    alert("Atividade de dadores", "low", "Confirmar pelo menos 5 dadores ativos no piloto.", true),
    alert("Hospitais online", "medium", "Validar presença do hospital piloto antes do teste.", true),
    alert("Notificações falhadas", "high", "Rever entregas push/in-app com erro.", errors.some(hasNotificationError)),
    alert("Falhas repetidas de PIN", "high", "Investigar tentativas inválidas.", countErrors("PIN_VALIDATED") >= 2),
    alert("Realtime", "high", "Reconectar canais Supabase.", records.some((item) =>
      item.message.toLowerCase().includes("realtime")
    ))
  ];
}

export function getSystemStatusCopy(status: SystemStatus) {
  if (status === "operational") return "Operacional";
  if (status === "maintenance") return "Manutenção";
  return "Degradado";
}

export function getLaunchOperationsSnapshot() {
  return {
    alerts: getOperationalAlerts(),
    flags: getFeatureFlags()
  };
}

function resolveStatus(databaseOk: boolean, errors: number): SystemStatus {
  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true") return "maintenance";
  if (!databaseOk || errors > 3) return "degraded";
  return "operational";
}

function deliveryStatus() {
  const failed = listErrorLogs().some(hasNotificationError);
  return failed ? "Com falhas" : "Operacional";
}

function hasNotificationError(record: { message: string; type: string }) {
  return record.type === "ERROR" && record.message.toLowerCase().includes("notif");
}

function countErrors(type: string) {
  return listErrorLogs().filter((item) => item.type === type).length;
}

function alert(
  title: string,
  severity: "high" | "low" | "medium",
  action: string,
  active: boolean
) {
  return { action, active, severity, title };
}
