import WebSocket from 'ws';
import { MarketData } from '../types/index.js';
interface RateLimitInfo {
    requestsPerSecond: number;
    requestsPerMinute: number;
    dailyRequestCount: number;
    lastResetTime: number;
    requestQueue: number[];
}
interface ConnectionHealth {
    isConnected: boolean;
    lastPingTime: number;
    latency: number;
    reconnectAttempts: number;
    clockSkew: number;
}
export declare class BinanceService {
    private static instance;
    private httpClient;
    private wsConnections;
    private wsMultiplexer;
    private rateLimitInfo;
    private connectionHealth;
    private reconnectTimer;
    private healthCheckTimer;
    private logger;
    private config;
    private baseUrl;
    private wsBaseUrl;
    private testnetMode;
    private constructor();
    static getInstance(): BinanceService;
    private setupInterceptors;
    private enforceRateLimit;
    private handleRateLimitError;
    private detectClockSkew;
    private startHealthMonitoring;
    private initiateReconnection;
    toggleTestnet(useTestnet: boolean): void;
    private createWebSocketMultiplexer;
    private handleMultiplexerMessage;
    getConnectionHealth(): ConnectionHealth;
    getRateLimitInfo(): RateLimitInfo;
    private createSignature;
    getKlines(symbol: string, interval: string, limit?: number, startTime?: number, endTime?: number): Promise<MarketData[]>;
    getCurrentPrice(symbol: string): Promise<number>;
    get24hrTicker(symbol?: string): Promise<any>;
    connectWebSocket(streams: string[]): Promise<WebSocket>;
    private handleWebSocketMessage;
    subscribeToKlines(symbols: string[], interval?: string): Promise<WebSocket>;
    subscribeToTickers(symbols: string[]): Promise<WebSocket>;
    getServerTime(): Promise<number>;
    closeAllConnections(): void;
    getAccountInfo(): Promise<any>;
    getExchangeInfo(): Promise<any>;
}
export {};
