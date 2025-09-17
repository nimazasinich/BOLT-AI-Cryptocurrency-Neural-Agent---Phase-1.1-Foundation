import { Logger } from '../core/Logger.js';
import { XavierInitializer } from './XavierInitializer.js';
import { StableActivations } from './StableActivations.js';
import { NetworkArchitectures } from './NetworkArchitectures.js';
import { GradientClipper } from './GradientClipper.js';
import { AdamWOptimizer } from './AdamWOptimizer.js';
import { LearningRateScheduler } from './LearningRateScheduler.js';
import { InstabilityWatchdog } from './InstabilityWatchdog.js';
import { ExperienceBuffer } from './ExperienceBuffer.js';
import { ExplorationStrategies } from './ExplorationStrategies.js';
export class TrainingEngine {
    static instance;
    logger = Logger.getInstance();
    initializer = XavierInitializer.getInstance();
    activations = StableActivations.getInstance();
    architectures = NetworkArchitectures.getInstance();
    clipper = GradientClipper.getInstance();
    optimizer = AdamWOptimizer.getInstance();
    scheduler = LearningRateScheduler.getInstance();
    watchdog = InstabilityWatchdog.getInstance();
    experienceBuffer = ExperienceBuffer.getInstance();
    exploration = ExplorationStrategies.getInstance();
    config = {
        batchSize: 32,
        epochs: 1000,
        validationSplit: 0.2,
        earlyStoppingPatience: 50,
        checkpointInterval: 100,
        logInterval: 10
    };
    networkConfig = null;
    parameters = [];
    optimizerState = null;
    schedulerState = null;
    watchdogState = null;
    explorationState = null;
    trainingState = null;
    constructor() { }
    static getInstance() {
        if (!TrainingEngine.instance) {
            TrainingEngine.instance = new TrainingEngine();
        }
        return TrainingEngine.instance;
    }
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.logger.info('Training engine config updated', this.config);
    }
    async initializeNetwork(architecture, inputFeatures, outputSize) {
        try {
            // Create network architecture
            switch (architecture) {
                case 'lstm':
                    this.networkConfig = this.architectures.createLSTMNetwork(inputFeatures, 60, [128, 64], outputSize);
                    break;
                case 'cnn':
                    this.networkConfig = this.architectures.createCNNNetwork(32, 32, 1, outputSize);
                    break;
                case 'attention':
                    this.networkConfig = this.architectures.createAttentionNetwork(inputFeatures, 8, 256, outputSize);
                    break;
                case 'hybrid':
                    this.networkConfig = this.architectures.createHybridNetwork(inputFeatures, 60, outputSize);
                    break;
            }
            // Initialize network weights
            const { weights } = this.architectures.initializeNetwork(this.networkConfig);
            this.parameters = weights;
            // Initialize optimizer state
            const parameterShapes = weights.map(layer => [layer.length, layer[0].length]);
            this.optimizerState = this.optimizer.initializeState(parameterShapes);
            // Initialize other states
            this.schedulerState = this.scheduler.initializeState();
            this.watchdogState = this.watchdog.initializeState();
            this.explorationState = this.exploration.initializeState();
            this.trainingState = {
                epoch: 0,
                step: 0,
                bestValidationLoss: Infinity,
                patienceCounter: 0,
                isTraining: false,
                startTime: 0
            };
            this.logger.info('Training engine initialized', {
                architecture,
                inputFeatures,
                outputSize,
                totalParameters: parameterShapes.reduce((sum, [r, c]) => sum + r * c, 0)
            });
        }
        catch (error) {
            this.logger.error('Failed to initialize network', {}, error);
            throw error;
        }
    }
    async trainStep(experiences) {
        if (!this.networkConfig || !this.optimizerState || !this.schedulerState || !this.watchdogState || !this.trainingState) {
            throw new Error('Training engine not initialized');
        }
        try {
            this.trainingState.step += 1;
            // Forward pass simulation (would be actual neural network in production)
            const { loss, gradients } = this.simulateForwardBackward(experiences);
            // Check for instability
            const stabilityCheck = this.watchdog.checkStability(this.trainingState.step, this.parameters, gradients, loss, this.optimizerState, this.watchdogState);
            if (stabilityCheck.shouldReset) {
                this.logger.warn('Training instability detected, performing reset', {
                    cause: stabilityCheck.resetCause,
                    step: this.trainingState.step
                });
                if (stabilityCheck.restoredParameters) {
                    this.parameters = stabilityCheck.restoredParameters;
                }
                if (stabilityCheck.restoredOptimizerState) {
                    this.optimizerState = stabilityCheck.restoredOptimizerState;
                }
                if (stabilityCheck.newLRFactor) {
                    this.scheduler.updateConfig({
                        initialLR: this.scheduler.getCurrentLR(this.schedulerState) * stabilityCheck.newLRFactor
                    });
                }
            }
            // Clip gradients
            const clippingResult = this.clipper.clipGradientsByGlobalNorm(gradients);
            // Update learning rate
            const lrResult = this.scheduler.step(this.schedulerState, loss);
            // Update optimizer learning rate
            this.optimizer.updateConfig({ learningRate: lrResult.newLR });
            // Optimizer step
            const optimizerResult = this.optimizer.step(this.parameters, clippingResult.clippedGradients, this.optimizerState);
            this.parameters = optimizerResult.updatedParameters;
            // Calculate metrics
            const metrics = {
                epoch: this.trainingState.epoch,
                timestamp: Date.now(),
                loss: {
                    mse: loss,
                    mae: Math.abs(loss),
                    rSquared: Math.max(0, 1 - loss / 1.0) // Simplified R²
                },
                accuracy: {
                    directional: this.calculateDirectionalAccuracy(experiences),
                    classification: this.calculateClassificationAccuracy(experiences)
                },
                gradientNorm: clippingResult.globalNorm,
                learningRate: lrResult.newLR,
                stabilityMetrics: {
                    nanCount: stabilityCheck.shouldReset ? 1 : 0,
                    infCount: 0,
                    resetCount: this.watchdog.getStatistics(this.watchdogState).resetCount
                },
                explorationStats: {
                    epsilon: this.exploration.getStatistics(this.explorationState).currentEpsilon,
                    explorationRatio: this.exploration.getStatistics(this.explorationState).explorationRatio,
                    exploitationRatio: this.exploration.getStatistics(this.explorationState).exploitationRatio
                }
            };
            // Log metrics
            if (this.trainingState.step % this.config.logInterval === 0) {
                this.logger.info('Training step completed', {
                    step: this.trainingState.step,
                    epoch: this.trainingState.epoch,
                    loss: loss.toFixed(6),
                    gradientNorm: clippingResult.globalNorm.toFixed(6),
                    learningRate: lrResult.newLR.toExponential(3),
                    wasClipped: clippingResult.wasClipped
                });
            }
            return metrics;
        }
        catch (error) {
            this.logger.error('Training step failed', { step: this.trainingState.step }, error);
            throw error;
        }
    }
    simulateForwardBackward(experiences) {
        // Simulate forward pass and loss calculation
        const predictions = experiences.map(() => Math.random());
        const targets = experiences.map(exp => exp.reward > 0 ? 1 : 0);
        // Calculate MSE loss
        const loss = predictions.reduce((sum, pred, i) => sum + Math.pow(pred - targets[i], 2), 0) / predictions.length;
        // Simulate gradients (would be actual backpropagation in production)
        const gradients = this.parameters.map(layer => layer.map(row => row.map(() => (Math.random() - 0.5) * 0.01) // Small random gradients
        ));
        return { loss, gradients };
    }
    calculateDirectionalAccuracy(experiences) {
        // Simulate directional accuracy calculation
        let correct = 0;
        for (const exp of experiences) {
            const predicted = Math.random() > 0.5 ? 1 : -1;
            const actual = exp.reward > 0 ? 1 : -1;
            if (predicted === actual)
                correct++;
        }
        return correct / experiences.length;
    }
    calculateClassificationAccuracy(experiences) {
        // Simulate classification accuracy
        return 0.6 + Math.random() * 0.2; // 60-80% accuracy simulation
    }
    async trainEpoch() {
        if (!this.trainingState) {
            throw new Error('Training engine not initialized');
        }
        this.trainingState.epoch += 1;
        this.trainingState.isTraining = true;
        this.trainingState.startTime = Date.now();
        const epochMetrics = [];
        try {
            // Get training batch from experience buffer
            const bufferStats = this.experienceBuffer.getStatistics();
            if (bufferStats.size < this.config.batchSize) {
                throw new Error(`Insufficient experiences in buffer: ${bufferStats.size} < ${this.config.batchSize}`);
            }
            const stepsPerEpoch = Math.floor(bufferStats.size / this.config.batchSize);
            for (let step = 0; step < stepsPerEpoch; step++) {
                const batch = this.experienceBuffer.sampleBatch(this.config.batchSize);
                const metrics = await this.trainStep(batch.experiences);
                epochMetrics.push(metrics);
                // Update experience priorities based on TD errors (simulated)
                const tdErrors = batch.experiences.map(() => Math.random() * 0.1);
                this.experienceBuffer.updatePriorities(batch.indices, tdErrors);
            }
            // Calculate epoch average metrics
            const avgMetrics = this.calculateAverageMetrics(epochMetrics);
            // Early stopping check
            if (avgMetrics.loss.mse < this.trainingState.bestValidationLoss) {
                this.trainingState.bestValidationLoss = avgMetrics.loss.mse;
                this.trainingState.patienceCounter = 0;
            }
            else {
                this.trainingState.patienceCounter += 1;
            }
            this.logger.info('Epoch completed', {
                epoch: this.trainingState.epoch,
                avgLoss: avgMetrics.loss.mse.toFixed(6),
                avgAccuracy: avgMetrics.accuracy.directional.toFixed(3),
                patienceCounter: this.trainingState.patienceCounter,
                duration: Date.now() - this.trainingState.startTime
            });
            return epochMetrics;
        }
        catch (error) {
            this.logger.error('Epoch training failed', { epoch: this.trainingState.epoch }, error);
            throw error;
        }
        finally {
            this.trainingState.isTraining = false;
        }
    }
    calculateAverageMetrics(metrics) {
        const count = metrics.length;
        return {
            epoch: metrics[0].epoch,
            timestamp: Date.now(),
            loss: {
                mse: metrics.reduce((sum, m) => sum + m.loss.mse, 0) / count,
                mae: metrics.reduce((sum, m) => sum + m.loss.mae, 0) / count,
                rSquared: metrics.reduce((sum, m) => sum + m.loss.rSquared, 0) / count
            },
            accuracy: {
                directional: metrics.reduce((sum, m) => sum + m.accuracy.directional, 0) / count,
                classification: metrics.reduce((sum, m) => sum + m.accuracy.classification, 0) / count
            },
            gradientNorm: metrics.reduce((sum, m) => sum + m.gradientNorm, 0) / count,
            learningRate: metrics[metrics.length - 1].learningRate,
            stabilityMetrics: {
                nanCount: metrics.reduce((sum, m) => sum + m.stabilityMetrics.nanCount, 0),
                infCount: metrics.reduce((sum, m) => sum + m.stabilityMetrics.infCount, 0),
                resetCount: metrics[metrics.length - 1].stabilityMetrics.resetCount
            },
            explorationStats: metrics[metrics.length - 1].explorationStats
        };
    }
    shouldStopEarly() {
        return this.trainingState ? this.trainingState.patienceCounter >= this.config.earlyStoppingPatience : false;
    }
    getTrainingState() {
        return this.trainingState;
    }
    isTraining() {
        return this.trainingState?.isTraining || false;
    }
}
