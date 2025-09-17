import { ApiConfig } from '../types/index.js';
export declare class ConfigManager {
    private static instance;
    private config;
    private configPath;
    private logger;
    private constructor();
    static getInstance(): ConfigManager;
    private loadConfig;
    private createDefaultConfig;
    private validateConfig;
    private saveConfig;
    getConfig(): ApiConfig;
    updateConfig(updates: Partial<ApiConfig>): void;
    getBinanceConfig(): {
        apiKey: string;
        secretKey: string;
        testnet: boolean;
        rateLimits: {
            requestsPerSecond: number;
            dailyLimit: number;
        };
    };
    getTelegramConfig(): {
        botToken: string;
        chatId: string;
    };
    getDatabaseConfig(): {
        path: string;
        encrypted: boolean;
        backupEnabled: boolean;
    };
    getRedisConfig(): {
        host: string;
        port: number;
        password?: string;
    };
}
