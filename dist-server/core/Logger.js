import { createWriteStream } from 'fs';
import { join } from 'path';
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["CRITICAL"] = 4] = "CRITICAL";
})(LogLevel || (LogLevel = {}));
export class Logger {
    static instance;
    logStream;
    minLevel = LogLevel.INFO;
    correlationId = '';
    constructor() {
        const logFile = join(process.cwd(), 'logs', `bolt-ai-${new Date().toISOString().split('T')[0]}.log`);
        this.logStream = createWriteStream(logFile, { flags: 'a' });
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    setCorrelationId(id) {
        this.correlationId = id;
    }
    log(level, message, context, error) {
        if (level < this.minLevel)
            return;
        const entry = {
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
    generateCorrelationId() {
        return Math.random().toString(36).substring(2, 15);
    }
    getCallerModule() {
        const stack = new Error().stack;
        if (!stack)
            return 'unknown';
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
    debug(message, context) {
        this.log(LogLevel.DEBUG, message, context);
    }
    info(message, context) {
        this.log(LogLevel.INFO, message, context);
    }
    warn(message, context) {
        this.log(LogLevel.WARN, message, context);
    }
    error(message, context, error) {
        this.log(LogLevel.ERROR, message, context, error);
    }
    critical(message, context, error) {
        this.log(LogLevel.CRITICAL, message, context, error);
    }
    setLevel(level) {
        this.minLevel = level;
    }
    close() {
        this.logStream.close();
    }
}
