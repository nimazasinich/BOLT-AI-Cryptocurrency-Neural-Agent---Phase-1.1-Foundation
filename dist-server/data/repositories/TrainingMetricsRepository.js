import { BaseRepository } from './BaseRepository.js';
export class TrainingMetricsRepository extends BaseRepository {
    constructor(database) {
        super(database, 'training_metrics');
    }
    mapRowToEntity(row) {
        return {
            epoch: row.epoch,
            timestamp: row.timestamp,
            loss: {
                mse: row.mse,
                mae: row.mae,
                rSquared: row.r_squared
            },
            accuracy: {
                directional: row.directional_accuracy,
                classification: row.classification_accuracy
            },
            gradientNorm: row.gradient_norm,
            learningRate: row.learning_rate,
            stabilityMetrics: {
                nanCount: row.nan_count,
                infCount: row.inf_count,
                resetCount: row.reset_count
            },
            explorationStats: {
                epsilon: row.epsilon,
                explorationRatio: row.exploration_ratio,
                exploitationRatio: row.exploitation_ratio
            }
        };
    }
    mapEntityToRow(entity) {
        return {
            epoch: entity.epoch,
            timestamp: entity.timestamp,
            model_version: 'v1.0', // Default version
            mse: entity.loss.mse,
            mae: entity.loss.mae,
            r_squared: entity.loss.rSquared,
            directional_accuracy: entity.accuracy.directional,
            classification_accuracy: entity.accuracy.classification,
            gradient_norm: entity.gradientNorm,
            learning_rate: entity.learningRate,
            nan_count: entity.stabilityMetrics.nanCount,
            inf_count: entity.stabilityMetrics.infCount,
            reset_count: entity.stabilityMetrics.resetCount,
            epsilon: entity.explorationStats.epsilon,
            exploration_ratio: entity.explorationStats.explorationRatio,
            exploitation_ratio: entity.explorationStats.exploitationRatio
        };
    }
    async insertMetrics(metrics, modelVersion = 'v1.0') {
        try {
            const query = `
        INSERT INTO ${this.tableName} 
        (epoch, timestamp, model_version, mse, mae, r_squared, directional_accuracy, 
         classification_accuracy, gradient_norm, learning_rate, nan_count, inf_count, 
         reset_count, epsilon, exploration_ratio, exploitation_ratio)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
            const params = [
                metrics.epoch,
                metrics.timestamp,
                modelVersion,
                metrics.loss.mse,
                metrics.loss.mae,
                metrics.loss.rSquared,
                metrics.accuracy.directional,
                metrics.accuracy.classification,
                metrics.gradientNorm,
                metrics.learningRate,
                metrics.stabilityMetrics.nanCount,
                metrics.stabilityMetrics.infCount,
                metrics.stabilityMetrics.resetCount,
                metrics.explorationStats.epsilon,
                metrics.explorationStats.explorationRatio,
                metrics.explorationStats.exploitationRatio
            ];
            this.executeStatement(query, params);
            this.logger.info('Training metrics inserted', {
                epoch: metrics.epoch,
                modelVersion,
                mse: metrics.loss.mse,
                directionalAccuracy: metrics.accuracy.directional
            });
            return metrics;
        }
        catch (error) {
            this.logger.error('Failed to insert training metrics', {
                epoch: metrics.epoch,
                modelVersion
            }, error);
            throw error;
        }
    }
    async getLatestMetrics(modelVersion, limit = 100) {
        try {
            let query = `SELECT * FROM ${this.tableName}`;
            const params = [];
            if (modelVersion) {
                query += ` WHERE model_version = ?`;
                params.push(modelVersion);
            }
            query += ` ORDER BY timestamp DESC LIMIT ?`;
            params.push(limit);
            const rows = this.executeQuery(query, params);
            return rows.map(row => this.mapRowToEntity(row));
        }
        catch (error) {
            this.logger.error('Failed to get latest training metrics', {
                modelVersion,
                limit
            }, error);
            throw error;
        }
    }
    async getMetricsByEpochRange(startEpoch, endEpoch, modelVersion) {
        try {
            let query = `
        SELECT * FROM ${this.tableName} 
        WHERE epoch >= ? AND epoch <= ?
      `;
            const params = [startEpoch, endEpoch];
            if (modelVersion) {
                query += ` AND model_version = ?`;
                params.push(modelVersion);
            }
            query += ` ORDER BY epoch ASC`;
            const rows = this.executeQuery(query, params);
            return rows.map(row => this.mapRowToEntity(row));
        }
        catch (error) {
            this.logger.error('Failed to get metrics by epoch range', {
                startEpoch,
                endEpoch,
                modelVersion
            }, error);
            throw error;
        }
    }
    async getBestMetrics(modelVersion) {
        try {
            let query = `
        SELECT * FROM ${this.tableName}
      `;
            const params = [];
            if (modelVersion) {
                query += ` WHERE model_version = ?`;
                params.push(modelVersion);
            }
            query += ` ORDER BY directional_accuracy DESC, mse ASC LIMIT 1`;
            const row = this.executeQuerySingle(query, params);
            return row ? this.mapRowToEntity(row) : null;
        }
        catch (error) {
            this.logger.error('Failed to get best metrics', { modelVersion }, error);
            throw error;
        }
    }
    async getModelVersions() {
        try {
            const query = `
        SELECT DISTINCT model_version 
        FROM ${this.tableName} 
        ORDER BY model_version DESC
      `;
            const rows = this.executeQuery(query);
            return rows.map(row => row.model_version);
        }
        catch (error) {
            this.logger.error('Failed to get model versions', {}, error);
            throw error;
        }
    }
    async getTrainingProgress(modelVersion) {
        try {
            let query = `
        SELECT 
          COUNT(*) as total_epochs,
          MAX(directional_accuracy) as best_accuracy,
          MAX(learning_rate) as current_learning_rate,
          MAX(reset_count) as total_resets
        FROM ${this.tableName}
      `;
            const params = [];
            if (modelVersion) {
                query += ` WHERE model_version = ?`;
                params.push(modelVersion);
            }
            const result = this.executeQuerySingle(query, params);
            return {
                totalEpochs: result?.total_epochs || 0,
                bestAccuracy: result?.best_accuracy || 0,
                currentLearningRate: result?.current_learning_rate || 0,
                totalResets: result?.total_resets || 0
            };
        }
        catch (error) {
            this.logger.error('Failed to get training progress', { modelVersion }, error);
            throw error;
        }
    }
}
