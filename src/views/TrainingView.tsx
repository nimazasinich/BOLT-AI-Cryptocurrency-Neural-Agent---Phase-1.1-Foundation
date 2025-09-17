import React from 'react';
import { Brain, Activity, TrendingUp } from 'lucide-react';
import { Brain, Activity, TrendingUp } from 'lucide-react';
import { useTheme } from '../components/Theme/ThemeProvider';

export const TrainingView: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          AI Training Dashboard
        </h1>
        <p className={`${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Neural network training with real-time metrics and stability monitoring
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${
          theme === 'dark' 
            ? 'bg-white/10 border-blue-800/30' 
            : 'bg-white/80 border-blue-200/50'
        } backdrop-blur-md rounded-xl p-6 border`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <Brain className="w-5 h-5 mr-2 text-purple-400" />
            Training Progress
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className={`${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Current Epoch
                </span>
                <span className="text-purple-400">245/1000</span>
              </div>
              <div className={`w-full ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
              } rounded-full h-2`}>
                <div className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full" style={{ width: '24.5%' }}></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Loss (MSE)
                </p>
                <p className="text-xl font-bold text-blue-400">0.0234</p>
              </div>
              <div>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Accuracy
                </p>
                <p className="text-xl font-bold text-green-400">73.2%</p>
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
            <Activity className="w-5 h-5 mr-2 text-green-400" />
            Stability Monitor
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Gradient Norm
              </span>
              <span className="text-green-400">0.85</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Learning Rate
              </span>
              <span className="text-blue-400">0.001</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Reset Count
              </span>
              <span className="text-yellow-400">2</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`mt-6 ${
        theme === 'dark' 
          ? 'bg-white/10 border-blue-800/30' 
          : 'bg-white/80 border-blue-200/50'
      } backdrop-blur-md rounded-xl p-6 border`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
          Training Metrics
        </h3>
        <div className="h-64 flex items-center justify-center">
          <p className={`${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Training metrics visualization will be implemented in Phase 2
          </p>
        </div>
      </div>
    </div>
  );
};