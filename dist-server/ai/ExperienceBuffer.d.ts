import { MarketData } from '../types/index.js';
export interface Experience {
    id: string;
    state: number[];
    action: number;
    reward: number;
    nextState: number[];
    terminal: boolean;
    tdError: number;
    priority: number;
    timestamp: number;
    symbol: string;
    metadata: {
        price: number;
        volume: number;
        volatility: number;
        confidence: number;
    };
}
export interface BufferConfig {
    capacity: number;
    alpha: number;
    beta: number;
    betaIncrement: number;
    epsilon: number;
    maxPriority: number;
}
export declare class ExperienceBuffer {
    private static instance;
    private logger;
    private config;
    private buffer;
    private position;
    private size;
    private priorityTree;
    private criticalEventTags;
    private constructor();
    static getInstance(): ExperienceBuffer;
    updateConfig(config: Partial<BufferConfig>): void;
    /**
     * Initialize priority tree for efficient sampling
     */
    private initializePriorityTree;
    /**
     * Add experience to buffer with priority
     */
    addExperience(experience: Omit<Experience, 'id' | 'priority' | 'tdError'>): void;
    /**
     * Sample batch of experiences using prioritized sampling
     */
    sampleBatch(batchSize: number): {
        experiences: Experience[];
        indices: number[];
        weights: number[];
    };
    /**
     * Update priorities based on TD errors
     */
    updatePriorities(indices: number[], tdErrors: number[]): void;
    /**
     * Add experiences from real market data
     */
    addMarketDataExperiences(marketData: MarketData[], actions: number[], rewards: number[]): void;
    /**
     * Tag critical market events for oversampling
     */
    private tagCriticalEvents;
    /**
     * Extract features from market data
     */
    private extractFeatures;
    /**
     * Update priority in tree structure
     */
    private updatePriority;
    /**
     * Sample index from priority tree
     */
    private sampleFromTree;
    /**
     * Generate unique experience ID
     */
    private generateExperienceId;
    /**
     * Get buffer statistics
     */
    getStatistics(): {
        size: number;
        capacity: number;
        utilization: number;
        criticalEventCount: number;
        avgPriority: number;
        priorityDistribution: {
            min: number;
            max: number;
            median: number;
        };
    };
    /**
     * Clear buffer
     */
    clear(): void;
}
