import { MarketData } from '../types/index.js';
export interface TechnicalIndicators {
    sma: number[];
    ema: number[];
    rsi: number;
    macd: {
        macd: number;
        signal: number;
        histogram: number;
    };
    bollingerBands: {
        upper: number;
        middle: number;
        lower: number;
    };
    atr: number;
    obv: number;
}
export interface SMCFeatures {
    liquidityZones: Array<{
        price: number;
        volume: number;
        strength: number;
        type: 'ACCUMULATION' | 'DISTRIBUTION';
    }>;
    orderBlocks: Array<{
        high: number;
        low: number;
        timestamp: number;
        type: 'BULLISH' | 'BEARISH';
    }>;
    fairValueGaps: Array<{
        upper: number;
        lower: number;
        timestamp: number;
        filled: boolean;
        fillProbability: number;
    }>;
    breakOfStructure: {
        detected: boolean;
        type: 'BULLISH_BOS' | 'BEARISH_BOS';
        strength: number;
        displacement: number;
    };
}
export interface ElliottWaveFeatures {
    currentWave: {
        type: 'IMPULSE' | 'CORRECTIVE';
        wave: string;
        degree: 'MINUTE' | 'MINOR' | 'INTERMEDIATE' | 'PRIMARY';
    };
    completionProbability: number;
    nextExpectedDirection: 'UP' | 'DOWN' | 'SIDEWAYS';
    waveStructure: Array<{
        wave: string;
        start: number;
        end: number;
        price: number;
        timestamp: number;
    }>;
}
export interface HarmonicFeatures {
    patterns: Array<{
        type: 'GARTLEY' | 'BAT' | 'BUTTERFLY' | 'CRAB' | 'ABCD';
        points: {
            X: {
                price: number;
                timestamp: number;
            };
            A: {
                price: number;
                timestamp: number;
            };
            B: {
                price: number;
                timestamp: number;
            };
            C: {
                price: number;
                timestamp: number;
            };
            D?: {
                price: number;
                timestamp: number;
            };
        };
        fibonacciLevels: Array<{
            level: number;
            price: number;
            type: 'RETRACEMENT' | 'EXTENSION';
        }>;
        prz: {
            upper: number;
            lower: number;
            confluence: number;
        };
        completionProbability: number;
        reliabilityScore: number;
    }>;
}
export declare class FeatureEngineering {
    private static instance;
    private logger;
    private constructor();
    static getInstance(): FeatureEngineering;
    extractAllFeatures(marketData: MarketData[]): number[];
    private extractPriceFeatures;
    calculateTechnicalIndicators(data: MarketData[]): TechnicalIndicators;
    private calculateSMA;
    private calculateEMA;
    private calculateRSI;
    private calculateMACD;
    private calculateBollingerBands;
    private calculateATR;
    private calculateOBV;
    private encodeTechnicalIndicators;
    extractSMCFeatures(data: MarketData[]): SMCFeatures;
    private detectLiquidityZones;
    private detectOrderBlocks;
    private detectFairValueGaps;
    private detectBreakOfStructure;
    private encodeSMCFeatures;
    extractElliottWaveFeatures(data: MarketData[]): ElliottWaveFeatures;
    private analyzeWaveStructure;
    private encodeElliottWaveFeatures;
    extractHarmonicFeatures(data: MarketData[]): HarmonicFeatures;
    private detectHarmonicPatterns;
    private findPivotPoints;
    private calculateFibonacciLevels;
    private encodeHarmonicFeatures;
    private extractRegimeFeatures;
}
