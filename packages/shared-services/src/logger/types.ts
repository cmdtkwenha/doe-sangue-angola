export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogContext = {
  feature?: string;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, string | number | boolean>;
};

export type LogEntry = {
  level: LogLevel;
  message: string;
  context?: LogContext;
  time: string;
};
