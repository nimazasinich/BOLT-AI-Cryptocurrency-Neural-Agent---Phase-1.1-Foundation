import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavigationProvider, useNavigation } from './components/Navigation/NavigationProvider';
import { ThemeProvider } from './components/Theme/ThemeProvider';
import { AccessibilityProvider } from './components/Accessibility/AccessibilityProvider';
import { Sidebar } from './components/Navigation/Sidebar';
import { DashboardView } from './views/DashboardView';
import { ChartingView } from './views/ChartingView';
import { TrainingView } from './views/TrainingView';
import { RiskView } from './views/RiskView';
import { BacktestView } from './views/BacktestView';
import { HealthView } from './views/HealthView';
import { ProvidersView } from './views/ProvidersView';
import { SettingsView } from './views/SettingsView';
const AppContent = () => {
    const { currentView } = useNavigation();
    const renderCurrentView = () => {
        switch (currentView) {
            case 'dashboard': return _jsx(DashboardView, {});
            case 'charting': return _jsx(ChartingView, {});
            case 'training': return _jsx(TrainingView, {});
            case 'risk': return _jsx(RiskView, {});
            case 'backtest': return _jsx(BacktestView, {});
            case 'health': return _jsx(HealthView, {});
            case 'providers': return _jsx(ProvidersView, {});
            case 'settings': return _jsx(SettingsView, {});
            default: return _jsx(DashboardView, {});
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 light:from-blue-50 light:via-purple-50 light:to-pink-50 flex", children: [_jsx(Sidebar, {}), _jsx("main", { className: "flex-1 overflow-auto", children: renderCurrentView() })] }));
};
function App() {
    return (_jsx(ThemeProvider, { children: _jsx(AccessibilityProvider, { children: _jsx(NavigationProvider, { children: _jsx(AppContent, {}) }) }) }));
}
export default App;
