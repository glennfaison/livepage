"use client"

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== "production"

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.isDevelopment && level === "debug") return

    const prefix = `[${level.toUpperCase()}]`
    const timestamp = new Date().toISOString()
    const formattedMessage = `${timestamp} ${prefix} ${message}`

    switch (level) {
      case "error":
        console.error(formattedMessage, context ?? "")
        break
      case "warn":
        console.warn(formattedMessage, context ?? "")
        break
      case "info":
        console.info(formattedMessage, context ?? "")
        break
      case "debug":
        console.debug(formattedMessage, context ?? "")
        break
    }
  }

  error(message: string, context?: LogContext): void {
    this.log("error", message, context)
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context)
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context)
  }

  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context)
  }
}

export const logger = new Logger()