export declare enum LogLevel {
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
export declare class Logger {
    private static instance;
    private logStream;
    private minLevel;
    private correlationId;
    private constructor();
    static getInstance(): Logger;
    setCorrelationId(id: string): void;
    private log;
    private generateCorrelationId;
    private getCallerModule;
    debug(message: string, context?: Record<string, any>): void;
    info(message: string, context?: Record<string, any>): void;
    warn(message: string, context?: Record<string, any>): void;
    error(message: string, context?: Record<string, any>, error?: Error): void;
    critical(message: string, context?: Record<string, any>, error?: Error): void;
    setLevel(level: LogLevel): void;
    close(): void;
}
