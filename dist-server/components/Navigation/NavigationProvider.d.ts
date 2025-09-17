import React, { ReactNode } from 'react';
export type NavigationView = 'dashboard' | 'charting' | 'training' | 'risk' | 'backtest' | 'health' | 'providers' | 'settings';
interface NavigationContextType {
    currentView: NavigationView;
    setCurrentView: (view: NavigationView) => void;
    navigationHistory: NavigationView[];
    goBack: () => void;
    canGoBack: boolean;
}
interface NavigationProviderProps {
    children: ReactNode;
}
export declare const NavigationProvider: React.FC<NavigationProviderProps>;
export declare const useNavigation: () => NavigationContextType;
export {};
