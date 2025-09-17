import { BaseRepository } from './BaseRepository.js';
export class MarketDataRepository extends BaseRepository {
    constructor(database) {
        super(database, 'market_data');
    }
    mapRowToEntity(row) {
        return {
            symbol: row.symbol,
            timestamp: row.timestamp,
            open: row.open,
            high: row.high,
            low: row.low,
            close: row.close,
            volume: row.volume,
            interval: row.interval
        };
    }
    mapEntityToRow(entity) {
        return {
            symbol: entity.symbol,
            timestamp: entity.timestamp,
            open: entity.open,
            high: entity.high,
            low: entity.low,
            close: entity.close,
            volume: entity.volume,
            interval: entity.interval
        };
    }
    async findBySymbolAndInterval(symbol, interval, limit = 1000, startTime, endTime) {
        try {
            let query = `
        SELECT * FROM ${this.tableName} 
        WHERE symbol = ? AND interval = ?
      `;
            const params = [symbol, interval];
            if (startTime) {
                query += ` AND timestamp >= ?`;
                params.push(startTime);
            }
            if (endTime) {
                query += ` AND timestamp <= ?`;
                params.push(endTime);
            }
            query += ` ORDER BY timestamp DESC LIMIT ?`;
            params.push(limit);
            const rows = this.executeQuery(query, params);
            return rows.map(row => this.mapRowToEntity(row));
        }
        catch (error) {
            this.logger.error('Failed to find market data by symbol and interval', {
                symbol,
                interval,
                limit,
                startTime,
                endTime
            }, error);
            throw error;
        }
    }
    async insertOrUpdate(marketData) {
        try {
            const query = `
        INSERT OR REPLACE INTO ${this.tableName} 
        (symbol, timestamp, open, high, low, close, volume, interval) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
            const params = [
                marketData.symbol,
                marketData.timestamp,
                marketData.open,
                marketData.high,
                marketData.low,
                marketData.close,
                marketData.volume,
                marketData.interval
            ];
            this.executeStatement(query, params);
            this.logger.debug('Market data inserted/updated', {
                symbol: marketData.symbol,
                timestamp: marketData.timestamp,
                interval: marketData.interval
            });
            return marketData;
        }
        catch (error) {
            this.logger.error('Failed to insert/update market data', {
                symbol: marketData.symbol,
                timestamp: marketData.timestamp
            }, error);
            throw error;
        }
    }
    async getLatestTimestamp(symbol, interval) {
        try {
            const query = `
        SELECT MAX(timestamp) as latest_timestamp 
        FROM ${this.tableName} 
        WHERE symbol = ? AND interval = ?
      `;
            const result = this.executeQuerySingle(query, [symbol, interval]);
            return result?.latest_timestamp || null;
        }
        catch (error) {
            this.logger.error('Failed to get latest timestamp', { symbol, interval }, error);
            throw error;
        }
    }
    async getSymbols() {
        try {
            const query = `SELECT DISTINCT symbol FROM ${this.tableName} ORDER BY symbol`;
            const rows = this.executeQuery(query);
            return rows.map(row => row.symbol);
        }
        catch (error) {
            this.logger.error('Failed to get symbols', {}, error);
            throw error;
        }
    }
    async getIntervals(symbol) {
        try {
            const query = `
        SELECT DISTINCT interval 
        FROM ${this.tableName} 
        WHERE symbol = ? 
        ORDER BY interval
      `;
            const rows = this.executeQuery(query, [symbol]);
            return rows.map(row => row.interval);
        }
        catch (error) {
            this.logger.error('Failed to get intervals', { symbol }, error);
            throw error;
        }
    }
    async deleteOldData(symbol, interval, keepDays = 30) {
        try {
            const cutoffTime = Date.now() - (keepDays * 24 * 60 * 60 * 1000);
            const query = `
        DELETE FROM ${this.tableName} 
        WHERE symbol = ? AND interval = ? AND timestamp < ?
      `;
            const result = this.executeStatement(query, [symbol, interval, cutoffTime]);
            this.logger.info('Old market data deleted', {
                symbol,
                interval,
                deletedRows: result.changes,
                keepDays
            });
            return result.changes;
        }
        catch (error) {
            this.logger.error('Failed to delete old market data', {
                symbol,
                interval,
                keepDays
            }, error);
            throw error;
        }
    }
}
