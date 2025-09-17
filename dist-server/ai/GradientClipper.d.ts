export interface GradientClipConfig {
    maxNorm: number;
    normType: 'l2' | 'l1' | 'inf';
    errorIfNonFinite: boolean;
}
export declare class GradientClipper {
    private static instance;
    private logger;
    private config;
    private constructor();
    static getInstance(): GradientClipper;
    updateConfig(config: Partial<GradientClipConfig>): void;
    /**
     * Clip gradients by global norm to prevent exploding gradients
     */
    clipGradientsByGlobalNorm(gradients: number[][][]): {
        clippedGradients: number[][][];
        globalNorm: number;
        wasClipped: boolean;
        scaleFactor: number;
    };
    /**
     * Calculate global norm of gradients
     */
    private calculateGlobalNorm;
    /**
     * Test gradient clipping with extreme values
     */
    testExplodingGradients(): {
        passed: boolean;
        testResults: Array<{
            testName: string;
            originalNorm: number;
            clippedNorm: number;
            wasClipped: boolean;
            passed: boolean;
        }>;
    };
}
