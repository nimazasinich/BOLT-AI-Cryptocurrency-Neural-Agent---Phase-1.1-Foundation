import { createWriteStream, WriteStream } from 'fs';
import { join } from 'path';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  correlationId?: string;
  module?: string;
  error?: Error;
}

export class Logger {
  private static instance: Logger;
  private logStream: WriteStream;
  private minLevel: LogLevel = LogLevel.INFO;
  private correlationId: string = '';

  private constructor() {
    const logFile = join(process.cwd(), 'logs', `bolt-ai-${new Date().toISOString().split('T')[0]}.log`);
    this.logStream = createWriteStream(logFile, { flags: 'a' });
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setCorrelationId(id: string): void {
    this.correlationId = id;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    if (level < this.minLevel) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      context,
      correlationId: this.correlationId || this.generateCorrelationId(),
      module: this.getCallerModule(),
      error
    };

    const logLine = JSON.stringify(entry) + '\n';
    
    // Write to file
    this.logStream.write(logLine);
    
    // Also log to console for development
    const levelName = LogLevel[level];
    const timestamp = new Date(entry.timestamp).toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    const errorStr = error ? ` | Error: ${error.message}\n${error.stack}` : '';
    
    console.log(`[${timestamp}] [${levelName}] [${entry.correlationId}] ${message}${contextStr}${errorStr}`);
  }

  private generateCorrelationId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private getCallerModule(): string {
    const stack = new Error().stack;
    if (!stack) return 'unknown';
    
    const lines = stack.split('\n');
    // Skip current function and log function
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/at .* \((.+):(\d+):(\d+)\)/);
      if (match) {
        const filePath = match[1];
        return filePath.split('/').pop() || 'unknown';
      }
    }
    return 'unknown';
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  critical(message: string, context?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.CRITICAL, message, context, error);
  }

  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  close(): void {
    this.logStream.close();
  }
}