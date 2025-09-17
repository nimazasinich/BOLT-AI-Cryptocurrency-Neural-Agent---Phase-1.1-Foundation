import React from 'react';
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
import { SettingsView } from './views/SettingsView';

const AppContent: React.FC = () => {
  const { currentView } = useNavigation();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'charting': return <ChartingView />;
      case 'training': return <TrainingView />;
      case 'risk': return <RiskView />;
      case 'backtest': return <BacktestView />;
      case 'health': return <HealthView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 light:from-blue-50 light:via-purple-50 light:to-pink-50 flex">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {renderCurrentView()}
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AccessibilityProvider>
        <NavigationProvider>
          <AppContent />
        </NavigationProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  );
}

export default App;