import { MarketData } from '../types/index.js';
export declare class RedisService {
    private static instance;
    private redis;
    private subscriber;
    private publisher;
    private logger;
    private config;
    private isConnected;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private constructor();
    static getInstance(): RedisService;
    initialize(): Promise<void>;
    private setupEventHandlers;
    private handleReconnection;
    publishMarketData(data: MarketData): Promise<void>;
    subscribeToMarketData(symbols: string[], intervals: string[], callback: (data: MarketData) => void): Promise<void>;
    cacheData(key: string, data: any, ttlSeconds?: number): Promise<void>;
    getCachedData<T>(key: string): Promise<T | null>;
    invalidateCache(pattern: string): Promise<void>;
    getConnectionStatus(): Promise<{
        isConnected: boolean;
        reconnectAttempts: number;
        redisInfo?: any;
    }>;
    disconnect(): Promise<void>;
}
