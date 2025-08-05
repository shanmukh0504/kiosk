import * as Sentry from "@sentry/react";

enum LogLevel {
  DEBUG = "debug",
  LOG = "log",
  WARN = "warn",
  ERROR = "error",
}

class Logger {
  private prefix: string;

  constructor(prefix = "App") {
    this.prefix = prefix;
  }

  private formatMessage(level: LogLevel, message: string) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${this.prefix}] [${level.toUpperCase()}] ${message}`;
  }

  private sendToSentry(level: LogLevel, message: string, data?: any) {
    if (level === LogLevel.WARN || level === LogLevel.ERROR) {
      if (level === LogLevel.ERROR) {
        Sentry.captureException(new Error(message), {
          tags: {
            logger_prefix: this.prefix,
            log_level: level,
          },
          contexts: {
            logger: {
              prefix: this.prefix,
              level: level,
              data: data,
            },
          },
        });
      } else {
        Sentry.captureMessage(message, {
          level: level as any,
          tags: {
            logger_prefix: this.prefix,
            log_level: level,
          },
          contexts: {
            logger: {
              prefix: this.prefix,
              level: level,
              data: data,
            },
          },
        });
      }
    }
  }

  debug(message: string, data?: any) {
    const formattedMessage = this.formatMessage(LogLevel.DEBUG, message);
    console.debug(formattedMessage, data);
  }

  log(message: string, data?: any) {
    const formattedMessage = this.formatMessage(LogLevel.LOG, message);
    console.log(formattedMessage, data);
  }

  warn(message: string, data?: any) {
    const formattedMessage = this.formatMessage(LogLevel.WARN, message);
    console.warn(formattedMessage, data);
    this.sendToSentry(LogLevel.WARN, message, data);
  }

  error(message: string, data?: any) {
    const formattedMessage = this.formatMessage(LogLevel.ERROR, message);
    console.error(formattedMessage, data);
    this.sendToSentry(LogLevel.ERROR, message, data);
  }
}

const logger = new Logger("Garden");

export default logger;
