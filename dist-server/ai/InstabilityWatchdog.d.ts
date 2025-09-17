export interface WatchdogConfig {
    checkInterval: number;
    nanThreshold: number;
    infThreshold: number;
    lossThreshold: number;
    gradientThreshold: number;
    resetLRFactor: number;
    maxResets: number;
}
export interface WatchdogState {
    lastCheckStep: number;
    resetCount: number;
    totalNaNDetected: number;
    totalInfDetected: number;
    lastStableCheckpoint: {
        step: number;
        parameters: number[][][];
        optimizerState: any;
        loss: number;
    } | null;
    resetHistory: Array<{
        step: number;
        cause: string;
        lossValue: number;
        gradientNorm: number;
        nanCount: number;
        infCount: number;
    }>;
}
export declare class InstabilityWatchdog {
    private static instance;
    private logger;
    private config;
    private constructor();
    static getInstance(): InstabilityWatchdog;
    updateConfig(config: Partial<WatchdogConfig>): void;
    /**
     * Initialize watchdog state
     */
    initializeState(): WatchdogState;
    /**
     * Check for numerical instability and handle resets
     */
    checkStability(currentStep: number, parameters: number[][][], gradients: number[][][], loss: number, optimizerState: any, state: WatchdogState): {
        isStable: boolean;
        shouldReset: boolean;
        resetCause?: string;
        newLRFactor?: number;
        restoredParameters?: number[][][];
        restoredOptimizerState?: any;
        updatedState: WatchdogState;
    };
    /**
     * Count NaN and Inf values in parameters and gradients
     */
    private countNonFiniteValues;
    /**
     * Calculate gradient norm
     */
    private calculateGradientNorm;
    /**
     * Deep copy parameters for checkpoint
     */
    private deepCopyParameters;
    /**
     * Deep copy optimizer state for checkpoint
     */
    private deepCopyOptimizerState;
    /**
     * Test instability detection with artificial instability
     */
    testInstabilityDetection(): {
        passed: boolean;
        testResults: Array<{
            testName: string;
            shouldDetect: boolean;
            wasDetected: boolean;
            resetCause?: string;
            passed: boolean;
        }>;
    };
    /**
     * Get watchdog statistics
     */
    getStatistics(state: WatchdogState): {
        resetCount: number;
        totalNaNDetected: number;
        totalInfDetected: number;
        resetHistory: typeof state.resetHistory;
        hasStableCheckpoint: boolean;
    };
}
