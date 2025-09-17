import { Database as BetterDatabase } from 'better-sqlite3';
import { MarketDataRepository } from './repositories/MarketDataRepository.js';
import { TrainingMetricsRepository } from './repositories/TrainingMetricsRepository.js';
export declare class EncryptedDatabase {
    private static instance;
    private db;
    private logger;
    private dbPath;
    private keyPath;
    private encryptionKey;
    private migrations;
    marketData: MarketDataRepository | null;
    trainingMetrics: TrainingMetricsRepository | null;
    private constructor();
    static getInstance(): EncryptedDatabase;
    private ensureDataDirectory;
    private generateEncryptionKey;
    private saveEncryptionKey;
    private loadEncryptionKey;
    private getOrCreateEncryptionKey;
    initialize(): Promise<void>;
    getDatabase(): BetterDatabase;
    backup(backupPath?: string): Promise<string>;
    vacuum(): Promise<void>;
    analyze(): Promise<void>;
    getStats(): {
        pageCount: number;
        pageSize: number;
        walSize: number;
        cacheSize: number;
    };
    close(): Promise<void>;
    transaction<T>(fn: () => T): T;
    healthCheck(): Promise<{
        connected: boolean;
        walMode: boolean;
        foreignKeys: boolean;
        stats: ReturnType<typeof this.getStats>;
    }>;
}
