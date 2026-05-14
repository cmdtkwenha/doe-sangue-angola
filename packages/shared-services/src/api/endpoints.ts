export const apiEndpoints = {
  health: "/api/health",
  auth: "/api/auth",
  donors: "/api/donors",
  hospitals: "/api/hospitals",
  requests: "/api/blood-requests",
  appointments: "/api/appointments",
  notifications: "/api/notifications",
  auditLogs: "/api/audit-logs"
} as const;

export type ApiEndpoint = (typeof apiEndpoints)[keyof typeof apiEndpoints];
