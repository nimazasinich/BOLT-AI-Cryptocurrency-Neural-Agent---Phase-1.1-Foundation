export declare class MarketDataIngestionService {
    private static instance;
    private logger;
    private binanceService;
    private database;
    private redisService;
    private isRunning;
    private cronJobs;
    private watchedSymbols;
    private intervals;
    private constructor();
    static getInstance(): MarketDataIngestionService;
    initialize(): Promise<void>;
    private setupDataIngestionSchedule;
    private setupRealTimeStreaming;
    private ingestHistoricalData;
    private processMarketData;
    private normalizeMarketData;
    private validateMarketData;
    addWatchedSymbol(symbol: string): Promise<void>;
    removeWatchedSymbol(symbol: string): Promise<void>;
    getWatchedSymbols(): string[];
    stop(): Promise<void>;
    getStatus(): {
        isRunning: boolean;
        watchedSymbols: string[];
        intervals: string[];
    };
}
