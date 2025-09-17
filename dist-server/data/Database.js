import { EncryptedDatabase } from './EncryptedDatabase.js';
import { Logger } from '../core/Logger.js';
export class Database {
    static instance;
    encryptedDb;
    logger = Logger.getInstance();
    constructor() {
        this.encryptedDb = EncryptedDatabase.getInstance();
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    async initialize() {
        await this.encryptedDb.initialize();
        this.logger.info('Database initialized successfully');
    }
    // Market Data Methods
    async insertMarketData(data) {
        if (!this.encryptedDb.marketData) {
            throw new Error('Market data repository not initialized');
        }
        await this.encryptedDb.marketData.insertOrUpdate(data);
    }
    async getMarketData(symbol, interval, limit = 1000) {
        if (!this.encryptedDb.marketData) {
            throw new Error('Market data repository not initialized');
        }
        return this.encryptedDb.marketData.findBySymbolAndInterval(symbol, interval, limit);
    }
    // Training Metrics Methods
    async insertTrainingMetrics(metrics) {
        if (!this.encryptedDb.trainingMetrics) {
            throw new Error('Training metrics repository not initialized');
        }
        await this.encryptedDb.trainingMetrics.insertMetrics(metrics);
    }
    async getLatestTrainingMetrics(limit = 100) {
        if (!this.encryptedDb.trainingMetrics) {
            throw new Error('Training metrics repository not initialized');
        }
        return this.encryptedDb.trainingMetrics.getLatestMetrics(undefined, limit);
    }
    // Opportunity Methods
    async insertOpportunity(opportunity) {
        // This would use an OpportunityRepository when implemented
        this.logger.warn('Opportunity insertion not yet implemented with new repository pattern');
    }
    async getActiveOpportunities() {
        // This would use an OpportunityRepository when implemented
        this.logger.warn('Active opportunities retrieval not yet implemented with new repository pattern');
        return [];
    }
    async close() {
        await this.encryptedDb.close();
    }
    async healthCheck() {
        return this.encryptedDb.healthCheck();
    }
    async backup(backupPath) {
        return this.encryptedDb.backup(backupPath);
    }
}
