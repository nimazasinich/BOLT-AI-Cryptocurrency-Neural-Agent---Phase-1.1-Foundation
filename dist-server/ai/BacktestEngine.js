import { Logger } from '../core/Logger.js';
import { BullBearAgent } from './BullBearAgent.js';
export class BacktestEngine {
    static instance;
    logger = Logger.getInstance();
    bullBearAgent = BullBearAgent.getInstance();
    constructor() { }
    static getInstance() {
        if (!BacktestEngine.instance) {
            BacktestEngine.instance = new BacktestEngine();
        }
        return BacktestEngine.instance;
    }
    async runBacktest(marketData, config) {
        const trades = [];
        let currentCapital = config.initialCapital;
        let currentPosition = null;
        this.logger.info('Starting backtest', {
            dataPoints: marketData.length,
            startDate: new Date(config.startDate).toISOString(),
            endDate: new Date(config.endDate).toISOString(),
            initialCapital: config.initialCapital
        });
        for (let i = 50; i < marketData.length; i++) {
            const currentData = marketData.slice(0, i + 1);
            const currentBar = marketData[i];
            try {
                // Get AI prediction
                const prediction = await this.bullBearAgent.predict(currentData.slice(-100));
                // Execute trading logic
                if (!currentPosition && prediction.action !== 'HOLD') {
                    // Enter position
                    const positionSize = Math.min(currentCapital * config.maxPositionSize, currentCapital * 0.1 // Max 10% per trade
                    );
                    const quantity = positionSize / currentBar.close;
                    const fees = positionSize * config.feeRate;
                    const slippage = positionSize * config.slippageRate;
                    currentPosition = {
                        symbol: currentBar.symbol,
                        quantity: prediction.action === 'LONG' ? quantity : -quantity,
                        entryPrice: currentBar.close * (1 + (prediction.action === 'LONG' ? config.slippageRate : -config.slippageRate)),
                        entryTime: currentBar.timestamp
                    };
                    currentCapital -= fees + slippage;
                }
                else if (currentPosition && (prediction.action === 'HOLD' ||
                    (currentPosition.quantity > 0 && prediction.action === 'SHORT') ||
                    (currentPosition.quantity < 0 && prediction.action === 'LONG'))) {
                    // Exit position
                    const exitPrice = currentBar.close * (1 + (currentPosition.quantity > 0 ? -config.slippageRate : config.slippageRate));
                    const positionValue = Math.abs(currentPosition.quantity) * exitPrice;
                    const fees = positionValue * config.feeRate;
                    const slippage = positionValue * config.slippageRate;
                    const pnl = currentPosition.quantity > 0
                        ? (exitPrice - currentPosition.entryPrice) * currentPosition.quantity
                        : (currentPosition.entryPrice - exitPrice) * Math.abs(currentPosition.quantity);
                    const trade = {
                        id: `trade_${trades.length + 1}`,
                        symbol: currentPosition.symbol,
                        entryTime: currentPosition.entryTime,
                        exitTime: currentBar.timestamp,
                        entryPrice: currentPosition.entryPrice,
                        exitPrice,
                        quantity: currentPosition.quantity,
                        direction: currentPosition.quantity > 0 ? 'LONG' : 'SHORT',
                        pnl: pnl - fees - slippage,
                        fees: fees + slippage,
                        confidence: prediction.confidence,
                        reasoning: prediction.reasoning
                    };
                    trades.push(trade);
                    currentCapital += pnl - fees - slippage;
                    currentPosition = null;
                }
            }
            catch (error) {
                this.logger.error('Error during backtest step', { index: i }, error);
                continue;
            }
        }
        // Calculate performance metrics
        const result = this.calculatePerformanceMetrics(trades, config.initialCapital, currentCapital);
        this.logger.info('Backtest completed', {
            totalTrades: trades.length,
            finalCapital: currentCapital,
            totalReturn: result.totalReturn,
            sharpeRatio: result.sharpeRatio
        });
        return result;
    }
    calculatePerformanceMetrics(trades, initialCapital, finalCapital) {
        if (trades.length === 0) {
            return {
                strategyName: 'Bull/Bear AI Strategy',
                startDate: Date.now(),
                endDate: Date.now(),
                initialCapital,
                finalCapital,
                totalReturn: 0,
                annualizedReturn: 0,
                sharpeRatio: 0,
                sortinoRatio: 0,
                maxDrawdown: 0,
                maxDrawdownDuration: 0,
                profitFactor: 0,
                winRate: 0,
                avgWin: 0,
                avgLoss: 0,
                totalTrades: 0,
                var95: 0,
                cvar95: 0,
                trades
            };
        }
        const totalReturn = (finalCapital - initialCapital) / initialCapital;
        const returns = trades.map(t => t.pnl / initialCapital);
        const winningTrades = trades.filter(t => t.pnl > 0);
        const losingTrades = trades.filter(t => t.pnl < 0);
        // Calculate metrics
        const winRate = winningTrades.length / trades.length;
        const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length : 0;
        const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length) : 0;
        const profitFactor = avgLoss > 0 ? (avgWin * winningTrades.length) / (avgLoss * losingTrades.length) : 0;
        // Sharpe ratio calculation
        const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const returnStd = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length);
        const sharpeRatio = returnStd > 0 ? avgReturn / returnStd : 0;
        // Max drawdown calculation
        let peak = initialCapital;
        let maxDrawdown = 0;
        let currentCapital = initialCapital;
        for (const trade of trades) {
            currentCapital += trade.pnl;
            if (currentCapital > peak) {
                peak = currentCapital;
            }
            const drawdown = (peak - currentCapital) / peak;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        }
        // VaR calculation (95% confidence)
        const sortedReturns = returns.sort((a, b) => a - b);
        const var95Index = Math.floor(returns.length * 0.05);
        const var95 = sortedReturns[var95Index] || 0;
        const cvar95 = sortedReturns.slice(0, var95Index + 1).reduce((sum, r) => sum + r, 0) / (var95Index + 1);
        const daysDiff = (trades[trades.length - 1].exitTime - trades[0].entryTime) / (1000 * 60 * 60 * 24);
        const annualizedReturn = Math.pow(1 + totalReturn, 365 / daysDiff) - 1;
        return {
            strategyName: 'Bull/Bear AI Strategy',
            startDate: trades[0].entryTime,
            endDate: trades[trades.length - 1].exitTime,
            initialCapital,
            finalCapital,
            totalReturn,
            annualizedReturn,
            sharpeRatio,
            sortinoRatio: sharpeRatio, // Simplified
            maxDrawdown,
            maxDrawdownDuration: 0, // Would need more complex calculation
            profitFactor,
            winRate,
            avgWin,
            avgLoss,
            totalTrades: trades.length,
            var95,
            cvar95,
            trades
        };
    }
}
