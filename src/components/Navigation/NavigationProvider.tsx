import React, { createContext, useContext, useState, ReactNode } from 'react';

export type NavigationView = 
  | 'dashboard' 
  | 'charting' 
  | 'training' 
  | 'risk' 
  | 'backtest' 
  | 'health' 
  | 'settings';

interface NavigationContextType {
  currentView: NavigationView;
  setCurrentView: (view: NavigationView) => void;
  navigationHistory: NavigationView[];
  goBack: () => void;
  canGoBack: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [currentView, setCurrentViewState] = useState<NavigationView>('dashboard');
  const [navigationHistory, setNavigationHistory] = useState<NavigationView[]>(['dashboard']);

  const setCurrentView = (view: NavigationView) => {
    if (view !== currentView) {
      setNavigationHistory(prev => [...prev, view]);
      setCurrentViewState(view);
    }
  };

  const goBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = navigationHistory.slice(0, -1);
      const previousView = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setCurrentViewState(previousView);
    }
  };

  const canGoBack = navigationHistory.length > 1;

  return (
    <NavigationContext.Provider value={{
      currentView,
      setCurrentView,
      navigationHistory,
      goBack,
      canGoBack
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};