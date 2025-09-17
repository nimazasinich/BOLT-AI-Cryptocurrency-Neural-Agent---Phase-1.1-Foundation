export interface LayerConfig {
    type: 'dense' | 'lstm' | 'cnn' | 'attention';
    inputSize: number;
    outputSize: number;
    activation: 'leakyRelu' | 'sigmoid' | 'tanh' | 'relu' | 'softmax';
    dropout?: number;
    batchNorm?: boolean;
}
export interface NetworkConfig {
    layers: LayerConfig[];
    inputFeatures: number;
    outputSize: number;
    architecture: 'lstm' | 'cnn' | 'attention' | 'hybrid';
}
export declare class NetworkArchitectures {
    private static instance;
    private logger;
    private initializer;
    private activations;
    private constructor();
    static getInstance(): NetworkArchitectures;
    /**
     * Create LSTM network for time-series sequence modeling
     */
    createLSTMNetwork(inputFeatures: number, sequenceLength: number, hiddenSizes: number[], outputSize: number): NetworkConfig;
    /**
     * Create CNN network for chart pattern detection
     */
    createCNNNetwork(inputHeight: number, inputWidth: number, channels: number, outputSize: number): NetworkConfig;
    /**
     * Create Attention network for feature importance weighting
     */
    createAttentionNetwork(inputFeatures: number, attentionHeads: number, hiddenSize: number, outputSize: number): NetworkConfig;
    /**
     * Create hybrid network combining LSTM, CNN, and Attention
     */
    createHybridNetwork(inputFeatures: number, sequenceLength: number, outputSize: number): NetworkConfig;
    /**
     * Initialize all network weights using Xavier initialization
     */
    initializeNetwork(config: NetworkConfig): {
        weights: number[][][];
        biases: number[][];
    };
    private getGainForActivation;
}
