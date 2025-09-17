export interface ExplorationConfig {
    strategy: 'epsilon_greedy' | 'temperature' | 'entropy_guided';
    initialEpsilon: number;
    finalEpsilon: number;
    decaySteps: number;
    initialTemperature: number;
    finalTemperature: number;
    temperatureDecay: number;
    entropyThreshold: number;
    uncertaintyWeight: number;
}
export interface ExplorationState {
    currentStep: number;
    currentEpsilon: number;
    currentTemperature: number;
    explorationCount: number;
    exploitationCount: number;
    totalActions: number;
}
export declare class ExplorationStrategies {
    private static instance;
    private logger;
    private config;
    private constructor();
    static getInstance(): ExplorationStrategies;
    updateConfig(config: Partial<ExplorationConfig>): void;
    /**
     * Initialize exploration state
     */
    initializeState(): ExplorationState;
    /**
     * Select action based on exploration strategy
     */
    selectAction(qValues: number[], state: ExplorationState, uncertainties?: number[]): {
        action: number;
        isExploration: boolean;
        updatedState: ExplorationState;
        actionInfo: {
            strategy: string;
            epsilon?: number;
            temperature?: number;
            entropy?: number;
        };
    };
    /**
     * Epsilon-greedy action selection with decay
     */
    private epsilonGreedyAction;
    /**
     * Temperature-based softmax action selection
     */
    private temperatureBasedAction;
    /**
     * Entropy-guided exploration for uncertainty regions
     */
    private entropyGuidedAction;
    /**
     * Softmax function for probability calculation
     */
    private softmax;
    /**
     * Get exploration statistics
     */
    getStatistics(state: ExplorationState): {
        explorationRatio: number;
        exploitationRatio: number;
        currentEpsilon: number;
        currentTemperature: number;
        totalActions: number;
        decayProgress: number;
    };
    /**
     * Test exploration strategies
     */
    testExplorationStrategies(): {
        passed: boolean;
        testResults: Array<{
            strategy: string;
            explorationRatio: number;
            consistentDecay: boolean;
            validActions: boolean;
        }>;
    };
}
