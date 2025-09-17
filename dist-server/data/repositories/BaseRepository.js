import { Logger } from '../../core/Logger.js';
export class BaseRepository {
    db;
    logger = Logger.getInstance();
    tableName;
    constructor(database, tableName) {
        this.db = database;
        this.tableName = tableName;
    }
    async findById(id) {
        try {
            const stmt = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`);
            const row = stmt.get(id);
            if (!row) {
                return null;
            }
            return this.mapRowToEntity(row);
        }
        catch (error) {
            this.logger.error(`Failed to find entity by id: ${id}`, { tableName: this.tableName }, error);
            throw error;
        }
    }
    async findAll(limit, offset) {
        try {
            let query = `SELECT * FROM ${this.tableName}`;
            const params = [];
            if (limit) {
                query += ` LIMIT ?`;
                params.push(limit);
                if (offset) {
                    query += ` OFFSET ?`;
                    params.push(offset);
                }
            }
            const stmt = this.db.prepare(query);
            const rows = stmt.all(...params);
            return rows.map(row => this.mapRowToEntity(row));
        }
        catch (error) {
            this.logger.error('Failed to find all entities', { tableName: this.tableName }, error);
            throw error;
        }
    }
    async insert(entity) {
        try {
            const row = this.mapEntityToRow(entity);
            const columns = Object.keys(row);
            const placeholders = columns.map(() => '?').join(', ');
            const values = Object.values(row);
            const query = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
            const stmt = this.db.prepare(query);
            const result = stmt.run(...values);
            // For auto-increment IDs, update the entity with the new ID
            if (result.lastInsertRowid && typeof result.lastInsertRowid === 'number') {
                entity.id = result.lastInsertRowid;
            }
            this.logger.info('Entity inserted successfully', {
                tableName: this.tableName,
                id: result.lastInsertRowid
            });
            return entity;
        }
        catch (error) {
            this.logger.error('Failed to insert entity', { tableName: this.tableName }, error);
            throw error;
        }
    }
    async update(id, entity) {
        try {
            const row = this.mapEntityToRow(entity);
            const columns = Object.keys(row);
            const setClause = columns.map(col => `${col} = ?`).join(', ');
            const values = [...Object.values(row), id];
            const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
            const stmt = this.db.prepare(query);
            const result = stmt.run(...values);
            if (result.changes === 0) {
                return null;
            }
            this.logger.info('Entity updated successfully', {
                tableName: this.tableName,
                id,
                changes: result.changes
            });
            return await this.findById(id);
        }
        catch (error) {
            this.logger.error(`Failed to update entity: ${id}`, { tableName: this.tableName }, error);
            throw error;
        }
    }
    async delete(id) {
        try {
            const stmt = this.db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`);
            const result = stmt.run(id);
            const deleted = result.changes > 0;
            if (deleted) {
                this.logger.info('Entity deleted successfully', {
                    tableName: this.tableName,
                    id
                });
            }
            return deleted;
        }
        catch (error) {
            this.logger.error(`Failed to delete entity: ${id}`, { tableName: this.tableName }, error);
            throw error;
        }
    }
    async count() {
        try {
            const stmt = this.db.prepare(`SELECT COUNT(*) as count FROM ${this.tableName}`);
            const result = stmt.get();
            return result.count;
        }
        catch (error) {
            this.logger.error('Failed to count entities', { tableName: this.tableName }, error);
            throw error;
        }
    }
    executeQuery(query, params = []) {
        try {
            const stmt = this.db.prepare(query);
            return stmt.all(...params);
        }
        catch (error) {
            this.logger.error('Failed to execute query', { query, params }, error);
            throw error;
        }
    }
    executeQuerySingle(query, params = []) {
        try {
            const stmt = this.db.prepare(query);
            return stmt.get(...params) || null;
        }
        catch (error) {
            this.logger.error('Failed to execute single query', { query, params }, error);
            throw error;
        }
    }
    executeStatement(query, params = []) {
        try {
            const stmt = this.db.prepare(query);
            return stmt.run(...params);
        }
        catch (error) {
            this.logger.error('Failed to execute statement', { query, params }, error);
            throw error;
        }
    }
}
