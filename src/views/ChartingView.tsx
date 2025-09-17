import React from 'react';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';
import { useTheme } from '../components/Theme/ThemeProvider';

export const ChartingView: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Advanced Charting
        </h1>
        <p className={`${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          TradingView-style charts with AI overlays and pattern recognition
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2">
          <div className={`${
            theme === 'dark' 
              ? 'bg-white/10 border-blue-800/30' 
              : 'bg-white/80 border-blue-200/50'
          } backdrop-blur-md rounded-xl p-6 border h-96`}>
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <TrendingUp className={`w-16 h-16 mx-auto mb-4 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                }`} />
                <h3 className={`text-xl font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Interactive Chart
                </h3>
                <p className={`${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Advanced charting engine will be implemented in Phase 2
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Controls */}
        <div className="space-y-6">
          <div className={`${
            theme === 'dark' 
              ? 'bg-white/10 border-blue-800/30' 
              : 'bg-white/80 border-blue-200/50'
          } backdrop-blur-md rounded-xl p-6 border`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
              Chart Settings
            </h3>
            <div className="space-y-3">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Timeframe
                </label>
                <select className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}>
                  <option>1m</option>
                  <option>5m</option>
                  <option>15m</option>
                  <option>1h</option>
                  <option>4h</option>
                  <option>1d</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Chart Type
                </label>
                <select className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}>
                  <option>Candlestick</option>
                  <option>Line</option>
                  <option>Area</option>
                  <option>Heikin-Ashi</option>
                </select>
              </div>
            </div>
          </div>

          <div className={`${
            theme === 'dark' 
              ? 'bg-white/10 border-blue-800/30' 
              : 'bg-white/80 border-blue-200/50'
          } backdrop-blur-md rounded-xl p-6 border`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Activity className="w-5 h-5 mr-2 text-green-400" />
              Indicators
            </h3>
            <div className="space-y-2">
              {['Moving Averages', 'RSI', 'MACD', 'Bollinger Bands', 'Volume'].map((indicator) => (
                <label key={indicator} className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2 rounded"
                    defaultChecked={indicator === 'Moving Averages'}
                  />
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {indicator}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};