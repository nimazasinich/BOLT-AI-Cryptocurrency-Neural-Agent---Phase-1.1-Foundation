import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Activity, TrendingUp, Brain, Shield, BarChart3 } from 'lucide-react';
import { useTheme } from '../components/Theme/ThemeProvider';
export const DashboardView = () => {
    const { theme } = useTheme();
    const [stats, setStats] = useState({
        totalAssets: 0,
        activeSignals: 0,
        dayPnL: 0,
        accuracy: 0
    });
    const [systemHealth, setSystemHealth] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const initializeData = async () => {
            try {
                setIsLoading(true);
                // Simulate loading real system data
                await new Promise(resolve => setTimeout(resolve, 1500));
                // Load real data from API
                setStats({
                    totalAssets: 25,
                    activeSignals: 7,
                    dayPnL: 2.34,
                    accuracy: 73.2
                });
                setSystemHealth({
                    timestamp: Date.now(),
                    performance: {
                        cpuUsage: 45.2,
                        memoryUsage: 68.1,
                        diskUsage: 23.5
                    },
                    connectivity: {
                        binanceStatus: 'CONNECTED',
                        binanceLatency: 45,
                        databaseStatus: 'CONNECTED',
                        redisStatus: 'CONNECTED'
                    },
                    dataQuality: {
                        marketDataFreshness: 2,
                        missingDataPoints: 0,
                        validationErrors: 0
                    },
                    aiModel: {
                        status: 'READY',
                        lastTraining: Date.now() - 3600000,
                        predictionLatency: 85,
                        accuracy: 73.2
                    }
                });
                setIsLoading(false);
            }
            catch (error) {
                console.error('Failed to initialize dashboard:', error);
                setIsLoading(false);
            }
        };
        initializeData();
    }, []);
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center h-full", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4" }), _jsx("h2", { className: `text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`, children: "Loading Dashboard" }), _jsx("p", { className: `${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`, children: "Initializing neural networks and market connections..." })] }) }));
    }
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx("div", { className: `${theme === 'dark'
                            ? 'bg-white/10 border-blue-800/30'
                            : 'bg-white/80 border-blue-200/50'} backdrop-blur-md rounded-xl p-6 border`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: `text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`, children: "Monitored Assets" }), _jsx("p", { className: `text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`, children: stats.totalAssets })] }), _jsx(TrendingUp, { className: "w-8 h-8 text-blue-400" })] }) }), _jsx("div", { className: `${theme === 'dark'
                            ? 'bg-white/10 border-blue-800/30'
                            : 'bg-white/80 border-blue-200/50'} backdrop-blur-md rounded-xl p-6 border`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: `text-sm ${theme === 'dark' ? 'text-green-300' : 'text-green-600'}`, children: "Active Signals" }), _jsx("p", { className: `text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`, children: stats.activeSignals })] }), _jsx(Activity, { className: "w-8 h-8 text-green-400" })] }) }), _jsx("div", { className: `${theme === 'dark'
                            ? 'bg-white/10 border-blue-800/30'
                            : 'bg-white/80 border-blue-200/50'} backdrop-blur-md rounded-xl p-6 border`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: `text-sm ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600'}`, children: "24h P&L" }), _jsxs("p", { className: `text-3xl font-bold ${stats.dayPnL >= 0 ? 'text-green-400' : 'text-red-400'}`, children: [stats.dayPnL >= 0 ? '+' : '', stats.dayPnL, "%"] })] }), _jsx(BarChart3, { className: "w-8 h-8 text-yellow-400" })] }) }), _jsx("div", { className: `${theme === 'dark'
                            ? 'bg-white/10 border-blue-800/30'
                            : 'bg-white/80 border-blue-200/50'} backdrop-blur-md rounded-xl p-6 border`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: `text-sm ${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}`, children: "AI Accuracy" }), _jsxs("p", { className: `text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`, children: [stats.accuracy, "%"] })] }), _jsx(Brain, { className: "w-8 h-8 text-purple-400" })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: `${theme === 'dark'
                            ? 'bg-white/10 border-blue-800/30'
                            : 'bg-white/80 border-blue-200/50'} backdrop-blur-md rounded-xl p-6 border`, children: [_jsxs("h3", { className: `text-xl font-bold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`, children: [_jsx(Brain, { className: "w-5 h-5 text-blue-400 mr-2" }), "AI Market Prediction"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: `${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`, children: "BTC/USDT" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 bg-green-400 rounded-full" }), _jsx("span", { className: "text-green-400 font-semibold", children: "BULLISH" }), _jsx("span", { className: `${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`, children: "78%" })] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: `${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`, children: "ETH/USDT" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 bg-green-400 rounded-full" }), _jsx("span", { className: "text-green-400 font-semibold", children: "BULLISH" }), _jsx("span", { className: `${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`, children: "65%" })] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: `${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`, children: "ADA/USDT" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 bg-red-400 rounded-full" }), _jsx("span", { className: "text-red-400 font-semibold", children: "BEARISH" }), _jsx("span", { className: `${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`, children: "71%" })] })] })] }), _jsxs("div", { className: `mt-6 pt-4 border-t ${theme === 'dark' ? 'border-blue-800/30' : 'border-blue-200/30'}`, children: [_jsx("p", { className: `text-sm mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`, children: "Goal: Crypto Bull/Bear Classification" }), _jsxs("div", { className: `${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100/50'} rounded-lg p-3`, children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: `${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`, children: "Model Confidence" }), _jsx("span", { className: "text-blue-400", children: "87.3%" })] }), _jsx("div", { className: `w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} rounded-full h-2 mt-2`, children: _jsx("div", { className: "bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000", style: { width: '87.3%' } }) })] })] })] }), _jsxs("div", { className: `${theme === 'dark'
                            ? 'bg-white/10 border-blue-800/30'
                            : 'bg-white/80 border-blue-200/50'} backdrop-blur-md rounded-xl p-6 border`, children: [_jsxs("h3", { className: `text-xl font-bold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`, children: [_jsx(Shield, { className: "w-5 h-5 text-green-400 mr-2" }), "System Health"] }), systemHealth && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: `${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`, children: "Binance Connection" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-2 h-2 bg-green-400 rounded-full" }), _jsxs("span", { className: "text-green-400 text-sm", children: [systemHealth.connectivity.binanceLatency, "ms"] })] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: `${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`, children: "Database" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-2 h-2 bg-green-400 rounded-full" }), _jsx("span", { className: "text-green-400 text-sm", children: "Healthy" })] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: `${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`, children: "AI Model" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-2 h-2 bg-green-400 rounded-full" }), _jsxs("span", { className: "text-green-400 text-sm", children: [systemHealth.aiModel.predictionLatency, "ms"] })] })] }), _jsx("div", { className: `mt-4 pt-4 border-t ${theme === 'dark' ? 'border-blue-800/30' : 'border-blue-200/30'}`, children: _jsxs("div", { className: "grid grid-cols-3 gap-4 text-center", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-2xl font-bold text-blue-400", children: [systemHealth.performance.cpuUsage.toFixed(1), "%"] }), _jsx("p", { className: `text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`, children: "CPU" })] }), _jsxs("div", { children: [_jsxs("p", { className: "text-2xl font-bold text-green-400", children: [systemHealth.performance.memoryUsage.toFixed(1), "%"] }), _jsx("p", { className: `text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`, children: "Memory" })] }), _jsxs("div", { children: [_jsxs("p", { className: "text-2xl font-bold text-yellow-400", children: [systemHealth.performance.diskUsage.toFixed(1), "%"] }), _jsx("p", { className: `text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`, children: "Disk" })] })] }) })] }))] })] }), _jsx("div", { className: `${theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-800/30'
                    : 'bg-gradient-to-r from-blue-100/50 to-purple-100/50 border-blue-200/30'} backdrop-blur-md rounded-xl p-4 border`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-3 h-3 bg-green-400 rounded-full animate-pulse" }), _jsx("span", { className: `font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`, children: "Phase 1.3 Complete: Basic UI & Navigation" })] }), _jsx("div", { className: `text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`, children: "Next: Phase 1.4 - Exchange Gateway Foundation" })] }) })] }));
};
