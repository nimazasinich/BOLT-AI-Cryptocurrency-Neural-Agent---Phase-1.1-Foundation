import { MarketData } from '../types/index.js';
export interface BullBearPrediction {
    probabilities: {
        bull: number;
        bear: number;
        neutral: number;
    };
    confidence: number;
    action: 'LONG' | 'SHORT' | 'HOLD';
    reasoning: string[];
    features: number[];
    uncertainty: number;
}
export interface GoalConfig {
    type: 'crypto_bull_bear' | 'volatility_prediction' | 'regime_classification';
    thresholds: {
        enterLong: number;
        enterShort: number;
        abstain: number;
    };
    riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH';
}
export declare class BullBearAgent {
    private static instance;
    private logger;
    private trainingEngine;
    private exploration;
    private goalConfig;
    private isInitialized;
    private mcDropoutSamples;
    private constructor();
    static getInstance(): BullBearAgent;
    initialize(): Promise<void>;
    updateGoalConfig(config: Partial<GoalConfig>): void;
    predict(marketData: MarketData[], currentGoal?: string): Promise<BullBearPrediction>;
    private extractFeatures;
    private calculateSMA;
    private calculateATR;
    private performMCDropout;
    private simulateForwardPass;
    private calculateMeanProbabilities;
    private calculateUncertainty;
    private determineAction;
    private generateReasoning;
    trainOnMarketData(marketData: MarketData[], labels: number[]): Promise<void>;
    getModelStatistics(): {
        isInitialized: boolean;
        isTraining: boolean;
        trainingState: any;
        experienceBufferSize: number;
    };
}
