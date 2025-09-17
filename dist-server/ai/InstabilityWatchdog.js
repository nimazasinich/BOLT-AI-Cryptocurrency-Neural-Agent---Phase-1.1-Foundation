import { Logger } from '../core/Logger.js';
export class InstabilityWatchdog {
    static instance;
    logger = Logger.getInstance();
    config = {
        checkInterval: 10,
        nanThreshold: 5,
        infThreshold: 5,
        lossThreshold: 1e6,
        gradientThreshold: 100.0,
        resetLRFactor: 0.25,
        maxResets: 5
    };
    constructor() { }
    static getInstance() {
        if (!InstabilityWatchdog.instance) {
            InstabilityWatchdog.instance = new InstabilityWatchdog();
        }
        return InstabilityWatchdog.instance;
    }
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.logger.info('Instability watchdog config updated', this.config);
    }
    /**
     * Initialize watchdog state
     */
    initializeState() {
        const state = {
            lastCheckStep: 0,
            resetCount: 0,
            totalNaNDetected: 0,
            totalInfDetected: 0,
            lastStableCheckpoint: null,
            resetHistory: []
        };
        this.logger.info('Instability watchdog initialized', {
            checkInterval: this.config.checkInterval,
            maxResets: this.config.maxResets
        });
        return state;
    }
    /**
     * Check for numerical instability and handle resets
     */
    checkStability(currentStep, parameters, gradients, loss, optimizerState, state) {
        // Only check at specified intervals
        if (currentStep - state.lastCheckStep < this.config.checkInterval) {
            return {
                isStable: true,
                shouldReset: false,
                updatedState: state
            };
        }
        state.lastCheckStep = currentStep;
        // Count NaN and Inf values
        const { nanCount, infCount } = this.countNonFiniteValues(parameters, gradients);
        state.totalNaNDetected += nanCount;
        state.totalInfDetected += infCount;
        // Calculate gradient norm
        const gradientNorm = this.calculateGradientNorm(gradients);
        // Check for instability conditions
        let shouldReset = false;
        let resetCause = '';
        if (nanCount > this.config.nanThreshold) {
            shouldReset = true;
            resetCause = `NaN values detected: ${nanCount}`;
        }
        else if (infCount > this.config.infThreshold) {
            shouldReset = true;
            resetCause = `Inf values detected: ${infCount}`;
        }
        else if (!isFinite(loss) || loss > this.config.lossThreshold) {
            shouldReset = true;
            resetCause = `Loss instability: ${loss}`;
        }
        else if (gradientNorm > this.config.gradientThreshold) {
            shouldReset = true;
            resetCause = `Gradient explosion: ${gradientNorm.toFixed(2)}`;
        }
        if (shouldReset) {
            // Check if we've exceeded max resets
            if (state.resetCount >= this.config.maxResets) {
                this.logger.error('Maximum resets exceeded, training should be stopped', {
                    resetCount: state.resetCount,
                    maxResets: this.config.maxResets
                });
                return {
                    isStable: false,
                    shouldReset: false,
                    resetCause: 'Max resets exceeded',
                    updatedState: state
                };
            }
            // Perform reset
            state.resetCount += 1;
            const newLRFactor = Math.pow(this.config.resetLRFactor, state.resetCount);
            // Record reset event
            state.resetHistory.push({
                step: currentStep,
                cause: resetCause,
                lossValue: loss,
                gradientNorm,
                nanCount,
                infCount
            });
            this.logger.warn('Numerical instability detected, performing reset', {
                step: currentStep,
                cause: resetCause,
                resetCount: state.resetCount,
                newLRFactor: newLRFactor.toFixed(4)
            });
            // Restore from checkpoint if available
            let restoredParameters = parameters;
            let restoredOptimizerState = optimizerState;
            if (state.lastStableCheckpoint) {
                restoredParameters = this.deepCopyParameters(state.lastStableCheckpoint.parameters);
                restoredOptimizerState = this.deepCopyOptimizerState(state.lastStableCheckpoint.optimizerState);
                this.logger.info('Restored from checkpoint', {
                    checkpointStep: state.lastStableCheckpoint.step,
                    checkpointLoss: state.lastStableCheckpoint.loss
                });
            }
            return {
                isStable: false,
                shouldReset: true,
                resetCause,
                newLRFactor,
                restoredParameters,
                restoredOptimizerState,
                updatedState: state
            };
        }
        else {
            // Update stable checkpoint
            state.lastStableCheckpoint = {
                step: currentStep,
                parameters: this.deepCopyParameters(parameters),
                optimizerState: this.deepCopyOptimizerState(optimizerState),
                loss
            };
            return {
                isStable: true,
                shouldReset: false,
                updatedState: state
            };
        }
    }
    /**
     * Count NaN and Inf values in parameters and gradients
     */
    countNonFiniteValues(parameters, gradients) {
        let nanCount = 0;
        let infCount = 0;
        // Check parameters
        for (const layer of parameters) {
            for (const row of layer) {
                for (const value of row) {
                    if (isNaN(value))
                        nanCount++;
                    else if (!isFinite(value))
                        infCount++;
                }
            }
        }
        // Check gradients
        for (const layer of gradients) {
            for (const row of layer) {
                for (const value of row) {
                    if (isNaN(value))
                        nanCount++;
                    else if (!isFinite(value))
                        infCount++;
                }
            }
        }
        return { nanCount, infCount };
    }
    /**
     * Calculate gradient norm
     */
    calculateGradientNorm(gradients) {
        let totalSquaredNorm = 0;
        for (const layer of gradients) {
            for (const row of layer) {
                for (const grad of row) {
                    if (isFinite(grad)) {
                        totalSquaredNorm += grad * grad;
                    }
                }
            }
        }
        return Math.sqrt(totalSquaredNorm);
    }
    /**
     * Deep copy parameters for checkpoint
     */
    deepCopyParameters(parameters) {
        return parameters.map(layer => layer.map(row => [...row]));
    }
    /**
     * Deep copy optimizer state for checkpoint
     */
    deepCopyOptimizerState(optimizerState) {
        return JSON.parse(JSON.stringify(optimizerState));
    }
    /**
     * Test instability detection with artificial instability
     */
    testInstabilityDetection() {
        const testCases = [
            {
                name: 'stable_case',
                parameters: [[[1.0, 2.0], [3.0, 4.0]]],
                gradients: [[[0.1, 0.2], [0.3, 0.4]]],
                loss: 0.5,
                shouldDetect: false
            },
            {
                name: 'nan_parameters',
                parameters: [[[NaN, 2.0], [3.0, 4.0]]],
                gradients: [[[0.1, 0.2], [0.3, 0.4]]],
                loss: 0.5,
                shouldDetect: true
            },
            {
                name: 'inf_gradients',
                parameters: [[[1.0, 2.0], [3.0, 4.0]]],
                gradients: [[[Infinity, 0.2], [0.3, 0.4]]],
                loss: 0.5,
                shouldDetect: true
            },
            {
                name: 'high_loss',
                parameters: [[[1.0, 2.0], [3.0, 4.0]]],
                gradients: [[[0.1, 0.2], [0.3, 0.4]]],
                loss: 1e7,
                shouldDetect: true
            },
            {
                name: 'exploding_gradients',
                parameters: [[[1.0, 2.0], [3.0, 4.0]]],
                gradients: [[[1000, 2000], [3000, 4000]]],
                loss: 0.5,
                shouldDetect: true
            }
        ];
        const testResults = [];
        let allPassed = true;
        for (const testCase of testCases) {
            const state = this.initializeState();
            const result = this.checkStability(100, // currentStep
            testCase.parameters, testCase.gradients, testCase.loss, {}, // optimizerState
            state);
            const wasDetected = result.shouldReset;
            const passed = wasDetected === testCase.shouldDetect;
            testResults.push({
                testName: testCase.name,
                shouldDetect: testCase.shouldDetect,
                wasDetected,
                resetCause: result.resetCause,
                passed
            });
            if (!passed) {
                allPassed = false;
            }
        }
        this.logger.info('Instability detection test completed', {
            passed: allPassed,
            testCount: testResults.length
        });
        return { passed: allPassed, testResults };
    }
    /**
     * Get watchdog statistics
     */
    getStatistics(state) {
        return {
            resetCount: state.resetCount,
            totalNaNDetected: state.totalNaNDetected,
            totalInfDetected: state.totalInfDetected,
            resetHistory: [...state.resetHistory],
            hasStableCheckpoint: state.lastStableCheckpoint !== null
        };
    }
}
