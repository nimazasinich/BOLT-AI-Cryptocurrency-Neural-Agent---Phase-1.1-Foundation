import { EncryptedDatabase } from './EncryptedDatabase.js';
import { MarketData, TrainingMetrics, Opportunity } from '../types/index.js';
import { Logger } from '../core/Logger.js';

export class Database {
  private static instance: Database;
  private encryptedDb: EncryptedDatabase;
  private logger = Logger.getInstance();

  private constructor() {
    this.encryptedDb = EncryptedDatabase.getInstance();
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async initialize(): Promise<void> {
    await this.encryptedDb.initialize();
    this.logger.info('Database initialized successfully');
  }

  // Market Data Methods
  async insertMarketData(data: MarketData): Promise<void> {
    if (!this.encryptedDb.marketData) {
      throw new Error('Market data repository not initialized');
    }
    await this.encryptedDb.marketData.insertOrUpdate(data);
  }

  async getMarketData(symbol: string, interval: string, limit: number = 1000): Promise<MarketData[]> {
    if (!this.encryptedDb.marketData) {
      throw new Error('Market data repository not initialized');
    }
    return this.encryptedDb.marketData.findBySymbolAndInterval(symbol, interval, limit);
  }

  // Training Metrics Methods
  async insertTrainingMetrics(metrics: TrainingMetrics): Promise<void> {
    if (!this.encryptedDb.trainingMetrics) {
      throw new Error('Training metrics repository not initialized');
    }
    await this.encryptedDb.trainingMetrics.insertMetrics(metrics);
  }

  async getLatestTrainingMetrics(limit: number = 100): Promise<TrainingMetrics[]> {
    if (!this.encryptedDb.trainingMetrics) {
      throw new Error('Training metrics repository not initialized');
    }
    return this.encryptedDb.trainingMetrics.getLatestMetrics(undefined, limit);
  }

  // Opportunity Methods
  async insertOpportunity(opportunity: Opportunity): Promise<void> {
    // This would use an OpportunityRepository when implemented
    this.logger.warn('Opportunity insertion not yet implemented with new repository pattern');
  }

  async getActiveOpportunities(): Promise<Opportunity[]> {
    // This would use an OpportunityRepository when implemented
    this.logger.warn('Active opportunities retrieval not yet implemented with new repository pattern');
    return [];
  }

  async close(): Promise<void> {
    await this.encryptedDb.close();
  }

  async healthCheck() {
    return this.encryptedDb.healthCheck();
  }

  async backup(backupPath?: string): Promise<string> {
    return this.encryptedDb.backup(backupPath);
  }
}