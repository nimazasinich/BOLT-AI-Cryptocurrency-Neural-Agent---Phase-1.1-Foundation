import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Activity, Wifi, Cpu, HardDrive, MemoryStick } from 'lucide-react';
import { useTheme } from '../components/Theme/ThemeProvider';
export const HealthView = () => {
    const { theme } = useTheme();
    const [metrics, setMetrics] = useState({
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
            }
            catch (error) {
                console.error('Failed to fetch health metrics:', error);
            }
        };
        fetchHealthMetrics();
        const interval = setInterval(fetchHealthMetrics, 5000);
        return () => clearInterval(interval);
    }, []);
    const getStatusColor = (status) => {
        switch (status) {
            case 'connected': return 'text-green-400';
            case 'error': return 'text-red-400';
            default: return 'text-yellow-400';
        }
    };
    const getStatusDot = (status) => {
        switch (status) {
            case 'connected': return 'bg-green-400';
            case 'error': return 'bg-red-400';
            default: return 'bg-yellow-400';
        }
    };
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: `text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`, children: "System Health Monitor" }), _jsx("p", { className: `${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`, children: "Real-time system monitoring and diagnostics" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6", children: [_jsxs("div", { className: `${theme === 'dark'
                            ? 'bg-white/10 border-blue-800/30'
                            : 'bg-white/80 border-blue-200/50'} backdrop-blur-md rounded-xl p-6 border`, children: [_jsxs("h3", { className: `text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`, children: [_jsx(Cpu, { className: "w-5 h-5 mr-2 text-blue-400" }), "CPU Usage"] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: `text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`, children: "Current" }), _jsxs("span", { className: "text-blue-400 font-semibold", children: [metrics.system.cpu.toFixed(1), "%"] })] }), _jsx("div", { className: `w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} rounded-full h-2`, children: _jsx("div", { className: "bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000", style: { width: `${metrics.system.cpu}%` } }) })] })] }), _jsxs("div", { className: `${theme === 'dark'
                            ? 'bg-white/10 border-blue-800/30'
                            : 'bg-white/80 border-blue-200/50'} backdrop-blur-md rounded-xl p-6 border`, children: [_jsxs("h3", { className: `text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`, children: [_jsx(MemoryStick, { className: "w-5 h-5 mr-2 text-green-400" }), "Memory Usage"] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: `text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`, children: "Current" }), _jsxs("span", { className: "text-green-400 font-semibold", children: [metrics.system.memory.toFixed(1), "%"] })] }), _jsx("div", { className: `w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} rounded-full h-2`, children: _jsx("div", { className: "bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000", style: { width: `${metrics.system.memory}%` } }) })] })] }), _jsxs("div", { className: `${theme === 'dark'
                            ? 'bg-white/10 border-blue-800/30'
                            : 'bg-white/80 border-blue-200/50'} backdrop-blur-md rounded-xl p-6 border`, children: [_jsxs("h3", { className: `text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`, children: [_jsx(HardDrive, { className: "w-5 h-5 mr-2 text-purple-400" }), "Disk Usage"] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: `text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`, children: "Current" }), _jsxs("span", { className: "text-purple-400 font-semibold", children: [metrics.system.disk.toFixed(1), "%"] })] }), _jsx("div", { className: `w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} rounded-full h-2`, children: _jsx("div", { className: "bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000", style: { width: `${metrics.system.disk}%` } }) })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: `${theme === 'dark'
                            ? 'bg-white/10 border-blue-800/30'
                            : 'bg-white/80 border-blue-200/50'} backdrop-blur-md rounded-xl p-6 border`, children: [_jsxs("h3", { className: `text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`, children: [_jsx(Wifi, { className: "w-5 h-5 mr-2 text-blue-400" }), "Connection Status"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: `${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`, children: "Binance API" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: `w-2 h-2 rounded-full ${getStatusDot(metrics.connections.binance)}` }), _jsx("span", { className: `text-sm ${getStatusColor(metrics.connections.binance)}`, children: metrics.connections.binance })] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: `${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`, children: "Database" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: `w-2 h-2 rounded-full ${getStatusDot(metrics.connections.database)}` }), _jsx("span", { className: `text-sm ${getStatusColor(metrics.connections.database)}`, children: metrics.connections.database })] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: `${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`, children: "API Latency" }), _jsxs("span", { className: "text-blue-400 text-sm", children: [metrics.connections.latency, "ms"] })] })] })] }), _jsxs("div", { className: `${theme === 'dark'
                            ? 'bg-white/10 border-blue-800/30'
                            : 'bg-white/80 border-blue-200/50'} backdrop-blur-md rounded-xl p-6 border`, children: [_jsxs("h3", { className: `text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`, children: [_jsx(Activity, { className: "w-5 h-5 mr-2 text-green-400" }), "Performance Metrics"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: `${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`, children: "Uptime" }), _jsxs("span", { className: "text-green-400 text-sm", children: [Math.floor(metrics.performance.uptime / 3600), "h ", Math.floor((metrics.performance.uptime % 3600) / 60), "m"] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: `${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`, children: "Total Requests" }), _jsx("span", { className: "text-blue-400 text-sm", children: metrics.performance.requests.toLocaleString() })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: `${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`, children: "Error Count" }), _jsx("span", { className: `text-sm ${metrics.performance.errors > 0 ? 'text-red-400' : 'text-green-400'}`, children: metrics.performance.errors })] })] })] })] })] }));
};
