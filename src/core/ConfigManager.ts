import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { ApiConfig } from '../types/index.js';
import { Logger } from './Logger.js';

export class ConfigManager {
  private static instance: ConfigManager;
  private config: ApiConfig;
  private configPath: string;
  private logger = Logger.getInstance();

  private constructor() {
    this.configPath = join(process.cwd(), 'config', 'api.json');
    this.loadConfig();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): void {
    try {
      if (!existsSync(this.configPath)) {
        this.logger.warn('Config file not found, creating default configuration');
        this.createDefaultConfig();
        return;
      }

      const configData = readFileSync(this.configPath, 'utf8');
      this.config = JSON.parse(configData);
      
      // Validate required fields
      this.validateConfig();
      
      this.logger.info('Configuration loaded successfully');
    } catch (error) {
      this.logger.error('Failed to load configuration', {}, error as Error);
      this.createDefaultConfig();
    }
  }

  private createDefaultConfig(): void {
    this.config = {
      binance: {
        apiKey: process.env.BINANCE_API_KEY || '',
        secretKey: process.env.BINANCE_SECRET_KEY || '',
        testnet: true,
        rateLimits: {
          requestsPerSecond: 10,
          dailyLimit: 100000
        }
      },
      telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN || '',
        chatId: process.env.TELEGRAM_CHAT_ID || ''
      },
      database: {
        path: join(process.cwd(), 'data', 'boltai.db'),
        encrypted: true,
        backupEnabled: true
      },
      redis: {
        host: 'localhost',
        port: 6379,
        password: process.env.REDIS_PASSWORD
      }
    };

    this.saveConfig();
  }

  private validateConfig(): void {
    if (!this.config.binance?.apiKey) {
      throw new Error('Binance API key is required');
    }
    
    if (!this.config.database?.path) {
      throw new Error('Database path is required');
    }
  }

  private saveConfig(): void {
    try {
      writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      this.logger.info('Configuration saved successfully');
    } catch (error) {
      this.logger.error('Failed to save configuration', {}, error as Error);
    }
  }

  getConfig(): ApiConfig {
    return this.config;
  }

  updateConfig(updates: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  getBinanceConfig() {
    return this.config.binance;
  }

  getTelegramConfig() {
    return this.config.telegram;
  }

  getDatabaseConfig() {
    return this.config.database;
  }

  getRedisConfig() {
    return this.config.redis;
  }
}