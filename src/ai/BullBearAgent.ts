import { Logger } from '../core/Logger.js';
import { TrainingEngine } from './TrainingEngine.js';
import { ExplorationStrategies } from './ExplorationStrategies.js';
import { MarketData } from '../types/index.js';

export interface BullBearPrediction {
  probabilities: {
    bull: number;
    bear: number;
    neutral: number;
  };
  confidence: number;
  action: 'LONG' | 'SHORT' | 'HOLD';
  reasoning: string[];
  features: number[];
  uncertainty: number;
}

export interface GoalConfig {
  type: 'crypto_bull_bear' | 'volatility_prediction' | 'regime_classification';
  thresholds: {
    enterLong: number;
    enterShort: number;
    abstain: number;
  };
  riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class BullBearAgent {
  private static instance: BullBearAgent;
  private logger = Logger.getInstance();
  private trainingEngine = TrainingEngine.getInstance();
  private exploration = ExplorationStrategies.getInstance();

  private goalConfig: GoalConfig = {
    type: 'crypto_bull_bear',
    thresholds: {
      enterLong: 0.6,
      enterShort: 0.6,
      abstain: 0.5
    },
    riskTolerance: 'MEDIUM'
  };

  private isInitialized = false;
  private mcDropoutSamples = 20;

  private constructor() {}

  static getInstance(): BullBearAgent {
    if (!BullBearAgent.instance) {
      BullBearAgent.instance = new BullBearAgent();
    }
    return BullBearAgent.instance;
  }

  async initialize(): Promise<void> {
    try {
      await this.trainingEngine.initializeNetwork('hybrid', 50, 3); // 50 features, 3 outputs (bull/bear/neutral)
      this.isInitialized = true;
      this.logger.info('Bull/Bear agent initialized', {
        goalType: this.goalConfig.type,
        thresholds: this.goalConfig.thresholds
      });
    } catch (error) {
      this.logger.error('Failed to initialize Bull/Bear agent', {}, error as Error);
      throw error;
    }
  }

  updateGoalConfig(config: Partial<GoalConfig>): void {
    this.goalConfig = { ...this.goalConfig, ...config };
    this.logger.info('Goal configuration updated', this.goalConfig);
  }

  async predict(marketData: MarketData[], currentGoal?: string): Promise<BullBearPrediction> {
    if (!this.isInitialized) {
      throw new Error('Bull/Bear agent not initialized');
    }

    try {
      // Extract features from market data
      const features = this.extractFeatures(marketData);
      
      // Perform Monte Carlo Dropout for uncertainty quantification
      const mcPredictions = await this.performMCDropout(features);
      
      // Calculate mean probabilities and uncertainty
      const meanProbs = this.calculateMeanProbabilities(mcPredictions);
      const uncertainty = this.calculateUncertainty(mcPredictions);
      
      // Determine action based on probabilities and thresholds
      const action = this.determineAction(meanProbs);
      
      // Generate reasoning
      const reasoning = this.generateReasoning(features, meanProbs, action);
      
      // Calculate confidence (inverse of uncertainty)
      const confidence = Math.max(0, 1 - uncertainty);

      const prediction: BullBearPrediction = {
        probabilities: meanProbs,
        confidence,
        action,
        reasoning,
        features,
        uncertainty
      };

      this.logger.debug('Bull/Bear prediction generated', {
        action,
        bullProb: meanProbs.bull.toFixed(3),
        bearProb: meanProbs.bear.toFixed(3),
        confidence: confidence.toFixed(3),
        uncertainty: uncertainty.toFixed(3)
      });

      return prediction;
    } catch (error) {
      this.logger.error('Failed to generate prediction', {}, error as Error);
      throw error;
    }
  }

  private extractFeatures(marketData: MarketData[]): number[] {
    if (marketData.length === 0) {
      throw new Error('No market data provided');
    }

    const latest = marketData[marketData.length - 1];
    const features: number[] = [];

    // Price features
    features.push(latest.close);
    features.push(latest.high);
    features.push(latest.low);
    features.push(latest.volume);

    // Technical indicators (simplified)
    if (marketData.length >= 20) {
      // Simple moving averages
      const sma5 = this.calculateSMA(marketData.slice(-5));
      const sma20 = this.calculateSMA(marketData.slice(-20));
      features.push(sma5, sma20);
      
      // Price relative to moving averages
      features.push(latest.close / sma5);
      features.push(latest.close / sma20);
      
      // Volatility (ATR approximation)
      const atr = this.calculateATR(marketData.slice(-14));
      features.push(atr);
      
      // Volume relative to average
      const avgVolume = marketData.slice(-20).reduce((sum, d) => sum + d.volume, 0) / 20;
      features.push(latest.volume / avgVolume);
    }

    // Returns
    if (marketData.length >= 2) {
      const prevClose = marketData[marketData.length - 2].close;
      features.push((latest.close - prevClose) / prevClose);
    }

    // Pad features to fixed size (50)
    while (features.length < 50) {
      features.push(0);
    }

    return features.slice(0, 50);
  }

  private calculateSMA(data: MarketData[]): number {
    return data.reduce((sum, d) => sum + d.close, 0) / data.length;
  }

  private calculateATR(data: MarketData[]): number {
    if (data.length < 2) return 0;
    
    let atr = 0;
    for (let i = 1; i < data.length; i++) {
      const tr = Math.max(
        data[i].high - data[i].low,
        Math.abs(data[i].high - data[i - 1].close),
        Math.abs(data[i].low - data[i - 1].close)
      );
      atr += tr;
    }
    return atr / (data.length - 1);
  }

  private async performMCDropout(features: number[]): Promise<number[][]> {
    const predictions: number[][] = [];
    
    for (let i = 0; i < this.mcDropoutSamples; i++) {
      // Simulate neural network forward pass with dropout
      const prediction = this.simulateForwardPass(features);
      predictions.push(prediction);
    }
    
    return predictions;
  }

  private simulateForwardPass(features: number[]): number[] {
    // Simulate neural network prediction (would be actual network in production)
    const noise = () => (Math.random() - 0.5) * 0.1;
    
    // Base probabilities with some logic
    const priceChange = features[10] || 0; // Return feature
    const volumeRatio = features[9] || 1; // Volume ratio
    
    let bullProb = 0.33 + priceChange * 2 + (volumeRatio - 1) * 0.1 + noise();
    let bearProb = 0.33 - priceChange * 2 - (volumeRatio - 1) * 0.1 + noise();
    let neutralProb = 0.34 + noise();
    
    // Normalize probabilities
    const total = bullProb + bearProb + neutralProb;
    return [bullProb / total, bearProb / total, neutralProb / total];
  }

  private calculateMeanProbabilities(predictions: number[][]): { bull: number; bear: number; neutral: number } {
    const mean = predictions.reduce(
      (acc, pred) => ({
        bull: acc.bull + pred[0],
        bear: acc.bear + pred[1],
        neutral: acc.neutral + pred[2]
      }),
      { bull: 0, bear: 0, neutral: 0 }
    );

    const count = predictions.length;
    return {
      bull: mean.bull / count,
      bear: mean.bear / count,
      neutral: mean.neutral / count
    };
  }

  private calculateUncertainty(predictions: number[][]): number {
    // Calculate variance across MC samples
    const mean = this.calculateMeanProbabilities(predictions);
    
    let variance = 0;
    for (const pred of predictions) {
      variance += Math.pow(pred[0] - mean.bull, 2);
      variance += Math.pow(pred[1] - mean.bear, 2);
      variance += Math.pow(pred[2] - mean.neutral, 2);
    }
    
    return Math.sqrt(variance / (predictions.length * 3));
  }

  private determineAction(probabilities: { bull: number; bear: number; neutral: number }): 'LONG' | 'SHORT' | 'HOLD' {
    const { bull, bear, neutral } = probabilities;
    const { enterLong, enterShort, abstain } = this.goalConfig.thresholds;

    if (bull > enterLong && bull > bear && bull > neutral) {
      return 'LONG';
    } else if (bear > enterShort && bear > bull && bear > neutral) {
      return 'SHORT';
    } else {
      return 'HOLD';
    }
  }

  private generateReasoning(features: number[], probabilities: { bull: number; bear: number; neutral: number }, action: string): string[] {
    const reasoning: string[] = [];
    
    reasoning.push(`Bull probability: ${(probabilities.bull * 100).toFixed(1)}%`);
    reasoning.push(`Bear probability: ${(probabilities.bear * 100).toFixed(1)}%`);
    reasoning.push(`Neutral probability: ${(probabilities.neutral * 100).toFixed(1)}%`);
    
    if (action === 'LONG') {
      reasoning.push('Strong bullish signal detected');
      reasoning.push('Price momentum and volume support upward movement');
    } else if (action === 'SHORT') {
      reasoning.push('Strong bearish signal detected');
      reasoning.push('Price momentum and volume indicate downward pressure');
    } else {
      reasoning.push('Uncertain market conditions');
      reasoning.push('Waiting for clearer directional signal');
    }
    
    // Add technical reasoning based on features
    const priceChange = features[10] || 0;
    if (Math.abs(priceChange) > 0.02) {
      reasoning.push(`Significant price movement: ${(priceChange * 100).toFixed(2)}%`);
    }
    
    const volumeRatio = features[9] || 1;
    if (volumeRatio > 1.5) {
      reasoning.push('Above-average volume confirms price movement');
    } else if (volumeRatio < 0.5) {
      reasoning.push('Below-average volume suggests weak conviction');
    }
    
    return reasoning;
  }

  async trainOnMarketData(marketData: MarketData[], labels: number[]): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Bull/Bear agent not initialized');
    }

    try {
      // Add market data to experience buffer
      const actions = labels.map(label => label > 0 ? 1 : (label < 0 ? 2 : 0)); // 0=hold, 1=long, 2=short
      const rewards = labels.map(label => label); // Use labels as rewards
      
      this.trainingEngine.experienceBuffer.addMarketDataExperiences(marketData, actions, rewards);
      
      // Train for one epoch
      const metrics = await this.trainingEngine.trainEpoch();
      
      this.logger.info('Training completed on market data', {
        dataPoints: marketData.length,
        avgLoss: metrics[metrics.length - 1]?.loss.mse.toFixed(6),
        avgAccuracy: metrics[metrics.length - 1]?.accuracy.directional.toFixed(3)
      });
    } catch (error) {
      this.logger.error('Failed to train on market data', {}, error as Error);
      throw error;
    }
  }

  getModelStatistics(): {
    isInitialized: boolean;
    isTraining: boolean;
    trainingState: any;
    experienceBufferSize: number;
  } {
    return {
      isInitialized: this.isInitialized,
      isTraining: this.trainingEngine.isTraining(),
      trainingState: this.trainingEngine.getTrainingState(),
      experienceBufferSize: this.trainingEngine.experienceBuffer.getStatistics().size
    };
  }
}