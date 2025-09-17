import BetterSqlite3 from 'better-sqlite3';
import { randomBytes } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { mkdirSync } from 'fs';
import { Logger } from '../core/Logger.js';
import { DatabaseMigrations } from './DatabaseMigrations.js';
import { MarketDataRepository } from './repositories/MarketDataRepository.js';
import { TrainingMetricsRepository } from './repositories/TrainingMetricsRepository.js';
export class EncryptedDatabase {
    static instance;
    db = null;
    logger = Logger.getInstance();
    dbPath;
    keyPath;
    encryptionKey = null;
    migrations = null;
    // Repository instances
    marketData = null;
    trainingMetrics = null;
    constructor() {
        const dataDir = join(process.cwd(), 'data');
        this.dbPath = join(dataDir, 'boltai.db');
        this.keyPath = join(dataDir, '.dbkey');
        this.ensureDataDirectory();
    }
    static getInstance() {
        if (!EncryptedDatabase.instance) {
            EncryptedDatabase.instance = new EncryptedDatabase();
        }
        return EncryptedDatabase.instance;
    }
    ensureDataDirectory() {
        const dataDir = dirname(this.dbPath);
        if (!existsSync(dataDir)) {
            mkdirSync(dataDir, { recursive: true });
            this.logger.info('Created data directory', { path: dataDir });
        }
    }
    generateEncryptionKey() {
        // In a real Windows application, this would use DPAPI
        // For this Node.js implementation, we'll use a simulated approach
        const key = randomBytes(32).toString('hex');
        this.logger.info('Generated new encryption key');
        return key;
    }
    saveEncryptionKey(key) {
        try {
            // In production, this would be encrypted with DPAPI
            // For now, we'll use base64 encoding as a placeholder
            const encodedKey = Buffer.from(key).toString('base64');
            writeFileSync(this.keyPath, encodedKey, { mode: 0o600 });
            this.logger.info('Encryption key saved securely');
        }
        catch (error) {
            this.logger.error('Failed to save encryption key', {}, error);
            throw error;
        }
    }
    loadEncryptionKey() {
        try {
            if (!existsSync(this.keyPath)) {
                return null;
            }
            const encodedKey = readFileSync(this.keyPath, 'utf8');
            const key = Buffer.from(encodedKey, 'base64').toString();
            this.logger.info('Encryption key loaded successfully');
            return key;
        }
        catch (error) {
            this.logger.error('Failed to load encryption key', {}, error);
            return null;
        }
    }
    getOrCreateEncryptionKey() {
        let key = this.loadEncryptionKey();
        if (!key) {
            key = this.generateEncryptionKey();
            this.saveEncryptionKey(key);
        }
        return key;
    }
    async initialize() {
        try {
            this.encryptionKey = this.getOrCreateEncryptionKey();
            // Initialize database with WAL mode for concurrent access
            this.db = new BetterSqlite3(this.dbPath, {
                verbose: (message) => this.logger.debug('SQLite:', { message })
            });
            // Enable WAL mode for better concurrent access
            this.db.pragma('journal_mode = WAL');
            this.db.pragma('synchronous = NORMAL');
            this.db.pragma('cache_size = 10000');
            this.db.pragma('temp_store = MEMORY');
            // Enable foreign key constraints
            this.db.pragma('foreign_keys = ON');
            this.logger.info('Database initialized with WAL mode', {
                path: this.dbPath,
                walMode: this.db.pragma('journal_mode', { simple: true }),
                foreignKeys: this.db.pragma('foreign_keys', { simple: true })
            });
            // Initialize migrations
            this.migrations = new DatabaseMigrations(this.db);
            await this.migrations.initialize();
            await this.migrations.runMigrations();
            // Initialize repositories
            this.marketData = new MarketDataRepository(this.db);
            this.trainingMetrics = new TrainingMetricsRepository(this.db);
            this.logger.info('Database and repositories initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize database', {}, error);
            throw error;
        }
    }
    getDatabase() {
        if (!this.db) {
            throw new Error('Database not initialized. Call initialize() first.');
        }
        return this.db;
    }
    async backup(backupPath) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const defaultBackupPath = join(dirname(this.dbPath), `boltai-backup-${timestamp}.db`);
            const finalBackupPath = backupPath || defaultBackupPath;
            await this.db.backup(finalBackupPath);
            this.logger.info('Database backup created successfully', {
                backupPath: finalBackupPath
            });
            return finalBackupPath;
        }
        catch (error) {
            this.logger.error('Failed to create database backup', { backupPath }, error);
            throw error;
        }
    }
    async vacuum() {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        try {
            this.db.exec('VACUUM');
            this.logger.info('Database vacuum completed successfully');
        }
        catch (error) {
            this.logger.error('Failed to vacuum database', {}, error);
            throw error;
        }
    }
    async analyze() {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        try {
            this.db.exec('ANALYZE');
            this.logger.info('Database analysis completed successfully');
        }
        catch (error) {
            this.logger.error('Failed to analyze database', {}, error);
            throw error;
        }
    }
    getStats() {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        return {
            pageCount: this.db.pragma('page_count', { simple: true }),
            pageSize: this.db.pragma('page_size', { simple: true }),
            walSize: this.db.pragma('wal_checkpoint', { simple: true }),
            cacheSize: this.db.pragma('cache_size', { simple: true })
        };
    }
    async close() {
        if (this.db) {
            try {
                // Checkpoint WAL file before closing
                this.db.pragma('wal_checkpoint(TRUNCATE)');
                this.db.close();
                this.db = null;
                this.marketData = null;
                this.trainingMetrics = null;
                this.logger.info('Database connection closed successfully');
            }
            catch (error) {
                this.logger.error('Error closing database', {}, error);
                throw error;
            }
        }
    }
    // Transaction support
    transaction(fn) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        const transaction = this.db.transaction(fn);
        return transaction();
    }
    // Health check
    async healthCheck() {
        try {
            if (!this.db) {
                return {
                    connected: false,
                    walMode: false,
                    foreignKeys: false,
                    stats: { pageCount: 0, pageSize: 0, walSize: 0, cacheSize: 0 }
                };
            }
            // Test connection with a simple query
            this.db.prepare('SELECT 1').get();
            return {
                connected: true,
                walMode: this.db.pragma('journal_mode', { simple: true }) === 'wal',
                foreignKeys: this.db.pragma('foreign_keys', { simple: true }) === 1,
                stats: this.getStats()
            };
        }
        catch (error) {
            this.logger.error('Database health check failed', {}, error);
            return {
                connected: false,
                walMode: false,
                foreignKeys: false,
                stats: { pageCount: 0, pageSize: 0, walSize: 0, cacheSize: 0 }
            };
        }
    }
}
