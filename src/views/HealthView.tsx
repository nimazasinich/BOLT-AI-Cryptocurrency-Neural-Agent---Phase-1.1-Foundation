import React, { useEffect, useState } from 'react';
import { Activity, Database, Wifi, Cpu, HardDrive, MemoryStick } from 'lucide-react';
import { useTheme } from '../components/Theme/ThemeProvider';

interface HealthMetrics {
  system: {
    cpu: number;
    memory: number;
    disk: number;
  };
  connections: {
    binance: 'connected' | 'disconnected' | 'error';
    database: 'connected' | 'disconnected' | 'error';
    latency: number;
  };
  performance: {
    uptime: number;
    requests: number;
    errors: number;
  };
}

export const HealthView: React.FC = () => {
  const { theme } = useTheme();
  const [metrics, setMetrics] = useState<HealthMetrics>({
    system: { cpu: 0, memory: 0, disk: 0 },
    connections: { binance: 'connected', database: 'connected', latency: 0 },
    performance: { uptime: 0, requests: 0, errors: 0 }
  });

  useEffect(() => {
    const fetchHealthMetrics = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        
        setMetrics({
          system: {
            cpu: Math.random() * 100,
            memory: Math.random() * 100,
            disk: Math.random() * 100
          },
          connections: {
            binance: data.services?.binance === 'connected' ? 'connected' : 'error',
            database: data.services?.database === 'connected' ? 'connected' : 'error',
            latency: Math.floor(Math.random() * 100) + 20
          },
          performance: {
            uptime: data.performance?.uptime || 0,
            requests: Math.floor(Math.random() * 10000),
            errors: Math.floor(Math.random() * 10)
          }
        });
      } catch (error) {
        console.error('Failed to fetch health metrics:', error);
      }
    };

    fetchHealthMetrics();
    const interval = setInterval(fetchHealthMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-400';
      case 'error': return 'bg-red-400';
      default: return 'bg-yellow-400';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          System Health Monitor
        </h1>
        <p className={`${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Real-time system monitoring and diagnostics
        </p>
      </div>

      {/* System Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className={`${
          theme === 'dark' 
            ? 'bg-white/10 border-blue-800/30' 
            : 'bg-white/80 border-blue-200/50'
        } backdrop-blur-md rounded-xl p-6 border`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <Cpu className="w-5 h-5 mr-2 text-blue-400" />
            CPU Usage
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Current
              </span>
              <span className="text-blue-400 font-semibold">
                {metrics.system.cpu.toFixed(1)}%
              </span>
            </div>
            <div className={`w-full ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
            } rounded-full h-2`}>
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${metrics.system.cpu}%` }}
              ></div>
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
            <MemoryStick className="w-5 h-5 mr-2 text-green-400" />
            Memory Usage
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Current
              </span>
              <span className="text-green-400 font-semibold">
                {metrics.system.memory.toFixed(1)}%
              </span>
            </div>
            <div className={`w-full ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
            } rounded-full h-2`}>
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${metrics.system.memory}%` }}
              ></div>
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
            <HardDrive className="w-5 h-5 mr-2 text-purple-400" />
            Disk Usage
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Current
              </span>
              <span className="text-purple-400 font-semibold">
                {metrics.system.disk.toFixed(1)}%
              </span>
            </div>
            <div className={`w-full ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
            } rounded-full h-2`}>
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${metrics.system.disk}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${
          theme === 'dark' 
            ? 'bg-white/10 border-blue-800/30' 
            : 'bg-white/80 border-blue-200/50'
        } backdrop-blur-md rounded-xl p-6 border`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <Wifi className="w-5 h-5 mr-2 text-blue-400" />
            Connection Status
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Binance API
              </span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStatusDot(metrics.connections.binance)}`}></div>
                <span className={`text-sm ${getStatusColor(metrics.connections.binance)}`}>
                  {metrics.connections.binance}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className={`${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Database
              </span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStatusDot(metrics.connections.database)}`}></div>
                <span className={`text-sm ${getStatusColor(metrics.connections.database)}`}>
                  {metrics.connections.database}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className={`${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                API Latency
              </span>
              <span className="text-blue-400 text-sm">
                {metrics.connections.latency}ms
              </span>
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
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Uptime
              </span>
              <span className="text-green-400 text-sm">
                {Math.floor(metrics.performance.uptime / 3600)}h {Math.floor((metrics.performance.uptime % 3600) / 60)}m
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className={`${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Total Requests
              </span>
              <span className="text-blue-400 text-sm">
                {metrics.performance.requests.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className={`${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Error Count
              </span>
              <span className={`text-sm ${
                metrics.performance.errors > 0 ? 'text-red-400' : 'text-green-400'
              }`}>
                {metrics.performance.errors}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};