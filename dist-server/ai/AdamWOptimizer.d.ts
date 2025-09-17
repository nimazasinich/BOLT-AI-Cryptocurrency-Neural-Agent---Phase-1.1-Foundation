export interface AdamWConfig {
    learningRate: number;
    beta1: number;
    beta2: number;
    weightDecay: number;
    epsilon: number;
    amsgrad: boolean;
}
export interface OptimizerState {
    step: number;
    momentum: number[][][];
    velocity: number[][][];
    maxVelocity?: number[][][];
}
export declare class AdamWOptimizer {
    private static instance;
    private logger;
    private config;
    private constructor();
    static getInstance(): AdamWOptimizer;
    updateConfig(config: Partial<AdamWConfig>): void;
    /**
     * Initialize optimizer state for given parameter shapes
     */
    initializeState(parameterShapes: Array<[number, number]>): OptimizerState;
    /**
     * Perform AdamW optimization step with decoupled weight decay
     */
    step(parameters: number[][][], gradients: number[][][], state: OptimizerState): {
        updatedParameters: number[][][];
        updatedState: OptimizerState;
        stepInfo: {
            step: number;
            biasCorrection1: number;
            biasCorrection2: number;
            effectiveLR: number;
        };
    };
    /**
     * Verify decoupled weight decay implementation
     */
    verifyDecoupledWeightDecay(): {
        passed: boolean;
        testResults: {
            withoutWeightDecay: number;
            withWeightDecay: number;
            expectedDifference: number;
            actualDifference: number;
            isDecoupled: boolean;
        };
    };
}
