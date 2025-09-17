import React from 'react';
import { BarChart3, TrendingUp, DollarSign } from 'lucide-react';
import { useTheme } from '../components/Theme/ThemeProvider';

export const BacktestView: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Strategy Backtesting
        </h1>
        <p className={`${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Strategy validation and performance analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className={`${
          theme === 'dark' 
            ? 'bg-white/10 border-blue-800/30' 
            : 'bg-white/80 border-blue-200/50'
        } backdrop-blur-md rounded-xl p-6 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Total Return
              </p>
              <p className="text-2xl font-bold text-green-400">+127.3%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className={`${
          theme === 'dark' 
            ? 'bg-white/10 border-blue-800/30' 
            : 'bg-white/80 border-blue-200/50'
        } backdrop-blur-md rounded-xl p-6 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Sharpe Ratio
              </p>
              <p className="text-2xl font-bold text-blue-400">1.85</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className={`${
          theme === 'dark' 
            ? 'bg-white/10 border-blue-800/30' 
            : 'bg-white/80 border-blue-200/50'
        } backdrop-blur-md rounded-xl p-6 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Max Drawdown
              </p>
              <p className="text-2xl font-bold text-red-400">-8.7%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-red-400 transform rotate-180" />
          </div>
        </div>

        <div className={`${
          theme === 'dark' 
            ? 'bg-white/10 border-blue-800/30' 
            : 'bg-white/80 border-blue-200/50'
        } backdrop-blur-md rounded-xl p-6 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Win Rate
              </p>
              <p className="text-2xl font-bold text-purple-400">68.4%</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      <div className={`${
        theme === 'dark' 
          ? 'bg-white/10 border-blue-800/30' 
          : 'bg-white/80 border-blue-200/50'
      } backdrop-blur-md rounded-xl p-6 border`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Equity Curve
        </h3>
        <div className="h-64 flex items-center justify-center">
          <p className={`${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Backtesting engine will be implemented in Phase 4
          </p>
        </div>
      </div>
    </div>
  );
};