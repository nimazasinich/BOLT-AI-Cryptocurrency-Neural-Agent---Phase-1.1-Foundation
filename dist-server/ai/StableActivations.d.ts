export interface ActivationConfig {
    preClipBound: number;
    postClipBound: number;
    leakyReluSlope: number;
}
export declare class StableActivations {
    private static instance;
    private logger;
    private config;
    private constructor();
    static getInstance(): StableActivations;
    updateConfig(config: Partial<ActivationConfig>): void;
    /**
     * Stable LeakyReLU with configurable slope and clipping
     */
    leakyRelu(x: number[]): number[];
    /**
     * Stable Sigmoid with saturation handling
     */
    sigmoid(x: number[]): number[];
    /**
     * Stable Tanh with saturation handling
     */
    tanh(x: number[]): number[];
    /**
     * Stable ReLU with clipping
     */
    relu(x: number[]): number[];
    /**
     * Stable Softmax with numerical stability
     */
    softmax(x: number[]): number[];
    /**
     * Test activation functions with extreme inputs
     */
    testStability(): {
        passed: boolean;
        results: {
            [key: string]: {
                input: number[];
                output: number[];
                hasNaN: boolean;
                hasInf: boolean;
            };
        };
    };
}
