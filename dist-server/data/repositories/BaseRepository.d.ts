import { Database } from 'better-sqlite3';
import { Logger } from '../../core/Logger.js';
export declare abstract class BaseRepository<T> {
    protected db: Database;
    protected logger: Logger;
    protected tableName: string;
    constructor(database: Database, tableName: string);
    protected abstract mapRowToEntity(row: any): T;
    protected abstract mapEntityToRow(entity: T): any;
    findById(id: string | number): Promise<T | null>;
    findAll(limit?: number, offset?: number): Promise<T[]>;
    insert(entity: T): Promise<T>;
    update(id: string | number, entity: Partial<T>): Promise<T | null>;
    delete(id: string | number): Promise<boolean>;
    count(): Promise<number>;
    protected executeQuery<R = any>(query: string, params?: any[]): R[];
    protected executeQuerySingle<R = any>(query: string, params?: any[]): R | null;
    protected executeStatement(query: string, params?: any[]): {
        changes: number;
        lastInsertRowid: number | bigint;
    };
}
