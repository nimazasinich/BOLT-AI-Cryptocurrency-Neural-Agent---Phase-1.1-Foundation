export declare enum InitializationMode {
    UNIFORM = "uniform",
    NORMAL = "normal"
}
export interface InitializationConfig {
    mode: InitializationMode;
    gain: number;
    fanIn: number;
    fanOut: number;
}
export declare class XavierInitializer {
    private static instance;
    private logger;
    private constructor();
    static getInstance(): XavierInitializer;
    /**
     * Xavier/Glorot Uniform Initialization
     * Weights are sampled from U(-limit, limit) where limit = gain * sqrt(6 / (fan_in + fan_out))
     */
    initializeUniform(config: InitializationConfig): number[][];
    /**
     * Xavier/Glorot Normal Initialization
     * Weights are sampled from N(0, std^2) where std = gain * sqrt(2 / (fan_in + fan_out))
     */
    initializeNormal(config: InitializationConfig): number[][];
    /**
     * Initialize weights based on layer type and configuration
     */
    initializeLayer(layerType: 'dense' | 'lstm' | 'conv', inputSize: number, outputSize: number, gain?: number): number[][];
    /**
     * Verify gradient balance across layer depths
     */
    verifyGradientBalance(layerWeights: number[][][]): {
        isBalanced: boolean;
        varianceRatios: number[];
        recommendations: string[];
    };
    private normalRandom;
    private calculateVariance;
}
