import Redis from 'ioredis';
import { Logger } from '../core/Logger.js';
import { ConfigManager } from '../core/ConfigManager.js';
export class RedisService {
    static instance;
    redis = null;
    subscriber = null;
    publisher = null;
    logger = Logger.getInstance();
    config = ConfigManager.getInstance();
    isConnected = false;
    reconnectAttempts = 0;
    maxReconnectAttempts = 10;
    constructor() { }
    static getInstance() {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }
    async initialize() {
        try {
            const redisConfig = this.config.getRedisConfig();
            const connectionOptions = {
                host: redisConfig.host,
                port: redisConfig.port,
                password: redisConfig.password,
                retryDelayOnFailover: 100,
                maxRetriesPerRequest: 3,
                lazyConnect: true,
                keepAlive: 30000,
                connectTimeout: 10000,
                commandTimeout: 5000
            };
            // Main Redis connection
            this.redis = new Redis(connectionOptions);
            // Separate connections for pub/sub
            this.publisher = new Redis(connectionOptions);
            this.subscriber = new Redis(connectionOptions);
            // Setup event handlers
            this.setupEventHandlers();
            // Connect to Redis
            await this.redis.connect();
            await this.publisher.connect();
            await this.subscriber.connect();
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.logger.info('Redis service initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize Redis service', {}, error);
            this.isConnected = false;
            throw error;
        }
    }
    setupEventHandlers() {
        if (!this.redis || !this.publisher || !this.subscriber)
            return;
        // Main connection events
        this.redis.on('connect', () => {
            this.logger.info('Redis main connection established');
            this.isConnected = true;
            this.reconnectAttempts = 0;
        });
        this.redis.on('error', (error) => {
            this.logger.error('Redis main connection error', {}, error);
            this.isConnected = false;
        });
        this.redis.on('close', () => {
            this.logger.warn('Redis main connection closed');
            this.isConnected = false;
            this.handleReconnection();
        });
        // Publisher events
        this.publisher.on('error', (error) => {
            this.logger.error('Redis publisher error', {}, error);
        });
        // Subscriber events
        this.subscriber.on('error', (error) => {
            this.logger.error('Redis subscriber error', {}, error);
        });
    }
    async handleReconnection() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.logger.error('Max Redis reconnection attempts reached');
            return;
        }
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        this.logger.info('Attempting Redis reconnection', {
            attempt: this.reconnectAttempts,
            delay
        });
        setTimeout(async () => {
            try {
                await this.initialize();
            }
            catch (error) {
                this.logger.error('Redis reconnection failed', {}, error);
            }
        }, delay);
    }
    async publishMarketData(data) {
        if (!this.isConnected || !this.publisher) {
            this.logger.warn('Redis not connected, skipping publish');
            return;
        }
        try {
            const channel = `market_data:${data.symbol}:${data.interval}`;
            const message = JSON.stringify(data);
            await this.publisher.publish(channel, message);
            this.logger.debug('Market data published to Redis', {
                channel,
                symbol: data.symbol
            });
        }
        catch (error) {
            this.logger.error('Failed to publish market data to Redis', { data }, error);
        }
    }
    async subscribeToMarketData(symbols, intervals, callback) {
        if (!this.isConnected || !this.subscriber) {
            this.logger.warn('Redis not connected, cannot subscribe');
            return;
        }
        try {
            const channels = symbols.flatMap(symbol => intervals.map(interval => `market_data:${symbol}:${interval}`));
            await this.subscriber.subscribe(...channels);
            this.subscriber.on('message', (channel, message) => {
                try {
                    const data = JSON.parse(message);
                    callback(data);
                }
                catch (error) {
                    this.logger.error('Failed to parse Redis message', { channel, message }, error);
                }
            });
            this.logger.info('Subscribed to market data channels', { channels });
        }
        catch (error) {
            this.logger.error('Failed to subscribe to market data', { symbols, intervals }, error);
        }
    }
    async cacheData(key, data, ttlSeconds = 3600) {
        if (!this.isConnected || !this.redis) {
            this.logger.warn('Redis not connected, skipping cache');
            return;
        }
        try {
            const serializedData = JSON.stringify(data);
            await this.redis.setex(key, ttlSeconds, serializedData);
            this.logger.debug('Data cached in Redis', { key, ttl: ttlSeconds });
        }
        catch (error) {
            this.logger.error('Failed to cache data in Redis', { key }, error);
        }
    }
    async getCachedData(key) {
        if (!this.isConnected || !this.redis) {
            this.logger.warn('Redis not connected, cannot retrieve cache');
            return null;
        }
        try {
            const data = await this.redis.get(key);
            if (!data)
                return null;
            return JSON.parse(data);
        }
        catch (error) {
            this.logger.error('Failed to retrieve cached data from Redis', { key }, error);
            return null;
        }
    }
    async invalidateCache(pattern) {
        if (!this.isConnected || !this.redis) {
            this.logger.warn('Redis not connected, cannot invalidate cache');
            return;
        }
        try {
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
                this.logger.info('Cache invalidated', { pattern, keysDeleted: keys.length });
            }
        }
        catch (error) {
            this.logger.error('Failed to invalidate cache', { pattern }, error);
        }
    }
    async getConnectionStatus() {
        const status = {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            redisInfo: undefined
        };
        if (this.isConnected && this.redis) {
            try {
                status.redisInfo = await this.redis.info();
            }
            catch (error) {
                this.logger.error('Failed to get Redis info', {}, error);
            }
        }
        return status;
    }
    async disconnect() {
        try {
            if (this.redis) {
                await this.redis.quit();
                this.redis = null;
            }
            if (this.publisher) {
                await this.publisher.quit();
                this.publisher = null;
            }
            if (this.subscriber) {
                await this.subscriber.quit();
                this.subscriber = null;
            }
            this.isConnected = false;
            this.logger.info('Redis service disconnected');
        }
        catch (error) {
            this.logger.error('Error disconnecting from Redis', {}, error);
        }
    }
}
