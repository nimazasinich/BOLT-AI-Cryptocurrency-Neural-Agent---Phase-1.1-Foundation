export interface LRSchedulerConfig {
    initialLR: number;
    warmupSteps: number;
    totalSteps: number;
    minLR: number;
    schedulerType: 'cosine' | 'plateau' | 'warmup_cosine' | 'warm_restarts';
    patience: number;
    factor: number;
    threshold: number;
    restartPeriod: number;
    restartMult: number;
}
export interface SchedulerState {
    currentStep: number;
    currentLR: number;
    bestMetric: number;
    plateauCounter: number;
    lastRestartStep: number;
    restartCount: number;
}
export declare class LearningRateScheduler {
    private static instance;
    private logger;
    private config;
    private constructor();
    static getInstance(): LearningRateScheduler;
    updateConfig(config: Partial<LRSchedulerConfig>): void;
    /**
     * Initialize scheduler state
     */
    initializeState(): SchedulerState;
    /**
     * Update learning rate based on scheduler type
     */
    step(state: SchedulerState, metric?: number): {
        updatedState: SchedulerState;
        newLR: number;
        schedulerInfo: {
            phase: string;
            progress: number;
            wasReduced: boolean;
            wasRestarted: boolean;
        };
    };
    private warmupCosineSchedule;
    private cosineAnnealingSchedule;
    private plateauSchedule;
    private warmRestartsSchedule;
    /**
     * Get current learning rate without stepping
     */
    getCurrentLR(state: SchedulerState): number;
    /**
     * Test scheduler progression
     */
    testSchedulerProgression(steps?: number): {
        schedulerType: string;
        lrProgression: Array<{
            step: number;
            lr: number;
            phase?: string;
        }>;
        finalLR: number;
    };
}
