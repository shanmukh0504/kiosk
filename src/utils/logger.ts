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
  }

  error(message: string, data?: any) {
    const formattedMessage = this.formatMessage(LogLevel.ERROR, message);
    console.error(formattedMessage, data);
  }
}

const logger = new Logger("Garden");

export default logger;
