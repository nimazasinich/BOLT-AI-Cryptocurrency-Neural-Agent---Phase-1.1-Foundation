import { Logger } from '../core/Logger.js';
import { BinanceService } from './BinanceService.js';
import { Database } from '../data/Database.js';
import { MarketData } from '../types/index.js';
import { RedisService } from './RedisService.js';
import cron from 'node-cron';

export class MarketDataIngestionService {
  private static instance: MarketDataIngestionService;
  private logger = Logger.getInstance();
  private binanceService = BinanceService.getInstance();
  private database = Database.getInstance();
  private redisService = RedisService.getInstance();
  private isRunning = false;
  private cronJobs: Map<string, cron.ScheduledTask> = new Map();
  private watchedSymbols: string[] = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'BNBUSDT', 'XRPUSDT'];
  private intervals: string[] = ['1m', '5m', '15m', '1h', '4h', '1d'];

  private constructor() {}

  static getInstance(): MarketDataIngestionService {
    if (!MarketDataIngestionService.instance) {
      MarketDataIngestionService.instance = new MarketDataIngestionService();
    }
    return MarketDataIngestionService.instance;
  }

  async initialize(): Promise<void> {
    try {
      await this.redisService.initialize();
      this.setupDataIngestionSchedule();
      this.setupRealTimeStreaming();
      this.isRunning = true;
      this.logger.info('Market data ingestion service initialized');
    } catch (error) {
      this.logger.error('Failed to initialize market data ingestion service', {}, error as Error);
      throw error;
    }
  }

  private setupDataIngestionSchedule(): void {
    // Ingest 1-minute data every minute
    const minuteJob = cron.schedule('* * * * *', async () => {
      await this.ingestHistoricalData('1m', 100);
    }, { scheduled: false });

    // Ingest 5-minute data every 5 minutes
    const fiveMinuteJob = cron.schedule('*/5 * * * *', async () => {
      await this.ingestHistoricalData('5m', 100);
    }, { scheduled: false });

    // Ingest hourly data every hour
    const hourlyJob = cron.schedule('0 * * * *', async () => {
      await this.ingestHistoricalData('1h', 100);
    }, { scheduled: false });

    // Ingest daily data once per day
    const dailyJob = cron.schedule('0 0 * * *', async () => {
      await this.ingestHistoricalData('1d', 365);
    }, { scheduled: false });

    this.cronJobs.set('1m', minuteJob);
    this.cronJobs.set('5m', fiveMinuteJob);
    this.cronJobs.set('1h', hourlyJob);
    this.cronJobs.set('1d', dailyJob);

    // Start all cron jobs
    this.cronJobs.forEach(job => job.start());
    this.logger.info('Data ingestion schedule configured');
  }

  private async setupRealTimeStreaming(): Promise<void> {
    try {
      for (const symbol of this.watchedSymbols) {
        const ws = await this.binanceService.subscribeToKlines([symbol], '1m');
        
        ws.on('message', async (data) => {
          try {
            const message = JSON.parse(data.toString());
            if (message.e === 'kline') {
              const kline = message.k;
              const marketData: MarketData = {
                symbol: kline.s,
                timestamp: kline.t,
                open: parseFloat(kline.o),
                high: parseFloat(kline.h),
                low: parseFloat(kline.l),
                close: parseFloat(kline.c),
                volume: parseFloat(kline.v),
                interval: kline.i
              };

              await this.processMarketData(marketData);
            }
          } catch (error) {
            this.logger.error('Failed to process real-time market data', {}, error as Error);
          }
        });
      }
      this.logger.info('Real-time streaming setup complete');
    } catch (error) {
      this.logger.error('Failed to setup real-time streaming', {}, error as Error);
    }
  }

  private async ingestHistoricalData(interval: string, limit: number): Promise<void> {
    for (const symbol of this.watchedSymbols) {
      try {
        const marketData = await this.binanceService.getKlines(symbol, interval, limit);
        
        for (const data of marketData) {
          await this.processMarketData(data);
        }

        this.logger.info('Historical data ingested', { symbol, interval, count: marketData.length });
      } catch (error) {
        this.logger.error('Failed to ingest historical data', { symbol, interval }, error as Error);
      }
    }
  }

  private async processMarketData(data: MarketData): Promise<void> {
    try {
      // Normalize data
      const normalizedData = this.normalizeMarketData(data);
      
      // Validate data
      if (!this.validateMarketData(normalizedData)) {
        this.logger.warn('Invalid market data detected', { data: normalizedData });
        return;
      }

      // Store in database
      await this.database.insertMarketData(normalizedData);

      // Publish to Redis
      await this.redisService.publishMarketData(normalizedData);

      this.logger.debug('Market data processed', { 
        symbol: normalizedData.symbol, 
        timestamp: normalizedData.timestamp 
      });
    } catch (error) {
      this.logger.error('Failed to process market data', { data }, error as Error);
    }
  }

  private normalizeMarketData(data: MarketData): MarketData {
    return {
      symbol: data.symbol.toUpperCase(),
      timestamp: Math.floor(data.timestamp),
      open: Number(data.open.toFixed(8)),
      high: Number(data.high.toFixed(8)),
      low: Number(data.low.toFixed(8)),
      close: Number(data.close.toFixed(8)),
      volume: Number(data.volume.toFixed(8)),
      interval: data.interval
    };
  }

  private validateMarketData(data: MarketData): boolean {
    // Basic validation checks
    if (!data.symbol || typeof data.symbol !== 'string') return false;
    if (!data.timestamp || data.timestamp <= 0) return false;
    if (data.open <= 0 || data.high <= 0 || data.low <= 0 || data.close <= 0) return false;
    if (data.volume < 0) return false;
    if (data.high < data.low) return false;
    if (data.high < Math.max(data.open, data.close)) return false;
    if (data.low > Math.min(data.open, data.close)) return false;

    // Sanity checks for extreme values
    const priceRange = data.high - data.low;
    const avgPrice = (data.high + data.low) / 2;
    if (priceRange / avgPrice > 0.5) return false; // 50% range seems extreme

    return true;
  }

  async addWatchedSymbol(symbol: string): Promise<void> {
    if (!this.watchedSymbols.includes(symbol.toUpperCase())) {
      this.watchedSymbols.push(symbol.toUpperCase());
      this.logger.info('Added watched symbol', { symbol });
    }
  }

  async removeWatchedSymbol(symbol: string): Promise<void> {
    const index = this.watchedSymbols.indexOf(symbol.toUpperCase());
    if (index > -1) {
      this.watchedSymbols.splice(index, 1);
      this.logger.info('Removed watched symbol', { symbol });
    }
  }

  getWatchedSymbols(): string[] {
    return [...this.watchedSymbols];
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    this.cronJobs.forEach(job => job.stop());
    this.cronJobs.clear();
    await this.redisService.disconnect();
    this.logger.info('Market data ingestion service stopped');
  }

  getStatus(): { isRunning: boolean; watchedSymbols: string[]; intervals: string[] } {
    return {
      isRunning: this.isRunning,
      watchedSymbols: this.watchedSymbols,
      intervals: this.intervals
    };
  }
}