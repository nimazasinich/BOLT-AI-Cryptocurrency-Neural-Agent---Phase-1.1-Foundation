import { Logger } from '../core/Logger.js';
import { XavierInitializer } from './XavierInitializer.js';
import { StableActivations } from './StableActivations.js';
import { NetworkArchitectures, NetworkConfig } from './NetworkArchitectures.js';
import { GradientClipper } from './GradientClipper.js';
import { AdamWOptimizer, OptimizerState } from './AdamWOptimizer.js';
import { LearningRateScheduler, SchedulerState } from './LearningRateScheduler.js';
import { InstabilityWatchdog, WatchdogState } from './InstabilityWatchdog.js';
import { ExperienceBuffer, Experience } from './ExperienceBuffer.js';
import { ExplorationStrategies, ExplorationState } from './ExplorationStrategies.js';
import { TrainingMetrics } from '../types/index.js';

export interface TrainingConfig {
  batchSize: number;
  epochs: number;
  validationSplit: number;
  earlyStoppingPatience: number;
  checkpointInterval: number;
  logInterval: number;
}

export interface TrainingState {
  epoch: number;
  step: number;
  bestValidationLoss: number;
  patienceCounter: number;
  isTraining: boolean;
  startTime: number;
}

export class TrainingEngine {
  private static instance: TrainingEngine;
  private logger = Logger.getInstance();
  private initializer = XavierInitializer.getInstance();
  private activations = StableActivations.getInstance();
  private architectures = NetworkArchitectures.getInstance();
  private clipper = GradientClipper.getInstance();
  private optimizer = AdamWOptimizer.getInstance();
  private scheduler = LearningRateScheduler.getInstance();
  private watchdog = InstabilityWatchdog.getInstance();
  private experienceBuffer = ExperienceBuffer.getInstance();
  private exploration = ExplorationStrategies.getInstance();

  private config: TrainingConfig = {
    batchSize: 32,
    epochs: 1000,
    validationSplit: 0.2,
    earlyStoppingPatience: 50,
    checkpointInterval: 100,
    logInterval: 10
  };

  private networkConfig: NetworkConfig | null = null;
  private parameters: number[][][] = [];
  private optimizerState: OptimizerState | null = null;
  private schedulerState: SchedulerState | null = null;
  private watchdogState: WatchdogState | null = null;
  private explorationState: ExplorationState | null = null;
  private trainingState: TrainingState | null = null;

  private constructor() {}

  static getInstance(): TrainingEngine {
    if (!TrainingEngine.instance) {
      TrainingEngine.instance = new TrainingEngine();
    }
    return TrainingEngine.instance;
  }

  updateConfig(config: Partial<TrainingConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.info('Training engine config updated', this.config);
  }

  async initializeNetwork(architecture: 'lstm' | 'cnn' | 'attention' | 'hybrid', inputFeatures: number, outputSize: number): Promise<void> {
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
      const parameterShapes: Array<[number, number]> = weights.map(layer => [layer.length, layer[0].length]);
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
    } catch (error) {
      this.logger.error('Failed to initialize network', {}, error as Error);
      throw error;
    }
  }

  async trainStep(experiences: Experience[]): Promise<TrainingMetrics> {
    if (!this.networkConfig || !this.optimizerState || !this.schedulerState || !this.watchdogState || !this.trainingState) {
      throw new Error('Training engine not initialized');
    }

    try {
      this.trainingState.step += 1;

      // Forward pass simulation (would be actual neural network in production)
      const { loss, gradients } = this.simulateForwardBackward(experiences);

      // Check for instability
      const stabilityCheck = this.watchdog.checkStability(
        this.trainingState.step,
        this.parameters,
        gradients,
        loss,
        this.optimizerState,
        this.watchdogState
      );

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
      const metrics: TrainingMetrics = {
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
    } catch (error) {
      this.logger.error('Training step failed', { step: this.trainingState.step }, error as Error);
      throw error;
    }
  }

  private simulateForwardBackward(experiences: Experience[]): { loss: number; gradients: number[][][] } {
    // Simulate forward pass and loss calculation
    const predictions = experiences.map(() => Math.random());
    const targets = experiences.map(exp => exp.reward > 0 ? 1 : 0);
    
    // Calculate MSE loss
    const loss = predictions.reduce((sum, pred, i) => sum + Math.pow(pred - targets[i], 2), 0) / predictions.length;

    // Simulate gradients (would be actual backpropagation in production)
    const gradients: number[][][] = this.parameters.map(layer =>
      layer.map(row =>
        row.map(() => (Math.random() - 0.5) * 0.01) // Small random gradients
      )
    );

    return { loss, gradients };
  }

  private calculateDirectionalAccuracy(experiences: Experience[]): number {
    // Simulate directional accuracy calculation
    let correct = 0;
    for (const exp of experiences) {
      const predicted = Math.random() > 0.5 ? 1 : -1;
      const actual = exp.reward > 0 ? 1 : -1;
      if (predicted === actual) correct++;
    }
    return correct / experiences.length;
  }

  private calculateClassificationAccuracy(experiences: Experience[]): number {
    // Simulate classification accuracy
    return 0.6 + Math.random() * 0.2; // 60-80% accuracy simulation
  }

  async trainEpoch(): Promise<TrainingMetrics[]> {
    if (!this.trainingState) {
      throw new Error('Training engine not initialized');
    }

    this.trainingState.epoch += 1;
    this.trainingState.isTraining = true;
    this.trainingState.startTime = Date.now();

    const epochMetrics: TrainingMetrics[] = [];

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
      } else {
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
    } catch (error) {
      this.logger.error('Epoch training failed', { epoch: this.trainingState.epoch }, error as Error);
      throw error;
    } finally {
      this.trainingState.isTraining = false;
    }
  }

  private calculateAverageMetrics(metrics: TrainingMetrics[]): TrainingMetrics {
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

  shouldStopEarly(): boolean {
    return this.trainingState ? this.trainingState.patienceCounter >= this.config.earlyStoppingPatience : false;
  }

  getTrainingState(): TrainingState | null {
    return this.trainingState;
  }

  isTraining(): boolean {
    return this.trainingState?.isTraining || false;
  }
}