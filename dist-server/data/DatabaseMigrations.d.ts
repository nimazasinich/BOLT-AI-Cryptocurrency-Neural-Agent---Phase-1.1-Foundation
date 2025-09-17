import { Database } from 'better-sqlite3';
export interface Migration {
    version: number;
    name: string;
    up: string;
    down: string;
}
export declare class DatabaseMigrations {
    private db;
    private logger;
    private migrationsPath;
    constructor(database: Database);
    initialize(): Promise<void>;
    getCurrentVersion(): Promise<number>;
    runMigrations(): Promise<void>;
    private getMigrations;
    rollback(targetVersion: number): Promise<void>;
}
