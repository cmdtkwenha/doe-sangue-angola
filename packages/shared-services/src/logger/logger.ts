import type { LogContext, LogEntry, LogLevel } from "./types";

const write = (level: LogLevel, message: string, context?: LogContext) => {
  const entry: LogEntry = {
    level,
    message,
    context,
    time: new Date().toISOString()
  };

  if (level === "error") {
    console.error("[Doe Sangue Angola]", entry);
    return entry;
  }

  console.log("[Doe Sangue Angola]", entry);
  return entry;
};

export const logger = {
  debug: (message: string, context?: LogContext) =>
    write("debug", message, context),
  info: (message: string, context?: LogContext) =>
    write("info", message, context),
  warn: (message: string, context?: LogContext) =>
    write("warn", message, context),
  error: (message: string, context?: LogContext) =>
    write("error", message, context)
};
