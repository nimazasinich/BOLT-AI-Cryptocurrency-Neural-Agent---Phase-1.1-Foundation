import React, { ReactNode } from 'react';
interface AccessibilitySettings {
    highContrast: boolean;
    reducedMotion: boolean;
    fontSize: 'small' | 'medium' | 'large' | 'extra-large';
    screenReaderMode: boolean;
    focusVisible: boolean;
}
interface AccessibilityContextType {
    settings: AccessibilitySettings;
    updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
    resetSettings: () => void;
}
interface AccessibilityProviderProps {
    children: ReactNode;
}
export declare const AccessibilityProvider: React.FC<AccessibilityProviderProps>;
export declare const useAccessibility: () => AccessibilityContextType;
export {};
