import { Logger } from '../core/Logger.js';
export var InitializationMode;
(function (InitializationMode) {
    InitializationMode["UNIFORM"] = "uniform";
    InitializationMode["NORMAL"] = "normal";
})(InitializationMode || (InitializationMode = {}));
export class XavierInitializer {
    static instance;
    logger = Logger.getInstance();
    constructor() { }
    static getInstance() {
        if (!XavierInitializer.instance) {
            XavierInitializer.instance = new XavierInitializer();
        }
        return XavierInitializer.instance;
    }
    /**
     * Xavier/Glorot Uniform Initialization
     * Weights are sampled from U(-limit, limit) where limit = gain * sqrt(6 / (fan_in + fan_out))
     */
    initializeUniform(config) {
        const { gain, fanIn, fanOut } = config;
        const limit = gain * Math.sqrt(6.0 / (fanIn + fanOut));
        const weights = [];
        for (let i = 0; i < fanOut; i++) {
            weights[i] = [];
            for (let j = 0; j < fanIn; j++) {
                weights[i][j] = (Math.random() * 2 - 1) * limit;
            }
        }
        this.logger.info('Xavier uniform initialization completed', {
            fanIn,
            fanOut,
            gain,
            limit: limit.toFixed(6),
            variance: this.calculateVariance(weights)
        });
        return weights;
    }
    /**
     * Xavier/Glorot Normal Initialization
     * Weights are sampled from N(0, std^2) where std = gain * sqrt(2 / (fan_in + fan_out))
     */
    initializeNormal(config) {
        const { gain, fanIn, fanOut } = config;
        const std = gain * Math.sqrt(2.0 / (fanIn + fanOut));
        const weights = [];
        for (let i = 0; i < fanOut; i++) {
            weights[i] = [];
            for (let j = 0; j < fanIn; j++) {
                weights[i][j] = this.normalRandom() * std;
            }
        }
        this.logger.info('Xavier normal initialization completed', {
            fanIn,
            fanOut,
            gain,
            std: std.toFixed(6),
            variance: this.calculateVariance(weights)
        });
        return weights;
    }
    /**
     * Initialize weights based on layer type and configuration
     */
    initializeLayer(layerType, inputSize, outputSize, gain = 1.0) {
        const config = {
            mode: InitializationMode.UNIFORM,
            gain,
            fanIn: inputSize,
            fanOut: outputSize
        };
        // Adjust gain based on layer type
        switch (layerType) {
            case 'dense':
                config.gain = gain;
                break;
            case 'lstm':
                config.gain = gain * 0.8; // Slightly reduced for LSTM stability
                break;
            case 'conv':
                config.gain = gain * 1.2; // Slightly increased for conv layers
                break;
        }
        return this.initializeUniform(config);
    }
    /**
     * Verify gradient balance across layer depths
     */
    verifyGradientBalance(layerWeights) {
        const variances = layerWeights.map(weights => this.calculateVariance(weights));
        const varianceRatios = [];
        const recommendations = [];
        for (let i = 1; i < variances.length; i++) {
            const ratio = variances[i] / variances[i - 1];
            varianceRatios.push(ratio);
        }
        const avgRatio = varianceRatios.reduce((sum, ratio) => sum + ratio, 0) / varianceRatios.length;
        const isBalanced = avgRatio > 0.5 && avgRatio < 2.0;
        if (!isBalanced) {
            if (avgRatio < 0.5) {
                recommendations.push('Gradients may vanish - consider increasing initialization gain');
            }
            else {
                recommendations.push('Gradients may explode - consider decreasing initialization gain');
            }
        }
        this.logger.info('Gradient balance verification', {
            layerCount: layerWeights.length,
            variances: variances.map(v => v.toFixed(6)),
            avgVarianceRatio: avgRatio.toFixed(3),
            isBalanced,
            recommendations
        });
        return { isBalanced, varianceRatios, recommendations };
    }
    normalRandom() {
        // Box-Muller transform for normal distribution
        let u = 0, v = 0;
        while (u === 0)
            u = Math.random(); // Converting [0,1) to (0,1)
        while (v === 0)
            v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }
    calculateVariance(weights) {
        const flatWeights = weights.flat();
        const mean = flatWeights.reduce((sum, w) => sum + w, 0) / flatWeights.length;
        const variance = flatWeights.reduce((sum, w) => sum + Math.pow(w - mean, 2), 0) / flatWeights.length;
        return variance;
    }
}
