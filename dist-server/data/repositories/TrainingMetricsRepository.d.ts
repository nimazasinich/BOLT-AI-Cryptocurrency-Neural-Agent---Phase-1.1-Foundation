import { Database } from 'better-sqlite3';
import { BaseRepository } from './BaseRepository.js';
import { TrainingMetrics } from '../../types/index.js';
interface TrainingMetricsRow {
    id: number;
    epoch: number;
    timestamp: number;
    model_version: string;
    mse: number;
    mae: number;
    r_squared: number;
    directional_accuracy: number;
    classification_accuracy: number;
    gradient_norm: number;
    learning_rate: number;
    nan_count: number;
    inf_count: number;
    reset_count: number;
    epsilon: number;
    exploration_ratio: number;
    exploitation_ratio: number;
    created_at: number;
}
export declare class TrainingMetricsRepository extends BaseRepository<TrainingMetrics> {
    constructor(database: Database);
    protected mapRowToEntity(row: TrainingMetricsRow): TrainingMetrics;
    protected mapEntityToRow(entity: TrainingMetrics): any;
    insertMetrics(metrics: TrainingMetrics, modelVersion?: string): Promise<TrainingMetrics>;
    getLatestMetrics(modelVersion?: string, limit?: number): Promise<TrainingMetrics[]>;
    getMetricsByEpochRange(startEpoch: number, endEpoch: number, modelVersion?: string): Promise<TrainingMetrics[]>;
    getBestMetrics(modelVersion?: string): Promise<TrainingMetrics | null>;
    getModelVersions(): Promise<string[]>;
    getTrainingProgress(modelVersion?: string): Promise<{
        totalEpochs: number;
        bestAccuracy: number;
        currentLearningRate: number;
        totalResets: number;
    }>;
}
export {};
