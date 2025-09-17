import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import WebSocket from 'ws';
import { Logger } from './core/Logger.js';
import { ConfigManager } from './core/ConfigManager.js';
import { Database } from './data/Database.js';
import { BinanceService } from './services/BinanceService.js';
import { MarketDataIngestionService } from './services/MarketDataIngestionService.js';
import { RedisService } from './services/RedisService.js';
import { DataValidationService } from './services/DataValidationService.js';
import { EmergencyDataFallbackService } from './services/EmergencyDataFallbackService.js';
import { MarketData } from './types/index.js';
import { AICore } from './ai/index.js';
import { TrainingEngine } from './ai/TrainingEngine.js';
import { BullBearAgent } from './ai/BullBearAgent.js';
import { BacktestEngine } from './ai/BacktestEngine.js';
import { FeatureEngineering } from './ai/FeatureEngineering.js';
import { AlertService } from './services/AlertService.js';
import { NotificationService } from './services/NotificationService.js';

const app = express();
const server = createServer(app);
const wss = new WebSocket.Server({ server });

const logger = Logger.getInstance();
const config = ConfigManager.getInstance();
const database = Database.getInstance();
const binanceService = BinanceService.getInstance();
const marketDataIngestion = MarketDataIngestionService.getInstance();
const redisService = RedisService.getInstance();
const dataValidation = DataValidationService.getInstance();
const emergencyFallback = EmergencyDataFallbackService.getInstance();
const alertService = AlertService.getInstance();
const notificationService = NotificationService.getInstance();

// Initialize AI Core and Training Systems
const { XavierInitializer, StableActivations, NetworkArchitectures } = AICore;
const trainingEngine = TrainingEngine.getInstance();
const bullBearAgent = BullBearAgent.getInstance();
const backtestEngine = BacktestEngine.getInstance();
const featureEngineering = FeatureEngineering.getInstance();

// Setup alert notifications
alertService.subscribe(async (alert) => {
  try {
    await notificationService.sendAlert(alert);
  } catch (error) {
    logger.error('Failed to send alert notification', {}, error as Error);
  }
});

// Initialize database
database.initialize().catch(error => {
  logger.error('Failed to initialize database', {}, error);
  process.exit(1);
});

// Initialize market data ingestion
marketDataIngestion.initialize().catch(error => {
  logger.error('Failed to initialize market data ingestion', {}, error);
  // Don't exit - continue with basic functionality
});

// Initialize AI systems
bullBearAgent.initialize().catch(error => {
  logger.error('Failed to initialize Bull/Bear agent', {}, error);
  // Continue without AI - system can still function
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const correlationId = Math.random().toString(36).substring(2, 15);
  logger.setCorrelationId(correlationId);
  
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent')
  });
  
  next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const binanceHealthy = await binanceService.testConnection();
    const connectionHealth = binanceService.getConnectionHealth();
    const rateLimitInfo = binanceService.getRateLimitInfo();
    const redisStatus = await redisService.getConnectionStatus();
    const ingestionStatus = marketDataIngestion.getStatus();
    const dataQualityMetrics = dataValidation.getQualityMetrics();
    const serverTime = await binanceService.getServerTime();
    
    const health = {
      timestamp: Date.now(),
      status: 'healthy',
      services: {
        binance: binanceHealthy ? 'connected' : 'disconnected',
        database: 'connected',
        redis: redisStatus.isConnected ? 'connected' : 'disconnected',
        dataIngestion: ingestionStatus.isRunning ? 'running' : 'stopped',
        emergencyMode: emergencyFallback.isInEmergencyMode() ? 'active' : 'inactive',
        server: 'running'
      },
      connectionHealth,
      rateLimitInfo,
      performance: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        dataQuality: {
          validationRate: dataQualityMetrics.validationRate,
          totalRecords: dataQualityMetrics.totalRecords,
          lastValidation: dataQualityMetrics.lastValidationTime
        },
        serverTime,
        localTime: Date.now()
      }
    };
    
    logger.info('Health check performed', health);
    res.json(health);
  } catch (error) {
    logger.error('Health check failed', {}, error as Error);
    res.status(500).json({
      status: 'unhealthy',
      error: (error as Error).message
    });
  }
});

// Data pipeline endpoints
app.get('/api/data-pipeline/status', (req, res) => {
  try {
    const ingestionStatus = marketDataIngestion.getStatus();
    const dataQualityReport = dataValidation.getDataQualityReport();
    
    res.json({
      ingestion: ingestionStatus,
      dataQuality: dataQualityReport,
      emergencyMode: emergencyFallback.isInEmergencyMode(),
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Failed to get data pipeline status', {}, error as Error);
    res.status(500).json({
      error: 'Failed to get data pipeline status',
      message: (error as Error).message
    });
  }
});

app.post('/api/data-pipeline/emergency-mode', async (req, res) => {
  try {
    const { activate } = req.body;
    
    if (activate) {
      await emergencyFallback.activateEmergencyMode();
    } else {
      await emergencyFallback.deactivateEmergencyMode();
    }
    
    res.json({
      success: true,
      emergencyMode: emergencyFallback.isInEmergencyMode(),
      message: `Emergency mode ${activate ? 'activated' : 'deactivated'}`
    });
  } catch (error) {
    logger.error('Failed to toggle emergency mode', {}, error as Error);
    res.status(500).json({
      error: 'Failed to toggle emergency mode',
      message: (error as Error).message
    });
  }
});

app.post('/api/data-pipeline/add-symbol', async (req, res) => {
  try {
    const { symbol } = req.body;
    
    if (!symbol || typeof symbol !== 'string') {
      return res.status(400).json({
        error: 'Symbol is required and must be a string'
      });
    }
    
    await marketDataIngestion.addWatchedSymbol(symbol);
    
    res.json({
      success: true,
      symbol: symbol.toUpperCase(),
      watchedSymbols: marketDataIngestion.getWatchedSymbols()
    });
  } catch (error) {
    logger.error('Failed to add watched symbol', { symbol: req.body.symbol }, error as Error);
    res.status(500).json({
      error: 'Failed to add watched symbol',
      message: (error as Error).message
    });
  }
});

// Testnet toggle endpoint
app.post('/api/binance/toggle-testnet', (req, res) => {
  try {
    const { useTestnet } = req.body;
    binanceService.toggleTestnet(useTestnet);
    
    logger.info('Testnet mode toggled', { useTestnet });
    res.json({
      success: true,
      testnet: useTestnet,
      message: `Switched to ${useTestnet ? 'testnet' : 'mainnet'} mode`
    });
  } catch (error) {
    logger.error('Failed to toggle testnet', {}, error as Error);
    res.status(500).json({
      error: 'Failed to toggle testnet mode',
      message: (error as Error).message
    });
  }
});

// Connection health endpoint
app.get('/api/binance/health', (req, res) => {
  try {
    const connectionHealth = binanceService.getConnectionHealth();
    const rateLimitInfo = binanceService.getRateLimitInfo();
    
    res.json({
      connectionHealth,
      rateLimitInfo,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Failed to get connection health', {}, error as Error);
    res.status(500).json({
      error: 'Failed to get connection health',
      message: (error as Error).message
    });
  }
});

// AI Core endpoints
app.get('/api/ai/test-initialization', (req, res) => {
  try {
    const { inputSize = 100, outputSize = 50, layerType = 'dense' } = req.query;
    
    const weights = XavierInitializer.initializeLayer(
      layerType as 'dense' | 'lstm' | 'conv',
      Number(inputSize),
      Number(outputSize)
    );
    
    res.json({
      success: true,
      inputSize: Number(inputSize),
      outputSize: Number(outputSize),
      layerType,
      weightsShape: [weights.length, weights[0].length],
      sampleWeights: weights.slice(0, 3).map(row => row.slice(0, 5))
    });
  } catch (error) {
    logger.error('Failed to test initialization', {}, error as Error);
    res.status(500).json({
      error: 'Failed to test initialization',
      message: (error as Error).message
    });
  }
});

app.get('/api/ai/test-activations', (req, res) => {
  try {
    const testResult = StableActivations.testStability();
    
    res.json({
      success: true,
      stabilityTest: testResult,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Failed to test activations', {}, error as Error);
    res.status(500).json({
      error: 'Failed to test activations',
      message: (error as Error).message
    });
  }
});

app.post('/api/ai/create-network', (req, res) => {
  try {
    const { architecture, inputFeatures, outputSize, ...params } = req.body;
    
    let networkConfig;
    switch (architecture) {
      case 'lstm':
        networkConfig = NetworkArchitectures.createLSTMNetwork(
          inputFeatures,
          params.sequenceLength || 60,
          params.hiddenSizes || [128, 64],
          outputSize
        );
        break;
      case 'cnn':
        networkConfig = NetworkArchitectures.createCNNNetwork(
          params.inputHeight || 32,
          params.inputWidth || 32,
          params.channels || 1,
          outputSize
        );
        break;
      case 'attention':
        networkConfig = NetworkArchitectures.createAttentionNetwork(
          inputFeatures,
          params.attentionHeads || 8,
          params.hiddenSize || 256,
          outputSize
        );
        break;
      case 'hybrid':
        networkConfig = NetworkArchitectures.createHybridNetwork(
          inputFeatures,
          params.sequenceLength || 60,
          outputSize
        );
        break;
      default:
        throw new Error(`Unsupported architecture: ${architecture}`);
    }
    
    const { weights, biases } = NetworkArchitectures.initializeNetwork(networkConfig);
    
    res.json({
      success: true,
      networkConfig,
      weightsInfo: {
        layerCount: weights.length,
        totalParameters: weights.reduce((sum, w) => sum + w.length * w[0].length, 0)
      },
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Failed to create network', {}, error as Error);
    res.status(500).json({
      error: 'Failed to create network',
      message: (error as Error).message
    });
  }
});

// AI Training endpoints
app.post('/api/ai/train-step', async (req, res) => {
  try {
    const { batchSize = 32 } = req.body;
    
    // Get experiences from buffer
    const bufferStats = trainingEngine.experienceBuffer.getStatistics();
    if (bufferStats.size < batchSize) {
      return res.status(400).json({
        error: 'Insufficient experiences in buffer',
        required: batchSize,
        available: bufferStats.size
      });
    }
    
    const batch = trainingEngine.experienceBuffer.sampleBatch(batchSize);
    const metrics = await trainingEngine.trainStep(batch.experiences);
    
    res.json({
      success: true,
      metrics,
      bufferStats,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Failed to perform training step', {}, error as Error);
    res.status(500).json({
      error: 'Failed to perform training step',
      message: (error as Error).message
    });
  }
});

app.post('/api/ai/train-epoch', async (req, res) => {
  try {
    const epochMetrics = await trainingEngine.trainEpoch();
    
    res.json({
      success: true,
      epochMetrics,
      trainingState: trainingEngine.getTrainingState(),
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Failed to train epoch', {}, error as Error);
    res.status(500).json({
      error: 'Failed to train epoch',
      message: (error as Error).message
    });
  }
});

// Bull/Bear prediction endpoint
app.post('/api/ai/predict', async (req, res) => {
  try {
    const { symbol, goal } = req.body;
    
    if (!symbol) {
      return res.status(400).json({
        error: 'Symbol is required'
      });
    }
    
    // Get recent market data
    const marketData = await database.getMarketData(symbol.toUpperCase(), '1h', 100);
    
    if (marketData.length < 50) {
      return res.status(400).json({
        error: 'Insufficient market data for prediction',
        available: marketData.length,
        required: 50
      });
    }
    
    const prediction = await bullBearAgent.predict(marketData, goal);
    
    res.json({
      success: true,
      symbol: symbol.toUpperCase(),
      prediction,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Failed to generate prediction', { symbol: req.body.symbol }, error as Error);
    res.status(500).json({
      error: 'Failed to generate prediction',
      message: (error as Error).message
    });
  }
});

// Feature extraction endpoint
app.post('/api/ai/extract-features', async (req, res) => {
  try {
    const { symbol } = req.body;
    
    const marketData = await database.getMarketData(symbol.toUpperCase(), '1h', 100);
    const features = featureEngineering.extractAllFeatures(marketData);
    
    res.json({
      success: true,
      symbol: symbol.toUpperCase(),
      features,
      featureCount: features.length,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Failed to extract features', { symbol: req.body.symbol }, error as Error);
    res.status(500).json({
      error: 'Failed to extract features',
      message: (error as Error).message
    });
  }
});

// Backtesting endpoint
app.post('/api/ai/backtest', async (req, res) => {
  try {
    const { symbol, startDate, endDate, initialCapital = 10000 } = req.body;
    
    const marketData = await database.getMarketData(
      symbol.toUpperCase(), 
      '1h', 
      10000,
      startDate,
      endDate
    );
    
    const config = {
      startDate,
      endDate,
      initialCapital,
      feeRate: 0.001,
      slippageRate: 0.0005,
      maxPositionSize: 0.1
    };
    
    const result = await backtestEngine.runBacktest(marketData, config);
    
    res.json({
      success: true,
      result,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Failed to run backtest', {}, error as Error);
    res.status(500).json({
      error: 'Failed to run backtest',
      message: (error as Error).message
    });
  }
});

// Alert management endpoints
app.post('/api/alerts', (req, res) => {
  try {
    const alertData = req.body;
    const alert = alertService.createAlert(alertData);
    
    res.json({
      success: true,
      alert,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Failed to create alert', {}, error as Error);
    res.status(500).json({
      error: 'Failed to create alert',
      message: (error as Error).message
    });
  }
});

app.get('/api/alerts', (req, res) => {
  try {
    const alerts = alertService.getActiveAlerts();
    
    res.json({
      success: true,
      alerts,
      count: alerts.length,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Failed to get alerts', {}, error as Error);
    res.status(500).json({
      error: 'Failed to get alerts',
      message: (error as Error).message
    });
  }
});

app.delete('/api/alerts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = alertService.deleteAlert(id);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Alert deleted successfully'
      });
    } else {
      res.status(404).json({
        error: 'Alert not found'
      });
    }
  } catch (error) {
    logger.error('Failed to delete alert', { id: req.params.id }, error as Error);
    res.status(500).json({
      error: 'Failed to delete alert',
      message: (error as Error).message
    });
  }
});

// Market data endpoints
app.get('/api/market-data/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1h', limit = 100 } = req.query;

    logger.info('Fetching market data', { symbol, interval, limit });

    // First try to get from database
    const cachedData = await database.getMarketData(
      symbol.toUpperCase(), 
      interval as string, 
      Number(limit)
    );

    if (cachedData.length > 0) {
      logger.info('Returning cached market data', { 
        symbol, 
        count: cachedData.length 
      });
      return res.json(cachedData);
    }

    // If no cached data, fetch from Binance
    const marketData = await binanceService.getKlines(
      symbol,
      interval as string,
      Number(limit)
    );

    // Store in database for caching
    for (const data of marketData) {
      await database.insertMarketData(data);
    }

    logger.info('Fetched and cached new market data', {
      symbol,
      count: marketData.length
    });

    res.json(marketData);
  } catch (error) {
    logger.error('Failed to fetch market data', {
      symbol: req.params.symbol
    }, error as Error);
    
    res.status(500).json({
      error: 'Failed to fetch market data',
      message: (error as Error).message
    });
  }
});

// Current price endpoint
app.get('/api/price/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const price = await binanceService.getCurrentPrice(symbol);
    
    logger.info('Fetched current price', { symbol, price });
    res.json({ symbol, price, timestamp: Date.now() });
  } catch (error) {
    logger.error('Failed to fetch current price', {
      symbol: req.params.symbol
    }, error as Error);
    
    res.status(500).json({
      error: 'Failed to fetch current price',
      message: (error as Error).message
    });
  }
});

// 24hr ticker endpoint
app.get('/api/ticker/:symbol?', async (req, res) => {
  try {
    const { symbol } = req.params;
    const ticker = await binanceService.get24hrTicker(symbol);
    
    logger.info('Fetched ticker data', { symbol });
    res.json(ticker);
  } catch (error) {
    logger.error('Failed to fetch ticker data', {
      symbol: req.params.symbol
    }, error as Error);
    
    res.status(500).json({
      error: 'Failed to fetch ticker data',
      message: (error as Error).message
    });
  }
});

// Training metrics endpoint
app.get('/api/training-metrics', async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const metrics = await database.getLatestTrainingMetrics(Number(limit));
    
    logger.info('Fetched training metrics', { count: metrics.length });
    res.json(metrics);
  } catch (error) {
    logger.error('Failed to fetch training metrics', {}, error as Error);
    res.status(500).json({
      error: 'Failed to fetch training metrics',
      message: (error as Error).message
    });
  }
});

// Opportunities endpoint
app.get('/api/opportunities', async (req, res) => {
  try {
    const opportunities = await database.getActiveOpportunities();
    
    logger.info('Fetched active opportunities', { count: opportunities.length });
    res.json(opportunities);
  } catch (error) {
    logger.error('Failed to fetch opportunities', {}, error as Error);
    res.status(500).json({
      error: 'Failed to fetch opportunities',
      message: (error as Error).message
    });
  }
});

// Exchange info endpoint
app.get('/api/exchange-info', async (req, res) => {
  try {
    const exchangeInfo = await binanceService.getExchangeInfo();
    res.json(exchangeInfo);
  } catch (error) {
    logger.error('Failed to fetch exchange info', {}, error as Error);
    res.status(500).json({
      error: 'Failed to fetch exchange info',
      message: (error as Error).message
    });
  }
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  logger.info('New WebSocket connection established');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      logger.info('WebSocket message received', data);
      
      // Handle different types of WebSocket messages
      if (data.type === 'subscribe') {
        handleSubscription(ws, data);
      }
    } catch (error) {
      logger.error('Failed to parse WebSocket message', {}, error as Error);
    }
  });
  
  ws.on('close', () => {
    logger.info('WebSocket connection closed');
  });
  
  // Send initial connection confirmation
  ws.send(JSON.stringify({
    type: 'connection',
    status: 'connected',
    timestamp: Date.now()
  }));
});

async function handleSubscription(ws: WebSocket, data: any) {
  try {
    const { symbols, dataType } = data;
    
    logger.info('Handling WebSocket subscription', { symbols, dataType });
    
    if (dataType === 'klines') {
      // Subscribe to real-time kline data
      const binanceWs = await binanceService.subscribeToKlines(symbols, '1m');
      
      binanceWs.on('message', (message) => {
        try {
          const binanceData = JSON.parse(message.toString());
          
          // Forward Binance data to client
          ws.send(JSON.stringify({
            type: 'kline',
            data: binanceData,
            timestamp: Date.now()
          }));
        } catch (error) {
          logger.error('Failed to process Binance WebSocket message', {}, error as Error);
        }
      });
    }
  } catch (error) {
    logger.error('Failed to handle subscription', data, error as Error);
    
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Subscription failed',
      error: (error as Error).message
    }));
  }
}

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Express error handler', {
    method: req.method,
    url: req.url
  }, error);
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, starting graceful shutdown');
  
  await marketDataIngestion.stop();
  binanceService.closeAllConnections();
  await redisService.disconnect();
  await database.close();
  
  server.close(() => {
    logger.info('Server closed gracefully');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, starting graceful shutdown');
  
  await marketDataIngestion.stop();
  binanceService.closeAllConnections();
  await redisService.disconnect();
  await database.close();
  
  server.close(() => {
    logger.info('Server closed gracefully');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  logger.info('BOLT AI Server started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
  
  console.log(`
🚀 BOLT AI - Advanced Cryptocurrency Neural Agent System
📊 Server running on port ${PORT}
🔗 Health check: http://localhost:${PORT}/api/health
📈 Market data: http://localhost:${PORT}/api/market-data/BTCUSDT
🌐 Environment: ${process.env.NODE_ENV || 'development'}

Phase 1.1: Foundation & Infrastructure - COMPLETE ✅
Reference: MarkTechPost Article Implementation
  `);
});

export default app;