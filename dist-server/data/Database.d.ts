import { MarketData, TrainingMetrics, Opportunity } from '../types/index.js';
export declare class Database {
    private static instance;
    private encryptedDb;
    private logger;
    private constructor();
    static getInstance(): Database;
    initialize(): Promise<void>;
    insertMarketData(data: MarketData): Promise<void>;
    getMarketData(symbol: string, interval: string, limit?: number): Promise<MarketData[]>;
    insertTrainingMetrics(metrics: TrainingMetrics): Promise<void>;
    getLatestTrainingMetrics(limit?: number): Promise<TrainingMetrics[]>;
    insertOpportunity(opportunity: Opportunity): Promise<void>;
    getActiveOpportunities(): Promise<Opportunity[]>;
    close(): Promise<void>;
    healthCheck(): Promise<{
        connected: boolean;
        walMode: boolean;
        foreignKeys: boolean;
        stats: ReturnType<any>;
    }>;
    backup(backupPath?: string): Promise<string>;
}
