enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

class Logger {
  private level: LogLevel;

  constructor(level: string = 'INFO') {
    this.level = LogLevel[level as keyof typeof LogLevel] || LogLevel.INFO;
  }

  private log(level: LogLevel, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;

    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  }

  error(message: string, error?: any): void {
    this.log(LogLevel.ERROR, message, error);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  debug(message: string, data?: any): void {
    if (this.level === LogLevel.DEBUG) {
      this.log(LogLevel.DEBUG, message, data);
    }
  }
}

export const logger = new Logger(process.env.LOG_LEVEL || 'INFO');
