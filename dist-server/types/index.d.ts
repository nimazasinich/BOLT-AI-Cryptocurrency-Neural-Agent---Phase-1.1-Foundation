export interface MarketData {
    symbol: string;
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    interval: string;
}
export interface AISignal {
    id: string;
    symbol: string;
    timestamp: number;
    signalType: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    probability: {
        bull: number;
        bear: number;
        neutral: number;
    };
    reasoning: string[];
    technicalScore: number;
    sentimentScore: number;
    whaleScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    targetPrice?: number;
    stopLoss?: number;
    expectedProfitLoss: number;
}
export interface TechnicalIndicators {
    sma: number[];
    ema: number[];
    rsi: number;
    macd: {
        macd: number;
        signal: number;
        histogram: number;
    };
    bollingerBands: {
        upper: number;
        middle: number;
        lower: number;
    };
    atr: number;
    obv: number;
}
export interface SmartMoneyFeatures {
    liquidityZones: Array<{
        price: number;
        volume: number;
        strength: number;
        type: 'ACCUMULATION' | 'DISTRIBUTION';
    }>;
    orderBlocks: Array<{
        high: number;
        low: number;
        timestamp: number;
        type: 'BULLISH' | 'BEARISH';
    }>;
    fairValueGaps: Array<{
        upper: number;
        lower: number;
        timestamp: number;
        filled: boolean;
        fillProbability: number;
    }>;
    breakOfStructure: {
        detected: boolean;
        type: 'BULLISH_BOS' | 'BEARISH_BOS';
        strength: number;
        displacement: number;
    };
}
export interface ElliottWaveAnalysis {
    currentWave: {
        type: 'IMPULSE' | 'CORRECTIVE';
        wave: string;
        degree: 'MINUTE' | 'MINOR' | 'INTERMEDIATE' | 'PRIMARY';
    };
    completionProbability: number;
    nextExpectedDirection: 'UP' | 'DOWN' | 'SIDEWAYS';
    waveStructure: Array<{
        wave: string;
        start: number;
        end: number;
        price: number;
        timestamp: number;
    }>;
}
export interface HarmonicPattern {
    type: 'GARTLEY' | 'BAT' | 'BUTTERFLY' | 'CRAB' | 'ABCD';
    points: {
        X: {
            price: number;
            timestamp: number;
        };
        A: {
            price: number;
            timestamp: number;
        };
        B: {
            price: number;
            timestamp: number;
        };
        C: {
            price: number;
            timestamp: number;
        };
        D?: {
            price: number;
            timestamp: number;
        };
    };
    fibonacciLevels: Array<{
        level: number;
        price: number;
        type: 'RETRACEMENT' | 'EXTENSION';
    }>;
    prz: {
        upper: number;
        lower: number;
        confluence: number;
    };
    completionProbability: number;
    reliabilityScore: number;
}
export interface SentimentData {
    symbol: string;
    timestamp: number;
    overallScore: number;
    sources: {
        twitter: number;
        reddit: number;
        news: number;
        fearGreedIndex: number;
        googleTrends: number;
    };
    velocity: number;
    momentum: number;
    newsImpact: Array<{
        headline: string;
        source: string;
        timestamp: number;
        impact: number;
        category: 'REGULATORY' | 'PARTNERSHIP' | 'TECHNICAL' | 'MARKET_ANALYSIS';
    }>;
}
export interface WhaleActivity {
    symbol: string;
    timestamp: number;
    largeTransactions: Array<{
        amount: number;
        direction: 'IN' | 'OUT';
        exchange: string;
        timestamp: number;
        walletCluster?: string;
    }>;
    exchangeFlows: {
        netFlow: number;
        reserves: number;
        reserveChange: number;
    };
    onChainMetrics: {
        activeAddresses: number;
        hodlerBehavior: {
            longTermHolders: number;
            shortTermHolders: number;
            supply: {
                longTerm: number;
                shortTerm: number;
            };
        };
        networkValue: number;
        hashRate?: number;
        stakingMetrics?: {
            totalStaked: number;
            stakingReward: number;
            validatorCount: number;
        };
    };
}
export interface Opportunity {
    id: string;
    symbol: string;
    detectionTime: number;
    patternType: string;
    confidence: number;
    technicalScore: number;
    sentimentScore: number;
    whaleScore: number;
    combinedScore: number;
    targetPrice: number;
    stopLoss: number;
    expectedReturn: number;
    riskReward: number;
    status: 'NEW' | 'MONITORING' | 'TRIGGERED' | 'CLOSED' | 'EXPIRED';
    reasoning: string[];
    similarHistoricalPatterns: Array<{
        timestamp: number;
        outcome: 'SUCCESS' | 'FAILURE';
        actualReturn: number;
    }>;
}
export interface TrainingMetrics {
    epoch: number;
    timestamp: number;
    loss: {
        mse: number;
        mae: number;
        rSquared: number;
    };
    accuracy: {
        directional: number;
        classification: number;
    };
    gradientNorm: number;
    learningRate: number;
    stabilityMetrics: {
        nanCount: number;
        infCount: number;
        resetCount: number;
    };
    explorationStats: {
        epsilon: number;
        explorationRatio: number;
        exploitationRatio: number;
    };
}
export interface BacktestResult {
    strategyName: string;
    startDate: number;
    endDate: number;
    initialCapital: number;
    finalCapital: number;
    totalReturn: number;
    annualizedReturn: number;
    sharpeRatio: number;
    sortinoRatio: number;
    maxDrawdown: number;
    maxDrawdownDuration: number;
    profitFactor: number;
    winRate: number;
    avgWin: number;
    avgLoss: number;
    totalTrades: number;
    var95: number;
    cvar95: number;
    trades: Array<{
        id: string;
        symbol: string;
        entryTime: number;
        exitTime: number;
        entryPrice: number;
        exitPrice: number;
        quantity: number;
        direction: 'LONG' | 'SHORT';
        pnl: number;
        fees: number;
        confidence: number;
        reasoning: string[];
    }>;
}
export interface SystemHealth {
    timestamp: number;
    performance: {
        cpuUsage: number;
        memoryUsage: number;
        diskUsage: number;
    };
    connectivity: {
        binanceStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
        binanceLatency: number;
        databaseStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
        redisStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
    };
    dataQuality: {
        marketDataFreshness: number;
        missingDataPoints: number;
        validationErrors: number;
    };
    aiModel: {
        status: 'TRAINING' | 'READY' | 'ERROR';
        lastTraining: number;
        predictionLatency: number;
        accuracy: number;
    };
}
export interface Alert {
    id: string;
    symbol: string;
    type: 'PRICE' | 'VOLUME' | 'TECHNICAL' | 'AI_SIGNAL' | 'SENTIMENT' | 'WHALE';
    condition: string;
    threshold: number;
    currentValue: number;
    triggered: boolean;
    triggerTime?: number;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    actions: Array<'NOTIFICATION' | 'EMAIL' | 'TELEGRAM' | 'TRADE_SIGNAL'>;
    cooldownPeriod: number;
    lastTriggered?: number;
}
export interface ApiConfig {
    binance: {
        apiKey: string;
        secretKey: string;
        testnet: boolean;
        rateLimits: {
            requestsPerSecond: number;
            dailyLimit: number;
        };
    };
    telegram: {
        botToken: string;
        chatId: string;
    };
    database: {
        path: string;
        encrypted: boolean;
        backupEnabled: boolean;
    };
    redis: {
        host: string;
        port: number;
        password?: string;
    };
}
