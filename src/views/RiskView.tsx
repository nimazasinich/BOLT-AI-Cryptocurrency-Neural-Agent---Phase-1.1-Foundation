import React from 'react';
import { Shield, AlertTriangle, TrendingDown } from 'lucide-react';
import { useTheme } from '../components/Theme/ThemeProvider';

export const RiskView: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Risk Management Center
        </h1>
        <p className={`${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Advanced risk analytics with position sizing and portfolio optimization
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${
          theme === 'dark' 
            ? 'bg-white/10 border-blue-800/30' 
            : 'bg-white/80 border-blue-200/50'
        } backdrop-blur-md rounded-xl p-6 border`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <Shield className="w-5 h-5 mr-2 text-green-400" />
            Portfolio Risk
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className={`${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Value at Risk (95%)
                </span>
                <span className="text-red-400">-$2,450</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className={`${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Max Drawdown
                </span>
                <span className="text-orange-400">-12.3%</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className={`${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Sharpe Ratio
                </span>
                <span className="text-green-400">1.45</span>
              </div>
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
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
            Risk Alerts
          </h3>
          <div className="space-y-3">
            <div className={`p-3 rounded-lg ${
              theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-100/50'
            }`}>
              <p className="text-yellow-400 text-sm font-medium">High Correlation</p>
              <p className={`text-xs ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                BTC and ETH correlation at 0.89
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              theme === 'dark' ? 'bg-red-900/20' : 'bg-red-100/50'
            }`}>
              <p className="text-red-400 text-sm font-medium">Position Size</p>
              <p className={`text-xs ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                BTC position exceeds 25% limit
              </p>
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
            <TrendingDown className="w-5 h-5 mr-2 text-red-400" />
            Stress Testing
          </h3>
          <div className="space-y-3">
            <div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                2008 Crisis Scenario
              </p>
              <p className="text-red-400 font-semibold">-34.2%</p>
            </div>
            <div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                COVID-19 Crash
              </p>
              <p className="text-red-400 font-semibold">-28.7%</p>
            </div>
            <div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Flash Crash
              </p>
              <p className="text-red-400 font-semibold">-15.3%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};