import { logger } from "./logger/logger";
import type { LogContext, LogLevel } from "./logger/types";

export type LoggerRecord = {
  id: string;
  context?: LogContext;
  level: LogLevel;
  message: string;
  time: string;
};

const logRecords: LoggerRecord[] = [];

export function loggerService(
  level: LogLevel,
  message: string,
  context?: LogContext
) {
  const record: LoggerRecord = {
    id: `log-${Date.now()}-${logRecords.length + 1}`,
    context,
    level,
    message,
    time: new Date().toISOString()
  };

  logRecords.unshift(record);
  logger[level](message, context);
  return record;
}

export function listLoggerRecords() {
  return logRecords;
}

export function listErrorRecords() {
  return logRecords.filter((record) => record.level === "error");
}

export function clearLoggerRecords() {
  logRecords.length = 0;
}
