import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Brain, 
  Shield, 
  Activity, 
  Settings, 
  Home,
  ChevronLeft,
  Zap
} from 'lucide-react';
import { useNavigation, NavigationView } from './NavigationProvider';
import { useTheme } from '../Theme/ThemeProvider';

interface NavigationItem {
  id: NavigationView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    description: 'System overview and key metrics'
  },
  {
    id: 'charting',
    label: 'Advanced Charting',
    icon: TrendingUp,
    description: 'TradingView-style charts with AI overlays'
  },
  {
    id: 'training',
    label: 'AI Training',
    icon: Brain,
    description: 'Neural network training dashboard'
  },
  {
    id: 'risk',
    label: 'Risk Center',
    icon: Shield,
    description: 'Risk management and portfolio analysis'
  },
  {
    id: 'backtest',
    label: 'Backtesting',
    icon: BarChart3,
    description: 'Strategy validation and performance'
  },
  {
    id: 'health',
    label: 'System Health',
    icon: Activity,
    description: 'Monitoring and diagnostics'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    description: 'Configuration and preferences'
  }
];

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, goBack, canGoBack } = useNavigation();
  const { theme } = useTheme();

  return (
    <div className={`w-64 h-full ${
      theme === 'dark' 
        ? 'bg-gray-900/95 border-gray-800' 
        : 'bg-white/95 border-gray-200'
    } backdrop-blur-md border-r flex flex-col`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-800/30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              BOLT AI
            </h1>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
            }`}>
              Neural Agent
            </p>
          </div>
        </div>

        {/* Back Button */}
        {canGoBack && (
          <button
            onClick={goBack}
            className={`mt-4 flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : theme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className={`w-5 h-5 ${
                isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'
              }`} />
              <div className="flex-1 text-left">
                <div className={`font-medium ${isActive ? 'text-white' : ''}`}>
                  {item.label}
                </div>
                <div className={`text-xs ${
                  isActive 
                    ? 'text-blue-100' 
                    : theme === 'dark' 
                      ? 'text-gray-400' 
                      : 'text-gray-500'
                }`}>
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`p-4 border-t ${
        theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
      }`}>
        <div className={`text-xs ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        } text-center`}>
          Phase 1.3 Complete
          <br />
          Foundation & Infrastructure
        </div>
      </div>
    </div>
  );
};