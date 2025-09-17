import { MarketData, BacktestResult } from '../types/index.js';
export interface BacktestConfig {
    startDate: number;
    endDate: number;
    initialCapital: number;
    feeRate: number;
    slippageRate: number;
    maxPositionSize: number;
}
export interface Trade {
    id: string;
    symbol: string;
    entryTime: number;
    exitTime: number;
    entryPrice: number;
    exitPrice: number;
    quantity: number;
    direction: 'LONG' | 'SHORT';
    pnl: number;
    fees: number;
    confidence: number;
    reasoning: string[];
}
export declare class BacktestEngine {
    private static instance;
    private logger;
    private bullBearAgent;
    private constructor();
    static getInstance(): BacktestEngine;
    runBacktest(marketData: MarketData[], config: BacktestConfig): Promise<BacktestResult>;
    private calculatePerformanceMetrics;
}
