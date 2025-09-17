import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart3, TrendingUp, Brain, Shield, Activity, Settings, Home, ChevronLeft, Zap, Database } from 'lucide-react';
import { useNavigation } from './NavigationProvider';
import { useTheme } from '../Theme/ThemeProvider';
const navigationItems = [
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
        id: 'providers',
        label: 'Data Providers',
        icon: Database,
        description: 'Cryptocurrency data source registry'
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        description: 'Configuration and preferences'
    }
];
export const Sidebar = () => {
    const { currentView, setCurrentView, goBack, canGoBack } = useNavigation();
    const { theme } = useTheme();
    return (_jsxs("div", { className: `w-64 h-full ${theme === 'dark'
            ? 'bg-gray-900/95 border-gray-800'
            : 'bg-white/95 border-gray-200'} backdrop-blur-md border-r flex flex-col`, children: [_jsxs("div", { className: "p-6 border-b border-gray-800/30", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center", children: _jsx(Zap, { className: "w-6 h-6 text-white" }) }), _jsxs("div", { children: [_jsx("h1", { className: `text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`, children: "BOLT AI" }), _jsx("p", { className: `text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`, children: "Neural Agent" })] })] }), canGoBack && (_jsxs("button", { onClick: goBack, className: `mt-4 flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${theme === 'dark'
                            ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`, children: [_jsx(ChevronLeft, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm", children: "Back" })] }))] }), _jsx("nav", { className: "flex-1 p-4 space-y-2", children: navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (_jsxs("button", { onClick: () => setCurrentView(item.id), className: `w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                            ? theme === 'dark'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                            : theme === 'dark'
                                ? 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`, children: [_jsx(Icon, { className: `w-5 h-5 ${isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'}` }), _jsxs("div", { className: "flex-1 text-left", children: [_jsx("div", { className: `font-medium ${isActive ? 'text-white' : ''}`, children: item.label }), _jsx("div", { className: `text-xs ${isActive
                                            ? 'text-blue-100'
                                            : theme === 'dark'
                                                ? 'text-gray-400'
                                                : 'text-gray-500'}`, children: item.description })] })] }, item.id));
                }) }), _jsx("div", { className: `p-4 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`, children: _jsxs("div", { className: `text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-center`, children: ["Phase 1.3 Complete", _jsx("br", {}), "Foundation & Infrastructure"] }) })] }));
};
