import { Logger } from '../core/Logger.js';
export class AdamWOptimizer {
    static instance;
    logger = Logger.getInstance();
    config = {
        learningRate: 0.001,
        beta1: 0.9,
        beta2: 0.999,
        weightDecay: 0.01,
        epsilon: 1e-8,
        amsgrad: false
    };
    constructor() { }
    static getInstance() {
        if (!AdamWOptimizer.instance) {
            AdamWOptimizer.instance = new AdamWOptimizer();
        }
        return AdamWOptimizer.instance;
    }
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.logger.info('AdamW optimizer config updated', this.config);
    }
    /**
     * Initialize optimizer state for given parameter shapes
     */
    initializeState(parameterShapes) {
        const momentum = [];
        const velocity = [];
        const maxVelocity = [];
        for (const [rows, cols] of parameterShapes) {
            // Initialize momentum (first moment)
            const layerMomentum = [];
            for (let i = 0; i < rows; i++) {
                layerMomentum[i] = new Array(cols).fill(0);
            }
            momentum.push(layerMomentum);
            // Initialize velocity (second moment)
            const layerVelocity = [];
            for (let i = 0; i < rows; i++) {
                layerVelocity[i] = new Array(cols).fill(0);
            }
            velocity.push(layerVelocity);
            // Initialize max velocity for AMSGrad
            if (this.config.amsgrad) {
                const layerMaxVelocity = [];
                for (let i = 0; i < rows; i++) {
                    layerMaxVelocity[i] = new Array(cols).fill(0);
                }
                maxVelocity.push(layerMaxVelocity);
            }
        }
        const state = {
            step: 0,
            momentum,
            velocity
        };
        if (this.config.amsgrad) {
            state.maxVelocity = maxVelocity;
        }
        this.logger.info('AdamW optimizer state initialized', {
            layerCount: parameterShapes.length,
            totalParameters: parameterShapes.reduce((sum, [r, c]) => sum + r * c, 0),
            amsgrad: this.config.amsgrad
        });
        return state;
    }
    /**
     * Perform AdamW optimization step with decoupled weight decay
     */
    step(parameters, gradients, state) {
        state.step += 1;
        // Bias correction terms
        const biasCorrection1 = 1 - Math.pow(this.config.beta1, state.step);
        const biasCorrection2 = 1 - Math.pow(this.config.beta2, state.step);
        const effectiveLR = this.config.learningRate * Math.sqrt(biasCorrection2) / biasCorrection1;
        const updatedParameters = [];
        for (let layerIdx = 0; layerIdx < parameters.length; layerIdx++) {
            const layerParams = parameters[layerIdx];
            const layerGrads = gradients[layerIdx];
            const layerMomentum = state.momentum[layerIdx];
            const layerVelocity = state.velocity[layerIdx];
            const layerMaxVelocity = state.maxVelocity?.[layerIdx];
            const updatedLayerParams = [];
            for (let i = 0; i < layerParams.length; i++) {
                updatedLayerParams[i] = [];
                for (let j = 0; j < layerParams[i].length; j++) {
                    const param = layerParams[i][j];
                    const grad = layerGrads[i][j];
                    // Update momentum (first moment)
                    layerMomentum[i][j] = this.config.beta1 * layerMomentum[i][j] + (1 - this.config.beta1) * grad;
                    // Update velocity (second moment)
                    layerVelocity[i][j] = this.config.beta2 * layerVelocity[i][j] + (1 - this.config.beta2) * grad * grad;
                    // Compute denominator
                    let denominator;
                    if (this.config.amsgrad && layerMaxVelocity) {
                        // AMSGrad: use maximum of current and past velocities
                        layerMaxVelocity[i][j] = Math.max(layerMaxVelocity[i][j], layerVelocity[i][j]);
                        denominator = Math.sqrt(layerMaxVelocity[i][j]) + this.config.epsilon;
                    }
                    else {
                        denominator = Math.sqrt(layerVelocity[i][j]) + this.config.epsilon;
                    }
                    // AdamW update: gradient-based update + decoupled weight decay
                    const gradientUpdate = effectiveLR * layerMomentum[i][j] / denominator;
                    const weightDecayUpdate = this.config.learningRate * this.config.weightDecay * param;
                    // Apply updates (decoupled weight decay)
                    updatedLayerParams[i][j] = param - gradientUpdate - weightDecayUpdate;
                }
            }
            updatedParameters.push(updatedLayerParams);
        }
        const stepInfo = {
            step: state.step,
            biasCorrection1,
            biasCorrection2,
            effectiveLR
        };
        this.logger.debug('AdamW optimization step completed', {
            step: state.step,
            effectiveLR: effectiveLR.toFixed(8),
            biasCorrection1: biasCorrection1.toFixed(6),
            biasCorrection2: biasCorrection2.toFixed(6)
        });
        return {
            updatedParameters,
            updatedState: state,
            stepInfo
        };
    }
    /**
     * Verify decoupled weight decay implementation
     */
    verifyDecoupledWeightDecay() {
        // Create test parameters and gradients
        const testParams = [[[1.0, 2.0], [3.0, 4.0]]];
        const testGrads = [[[0.1, 0.2], [0.3, 0.4]]];
        const paramShapes = [[2, 2]];
        // Test without weight decay
        const configWithoutDecay = { ...this.config, weightDecay: 0 };
        const tempConfig = this.config;
        this.config = configWithoutDecay;
        const stateWithoutDecay = this.initializeState(paramShapes);
        const resultWithoutDecay = this.step(testParams, testGrads, stateWithoutDecay);
        const paramWithoutDecay = resultWithoutDecay.updatedParameters[0][0][0];
        // Test with weight decay
        this.config = { ...tempConfig, weightDecay: 0.01 };
        const stateWithDecay = this.initializeState(paramShapes);
        const resultWithDecay = this.step(testParams, testGrads, stateWithDecay);
        const paramWithDecay = resultWithDecay.updatedParameters[0][0][0];
        // Restore original config
        this.config = tempConfig;
        // Calculate expected difference (should be LR * weight_decay * original_param)
        const expectedDifference = this.config.learningRate * 0.01 * testParams[0][0][0];
        const actualDifference = paramWithoutDecay - paramWithDecay;
        const isDecoupled = Math.abs(actualDifference - expectedDifference) < 1e-6;
        const testResults = {
            withoutWeightDecay: paramWithoutDecay,
            withWeightDecay: paramWithDecay,
            expectedDifference,
            actualDifference,
            isDecoupled
        };
        this.logger.info('Weight decay decoupling verification completed', {
            passed: isDecoupled,
            ...testResults
        });
        return { passed: isDecoupled, testResults };
    }
}
