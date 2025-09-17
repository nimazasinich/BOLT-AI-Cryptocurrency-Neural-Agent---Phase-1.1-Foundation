import { Experience } from './ExperienceBuffer.js';
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
export declare class TrainingEngine {
    private static instance;
    private logger;
    private initializer;
    private activations;
    private architectures;
    private clipper;
    private optimizer;
    private scheduler;
    private watchdog;
    private experienceBuffer;
    private exploration;
    private config;
    private networkConfig;
    private parameters;
    private optimizerState;
    private schedulerState;
    private watchdogState;
    private explorationState;
    private trainingState;
    private constructor();
    static getInstance(): TrainingEngine;
    updateConfig(config: Partial<TrainingConfig>): void;
    initializeNetwork(architecture: 'lstm' | 'cnn' | 'attention' | 'hybrid', inputFeatures: number, outputSize: number): Promise<void>;
    trainStep(experiences: Experience[]): Promise<TrainingMetrics>;
    private simulateForwardBackward;
    private calculateDirectionalAccuracy;
    private calculateClassificationAccuracy;
    trainEpoch(): Promise<TrainingMetrics[]>;
    private calculateAverageMetrics;
    shouldStopEarly(): boolean;
    getTrainingState(): TrainingState | null;
    isTraining(): boolean;
}
