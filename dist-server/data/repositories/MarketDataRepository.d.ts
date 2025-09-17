import { Database } from 'better-sqlite3';
import { BaseRepository } from './BaseRepository.js';
import { MarketData } from '../../types/index.js';
export declare class MarketDataRepository extends BaseRepository<MarketData> {
    constructor(database: Database);
    protected mapRowToEntity(row: any): MarketData;
    protected mapEntityToRow(entity: MarketData): any;
    findBySymbolAndInterval(symbol: string, interval: string, limit?: number, startTime?: number, endTime?: number): Promise<MarketData[]>;
    insertOrUpdate(marketData: MarketData): Promise<MarketData>;
    getLatestTimestamp(symbol: string, interval: string): Promise<number | null>;
    getSymbols(): Promise<string[]>;
    getIntervals(symbol: string): Promise<string[]>;
    deleteOldData(symbol: string, interval: string, keepDays?: number): Promise<number>;
}
