import { Logger } from '../core/Logger.js';
import { join } from 'path';
export class DatabaseMigrations {
    db;
    logger = Logger.getInstance();
    migrationsPath;
    constructor(database) {
        this.db = database;
        this.migrationsPath = join(process.cwd(), 'migrations');
    }
    async initialize() {
        // Create migrations table if it doesn't exist
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
      )
    `);
        this.logger.info('Database migrations system initialized');
    }
    async getCurrentVersion() {
        const result = this.db.prepare(`
      SELECT MAX(version) as version FROM schema_migrations
    `).get();
        return result?.version || 0;
    }
    async runMigrations() {
        const currentVersion = await this.getCurrentVersion();
        const migrations = this.getMigrations();
        const pendingMigrations = migrations.filter(m => m.version > currentVersion);
        if (pendingMigrations.length === 0) {
            this.logger.info('No pending migrations');
            return;
        }
        this.logger.info(`Running ${pendingMigrations.length} pending migrations`);
        const transaction = this.db.transaction((migrations) => {
            for (const migration of migrations) {
                try {
                    this.logger.info(`Applying migration ${migration.version}: ${migration.name}`);
                    // Execute migration SQL
                    this.db.exec(migration.up);
                    // Record migration
                    this.db.prepare(`
            INSERT INTO schema_migrations (version, name) VALUES (?, ?)
          `).run(migration.version, migration.name);
                    this.logger.info(`Migration ${migration.version} applied successfully`);
                }
                catch (error) {
                    this.logger.error(`Migration ${migration.version} failed`, {}, error);
                    throw error;
                }
            }
        });
        transaction(pendingMigrations);
    }
    getMigrations() {
        return [
            {
                version: 1,
                name: 'create_core_tables',
                up: `
          -- Market Data Table with composite index
          CREATE TABLE IF NOT EXISTS market_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            open REAL NOT NULL,
            high REAL NOT NULL,
            low REAL NOT NULL,
            close REAL NOT NULL,
            volume REAL NOT NULL,
            interval TEXT NOT NULL,
            created_at INTEGER DEFAULT (strftime('%s', 'now')),
            UNIQUE(symbol, timestamp, interval)
          );

          CREATE INDEX IF NOT EXISTS idx_market_data_composite ON market_data(symbol, timestamp, interval);
          CREATE INDEX IF NOT EXISTS idx_market_data_timestamp ON market_data(timestamp);
        `,
                down: `
          DROP INDEX IF EXISTS idx_market_data_composite;
          DROP INDEX IF EXISTS idx_market_data_timestamp;
          DROP TABLE IF EXISTS market_data;
        `
            },
            {
                version: 2,
                name: 'create_training_tables',
                up: `
          -- Training Metrics with model versioning
          CREATE TABLE IF NOT EXISTS training_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            epoch INTEGER NOT NULL,
            timestamp INTEGER NOT NULL,
            model_version TEXT NOT NULL DEFAULT 'v1.0',
            mse REAL NOT NULL,
            mae REAL NOT NULL,
            r_squared REAL NOT NULL,
            directional_accuracy REAL NOT NULL,
            classification_accuracy REAL NOT NULL,
            gradient_norm REAL NOT NULL,
            learning_rate REAL NOT NULL,
            nan_count INTEGER DEFAULT 0,
            inf_count INTEGER DEFAULT 0,
            reset_count INTEGER DEFAULT 0,
            epsilon REAL DEFAULT 0,
            exploration_ratio REAL DEFAULT 0,
            exploitation_ratio REAL DEFAULT 0,
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
          );

          CREATE INDEX IF NOT EXISTS idx_training_metrics_timestamp ON training_metrics(timestamp);
          CREATE INDEX IF NOT EXISTS idx_training_metrics_version ON training_metrics(model_version);
        `,
                down: `
          DROP INDEX IF EXISTS idx_training_metrics_timestamp;
          DROP INDEX IF EXISTS idx_training_metrics_version;
          DROP TABLE IF EXISTS training_metrics;
        `
            },
            {
                version: 3,
                name: 'create_experience_buffer',
                up: `
          -- Experience Buffer for replay memory
          CREATE TABLE IF NOT EXISTS experience_buffer (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            state_features BLOB NOT NULL,
            action INTEGER NOT NULL,
            reward REAL NOT NULL,
            next_state_features BLOB NOT NULL,
            terminal INTEGER NOT NULL,
            td_error REAL DEFAULT 0,
            priority_score REAL DEFAULT 1.0,
            timestamp INTEGER NOT NULL,
            symbol TEXT NOT NULL,
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
          );

          CREATE INDEX IF NOT EXISTS idx_experience_buffer_timestamp ON experience_buffer(timestamp);
          CREATE INDEX IF NOT EXISTS idx_experience_buffer_priority ON experience_buffer(priority_score DESC);
          CREATE INDEX IF NOT EXISTS idx_experience_buffer_symbol ON experience_buffer(symbol);
        `,
                down: `
          DROP INDEX IF EXISTS idx_experience_buffer_timestamp;
          DROP INDEX IF EXISTS idx_experience_buffer_priority;
          DROP INDEX IF EXISTS idx_experience_buffer_symbol;
          DROP TABLE IF EXISTS experience_buffer;
        `
            },
            {
                version: 4,
                name: 'create_backtest_tables',
                up: `
          -- Backtest Results and Trades
          CREATE TABLE IF NOT EXISTS backtest_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            strategy_name TEXT NOT NULL,
            start_date INTEGER NOT NULL,
            end_date INTEGER NOT NULL,
            initial_capital REAL NOT NULL,
            final_capital REAL NOT NULL,
            total_return REAL NOT NULL,
            annualized_return REAL NOT NULL,
            sharpe_ratio REAL NOT NULL,
            sortino_ratio REAL NOT NULL,
            max_drawdown REAL NOT NULL,
            max_drawdown_duration INTEGER NOT NULL,
            profit_factor REAL NOT NULL,
            win_rate REAL NOT NULL,
            avg_win REAL NOT NULL,
            avg_loss REAL NOT NULL,
            total_trades INTEGER NOT NULL,
            var_95 REAL NOT NULL,
            cvar_95 REAL NOT NULL,
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
          );

          CREATE TABLE IF NOT EXISTS backtest_trades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            backtest_id INTEGER NOT NULL,
            trade_id TEXT NOT NULL,
            symbol TEXT NOT NULL,
            entry_time INTEGER NOT NULL,
            exit_time INTEGER NOT NULL,
            entry_price REAL NOT NULL,
            exit_price REAL NOT NULL,
            quantity REAL NOT NULL,
            direction TEXT NOT NULL,
            pnl REAL NOT NULL,
            fees REAL NOT NULL,
            confidence REAL NOT NULL,
            reasoning TEXT,
            created_at INTEGER DEFAULT (strftime('%s', 'now')),
            FOREIGN KEY (backtest_id) REFERENCES backtest_results (id)
          );

          CREATE INDEX IF NOT EXISTS idx_backtest_results_strategy ON backtest_results(strategy_name);
          CREATE INDEX IF NOT EXISTS idx_backtest_trades_backtest_id ON backtest_trades(backtest_id);
          CREATE INDEX IF NOT EXISTS idx_backtest_trades_symbol ON backtest_trades(symbol);
        `,
                down: `
          DROP INDEX IF EXISTS idx_backtest_results_strategy;
          DROP INDEX IF EXISTS idx_backtest_trades_backtest_id;
          DROP INDEX IF EXISTS idx_backtest_trades_symbol;
          DROP TABLE IF EXISTS backtest_trades;
          DROP TABLE IF EXISTS backtest_results;
        `
            },
            {
                version: 5,
                name: 'create_opportunities_and_alerts',
                up: `
          -- Opportunities Table
          CREATE TABLE IF NOT EXISTS opportunities (
            id TEXT PRIMARY KEY,
            symbol TEXT NOT NULL,
            detection_time INTEGER NOT NULL,
            pattern_type TEXT NOT NULL,
            confidence REAL NOT NULL,
            technical_score REAL NOT NULL,
            sentiment_score REAL NOT NULL,
            whale_score REAL NOT NULL,
            combined_score REAL NOT NULL,
            target_price REAL NOT NULL,
            stop_loss REAL NOT NULL,
            expected_return REAL NOT NULL,
            risk_reward REAL NOT NULL,
            status TEXT NOT NULL DEFAULT 'NEW',
            reasoning TEXT,
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
          );

          -- Alerts Table
          CREATE TABLE IF NOT EXISTS alerts (
            id TEXT PRIMARY KEY,
            symbol TEXT NOT NULL,
            type TEXT NOT NULL,
            condition_text TEXT NOT NULL,
            threshold REAL NOT NULL,
            current_value REAL NOT NULL,
            triggered INTEGER DEFAULT 0,
            trigger_time INTEGER,
            priority TEXT NOT NULL DEFAULT 'MEDIUM',
            message TEXT NOT NULL,
            actions TEXT NOT NULL,
            cooldown_period INTEGER DEFAULT 60,
            last_triggered INTEGER,
            active INTEGER DEFAULT 1,
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
          );

          CREATE INDEX IF NOT EXISTS idx_opportunities_symbol ON opportunities(symbol);
          CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
          CREATE INDEX IF NOT EXISTS idx_opportunities_combined_score ON opportunities(combined_score DESC);
          CREATE INDEX IF NOT EXISTS idx_alerts_symbol ON alerts(symbol);
          CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(active);
        `,
                down: `
          DROP INDEX IF EXISTS idx_opportunities_symbol;
          DROP INDEX IF EXISTS idx_opportunities_status;
          DROP INDEX IF EXISTS idx_opportunities_combined_score;
          DROP INDEX IF EXISTS idx_alerts_symbol;
          DROP INDEX IF EXISTS idx_alerts_active;
          DROP TABLE IF EXISTS opportunities;
          DROP TABLE IF EXISTS alerts;
        `
            }
        ];
    }
    async rollback(targetVersion) {
        const currentVersion = await this.getCurrentVersion();
        if (targetVersion >= currentVersion) {
            this.logger.warn('Target version is not lower than current version');
            return;
        }
        const migrations = this.getMigrations();
        const rollbackMigrations = migrations
            .filter(m => m.version > targetVersion && m.version <= currentVersion)
            .sort((a, b) => b.version - a.version); // Reverse order for rollback
        this.logger.info(`Rolling back ${rollbackMigrations.length} migrations`);
        const transaction = this.db.transaction((migrations) => {
            for (const migration of migrations) {
                try {
                    this.logger.info(`Rolling back migration ${migration.version}: ${migration.name}`);
                    // Execute rollback SQL
                    this.db.exec(migration.down);
                    // Remove migration record
                    this.db.prepare(`
            DELETE FROM schema_migrations WHERE version = ?
          `).run(migration.version);
                    this.logger.info(`Migration ${migration.version} rolled back successfully`);
                }
                catch (error) {
                    this.logger.error(`Rollback of migration ${migration.version} failed`, {}, error);
                    throw error;
                }
            }
        });
        transaction(rollbackMigrations);
    }
}
