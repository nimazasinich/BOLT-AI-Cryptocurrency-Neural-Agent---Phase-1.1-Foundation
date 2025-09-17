import { Logger } from '../core/Logger.js';
export class FeatureEngineering {
    static instance;
    logger = Logger.getInstance();
    constructor() { }
    static getInstance() {
        if (!FeatureEngineering.instance) {
            FeatureEngineering.instance = new FeatureEngineering();
        }
        return FeatureEngineering.instance;
    }
    extractAllFeatures(marketData) {
        if (marketData.length < 50) {
            throw new Error('Insufficient market data for feature extraction');
        }
        const features = [];
        // Basic price features
        features.push(...this.extractPriceFeatures(marketData));
        // Technical indicators
        const technical = this.calculateTechnicalIndicators(marketData);
        features.push(...this.encodeTechnicalIndicators(technical));
        // SMC features
        const smc = this.extractSMCFeatures(marketData);
        features.push(...this.encodeSMCFeatures(smc));
        // Elliott Wave features
        const elliott = this.extractElliottWaveFeatures(marketData);
        features.push(...this.encodeElliottWaveFeatures(elliott));
        // Harmonic pattern features
        const harmonic = this.extractHarmonicFeatures(marketData);
        features.push(...this.encodeHarmonicFeatures(harmonic));
        // Regime features
        features.push(...this.extractRegimeFeatures(marketData));
        this.logger.debug('Features extracted', {
            totalFeatures: features.length,
            dataPoints: marketData.length
        });
        return features;
    }
    extractPriceFeatures(data) {
        const latest = data[data.length - 1];
        const features = [];
        // Current OHLCV
        features.push(latest.open, latest.high, latest.low, latest.close, latest.volume);
        // Returns
        if (data.length >= 2) {
            const prev = data[data.length - 2];
            features.push((latest.close - prev.close) / prev.close);
            features.push(Math.log(latest.close / prev.close));
        }
        else {
            features.push(0, 0);
        }
        // Volatility measures
        const volatility = (latest.high - latest.low) / latest.close;
        features.push(volatility);
        // Volume relative to price
        features.push(latest.volume / latest.close);
        return features;
    }
    calculateTechnicalIndicators(data) {
        const closes = data.map(d => d.close);
        const highs = data.map(d => d.high);
        const lows = data.map(d => d.low);
        const volumes = data.map(d => d.volume);
        return {
            sma: [
                this.calculateSMA(closes, 5),
                this.calculateSMA(closes, 10),
                this.calculateSMA(closes, 20),
                this.calculateSMA(closes, 50)
            ],
            ema: [
                this.calculateEMA(closes, 12),
                this.calculateEMA(closes, 26)
            ],
            rsi: this.calculateRSI(closes, 14),
            macd: this.calculateMACD(closes),
            bollingerBands: this.calculateBollingerBands(closes, 20, 2),
            atr: this.calculateATR(data, 14),
            obv: this.calculateOBV(closes, volumes)
        };
    }
    calculateSMA(values, period) {
        if (values.length < period)
            return values[values.length - 1] || 0;
        const slice = values.slice(-period);
        return slice.reduce((sum, val) => sum + val, 0) / period;
    }
    calculateEMA(values, period) {
        if (values.length === 0)
            return 0;
        if (values.length === 1)
            return values[0];
        const multiplier = 2 / (period + 1);
        let ema = values[0];
        for (let i = 1; i < values.length; i++) {
            ema = (values[i] * multiplier) + (ema * (1 - multiplier));
        }
        return ema;
    }
    calculateRSI(closes, period = 14) {
        if (closes.length < period + 1)
            return 50;
        let gains = 0;
        let losses = 0;
        for (let i = closes.length - period; i < closes.length; i++) {
            const change = closes[i] - closes[i - 1];
            if (change > 0) {
                gains += change;
            }
            else {
                losses -= change;
            }
        }
        const avgGain = gains / period;
        const avgLoss = losses / period;
        if (avgLoss === 0)
            return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }
    calculateMACD(closes) {
        const ema12 = this.calculateEMA(closes, 12);
        const ema26 = this.calculateEMA(closes, 26);
        const macd = ema12 - ema26;
        // Simplified signal line (would use EMA of MACD in production)
        const signal = macd * 0.9;
        const histogram = macd - signal;
        return { macd, signal, histogram };
    }
    calculateBollingerBands(closes, period, stdDev) {
        const middle = this.calculateSMA(closes, period);
        if (closes.length < period) {
            return { upper: middle, middle, lower: middle };
        }
        const slice = closes.slice(-period);
        const variance = slice.reduce((sum, val) => sum + Math.pow(val - middle, 2), 0) / period;
        const standardDeviation = Math.sqrt(variance);
        return {
            upper: middle + (standardDeviation * stdDev),
            middle,
            lower: middle - (standardDeviation * stdDev)
        };
    }
    calculateATR(data, period) {
        if (data.length < period + 1)
            return 0;
        let atr = 0;
        for (let i = data.length - period; i < data.length; i++) {
            const tr = Math.max(data[i].high - data[i].low, Math.abs(data[i].high - data[i - 1].close), Math.abs(data[i].low - data[i - 1].close));
            atr += tr;
        }
        return atr / period;
    }
    calculateOBV(closes, volumes) {
        let obv = 0;
        for (let i = 1; i < closes.length; i++) {
            if (closes[i] > closes[i - 1]) {
                obv += volumes[i];
            }
            else if (closes[i] < closes[i - 1]) {
                obv -= volumes[i];
            }
        }
        return obv;
    }
    encodeTechnicalIndicators(indicators) {
        const features = [];
        features.push(...indicators.sma);
        features.push(...indicators.ema);
        features.push(indicators.rsi);
        features.push(indicators.macd.macd, indicators.macd.signal, indicators.macd.histogram);
        features.push(indicators.bollingerBands.upper, indicators.bollingerBands.middle, indicators.bollingerBands.lower);
        features.push(indicators.atr);
        features.push(indicators.obv);
        return features;
    }
    extractSMCFeatures(data) {
        return {
            liquidityZones: this.detectLiquidityZones(data),
            orderBlocks: this.detectOrderBlocks(data),
            fairValueGaps: this.detectFairValueGaps(data),
            breakOfStructure: this.detectBreakOfStructure(data)
        };
    }
    detectLiquidityZones(data) {
        const zones = [];
        // Simplified liquidity zone detection
        for (let i = 10; i < data.length - 10; i++) {
            const volumeWindow = data.slice(i - 5, i + 5);
            const avgVolume = volumeWindow.reduce((sum, d) => sum + d.volume, 0) / volumeWindow.length;
            if (data[i].volume > avgVolume * 2) {
                const priceChange = (data[i].close - data[i].open) / data[i].open;
                zones.push({
                    price: data[i].close,
                    volume: data[i].volume,
                    strength: Math.abs(priceChange) * data[i].volume,
                    type: priceChange > 0 ? 'ACCUMULATION' : 'DISTRIBUTION'
                });
            }
        }
        return zones.slice(-5); // Return last 5 zones
    }
    detectOrderBlocks(data) {
        const blocks = [];
        // Simplified order block detection
        for (let i = 5; i < data.length - 5; i++) {
            const isHighVolume = data[i].volume > data.slice(i - 5, i + 5).reduce((sum, d) => sum + d.volume, 0) / 10 * 1.5;
            const isSignificantMove = Math.abs(data[i].close - data[i].open) / data[i].open > 0.02;
            if (isHighVolume && isSignificantMove) {
                blocks.push({
                    high: data[i].high,
                    low: data[i].low,
                    timestamp: data[i].timestamp,
                    type: data[i].close > data[i].open ? 'BULLISH' : 'BEARISH'
                });
            }
        }
        return blocks.slice(-3); // Return last 3 blocks
    }
    detectFairValueGaps(data) {
        const gaps = [];
        // Detect price gaps
        for (let i = 1; i < data.length; i++) {
            const prevHigh = data[i - 1].high;
            const prevLow = data[i - 1].low;
            const currentHigh = data[i].high;
            const currentLow = data[i].low;
            // Gap up
            if (currentLow > prevHigh) {
                gaps.push({
                    upper: currentLow,
                    lower: prevHigh,
                    timestamp: data[i].timestamp,
                    filled: false,
                    fillProbability: 0.7 // Historical probability
                });
            }
            // Gap down
            else if (currentHigh < prevLow) {
                gaps.push({
                    upper: prevLow,
                    lower: currentHigh,
                    timestamp: data[i].timestamp,
                    filled: false,
                    fillProbability: 0.7
                });
            }
        }
        return gaps.slice(-3); // Return last 3 gaps
    }
    detectBreakOfStructure(data) {
        if (data.length < 20) {
            return { detected: false, type: 'BULLISH_BOS', strength: 0, displacement: 0 };
        }
        // Find recent highs and lows
        const recentData = data.slice(-20);
        const highs = recentData.map(d => d.high);
        const lows = recentData.map(d => d.low);
        const maxHigh = Math.max(...highs);
        const minLow = Math.min(...lows);
        const currentPrice = data[data.length - 1].close;
        // Check for break of structure
        const highBreak = currentPrice > maxHigh * 1.01; // 1% break
        const lowBreak = currentPrice < minLow * 0.99; // 1% break
        if (highBreak) {
            return {
                detected: true,
                type: 'BULLISH_BOS',
                strength: (currentPrice - maxHigh) / maxHigh,
                displacement: currentPrice - maxHigh
            };
        }
        else if (lowBreak) {
            return {
                detected: true,
                type: 'BEARISH_BOS',
                strength: (minLow - currentPrice) / minLow,
                displacement: minLow - currentPrice
            };
        }
        return { detected: false, type: 'BULLISH_BOS', strength: 0, displacement: 0 };
    }
    encodeSMCFeatures(smc) {
        const features = [];
        // Liquidity zones
        features.push(smc.liquidityZones.length);
        if (smc.liquidityZones.length > 0) {
            const latest = smc.liquidityZones[smc.liquidityZones.length - 1];
            features.push(latest.strength, latest.type === 'ACCUMULATION' ? 1 : 0);
        }
        else {
            features.push(0, 0);
        }
        // Order blocks
        features.push(smc.orderBlocks.length);
        if (smc.orderBlocks.length > 0) {
            const latest = smc.orderBlocks[smc.orderBlocks.length - 1];
            features.push(latest.type === 'BULLISH' ? 1 : 0);
        }
        else {
            features.push(0);
        }
        // Fair value gaps
        features.push(smc.fairValueGaps.length);
        if (smc.fairValueGaps.length > 0) {
            const latest = smc.fairValueGaps[smc.fairValueGaps.length - 1];
            features.push(latest.fillProbability);
        }
        else {
            features.push(0);
        }
        // Break of structure
        features.push(smc.breakOfStructure.detected ? 1 : 0);
        features.push(smc.breakOfStructure.strength);
        features.push(smc.breakOfStructure.type === 'BULLISH_BOS' ? 1 : 0);
        return features;
    }
    extractElliottWaveFeatures(data) {
        // Simplified Elliott Wave analysis
        const waveStructure = this.analyzeWaveStructure(data);
        return {
            currentWave: {
                type: 'IMPULSE',
                wave: '3',
                degree: 'MINOR'
            },
            completionProbability: 0.6,
            nextExpectedDirection: 'UP',
            waveStructure
        };
    }
    analyzeWaveStructure(data) {
        // Simplified wave structure analysis
        const structure = [];
        if (data.length >= 5) {
            const segment = Math.floor(data.length / 5);
            for (let i = 0; i < 5; i++) {
                const start = i * segment;
                const end = Math.min((i + 1) * segment, data.length - 1);
                structure.push({
                    wave: (i + 1).toString(),
                    start,
                    end,
                    price: data[end].close,
                    timestamp: data[end].timestamp
                });
            }
        }
        return structure;
    }
    encodeElliottWaveFeatures(elliott) {
        const features = [];
        features.push(elliott.currentWave.type === 'IMPULSE' ? 1 : 0);
        features.push(parseInt(elliott.currentWave.wave) || 0);
        features.push(elliott.completionProbability);
        features.push(elliott.nextExpectedDirection === 'UP' ? 1 : (elliott.nextExpectedDirection === 'DOWN' ? -1 : 0));
        return features;
    }
    extractHarmonicFeatures(data) {
        const patterns = this.detectHarmonicPatterns(data);
        return { patterns };
    }
    detectHarmonicPatterns(data) {
        // Simplified harmonic pattern detection
        const patterns = [];
        if (data.length >= 50) {
            // Look for potential ABCD pattern
            const pivots = this.findPivotPoints(data);
            if (pivots.length >= 4) {
                const [X, A, B, C] = pivots.slice(-4);
                patterns.push({
                    type: 'ABCD',
                    points: { X, A, B, C },
                    fibonacciLevels: this.calculateFibonacciLevels(X, A, B, C),
                    prz: { upper: C.price * 1.02, lower: C.price * 0.98, confluence: 0.8 },
                    completionProbability: 0.7,
                    reliabilityScore: 0.8
                });
            }
        }
        return patterns;
    }
    findPivotPoints(data) {
        const pivots = [];
        const window = 5;
        for (let i = window; i < data.length - window; i++) {
            const slice = data.slice(i - window, i + window + 1);
            const center = slice[window];
            const isHigh = slice.every((d, idx) => idx === window || d.high <= center.high);
            const isLow = slice.every((d, idx) => idx === window || d.low >= center.low);
            if (isHigh) {
                pivots.push({ price: center.high, timestamp: center.timestamp });
            }
            else if (isLow) {
                pivots.push({ price: center.low, timestamp: center.timestamp });
            }
        }
        return pivots;
    }
    calculateFibonacciLevels(X, A, B, C) {
        const levels = [0.236, 0.382, 0.5, 0.618, 0.786];
        const fibLevels = [];
        const range = Math.abs(A.price - X.price);
        levels.forEach(level => {
            fibLevels.push({
                level,
                price: A.price + (range * level * (A.price > X.price ? -1 : 1)),
                type: 'RETRACEMENT'
            });
        });
        return fibLevels;
    }
    encodeHarmonicFeatures(harmonic) {
        const features = [];
        features.push(harmonic.patterns.length);
        if (harmonic.patterns.length > 0) {
            const latest = harmonic.patterns[harmonic.patterns.length - 1];
            features.push(latest.completionProbability);
            features.push(latest.reliabilityScore);
            features.push(latest.prz.confluence);
        }
        else {
            features.push(0, 0, 0);
        }
        return features;
    }
    extractRegimeFeatures(data) {
        const features = [];
        if (data.length < 20) {
            return [0, 0, 0, 0]; // Default regime features
        }
        // Trend detection
        const sma20 = this.calculateSMA(data.map(d => d.close), 20);
        const currentPrice = data[data.length - 1].close;
        const trendStrength = (currentPrice - sma20) / sma20;
        // Volatility regime
        const returns = [];
        for (let i = 1; i < data.length; i++) {
            returns.push((data[i].close - data[i - 1].close) / data[i - 1].close);
        }
        const volatility = Math.sqrt(returns.reduce((sum, r) => sum + r * r, 0) / returns.length);
        // Volume regime
        const avgVolume = data.reduce((sum, d) => sum + d.volume, 0) / data.length;
        const currentVolume = data[data.length - 1].volume;
        const volumeRatio = currentVolume / avgVolume;
        features.push(trendStrength);
        features.push(volatility);
        features.push(volumeRatio);
        features.push(trendStrength > 0.02 ? 1 : (trendStrength < -0.02 ? -1 : 0)); // Bull/Bear/Neutral regime
        return features;
    }
}
