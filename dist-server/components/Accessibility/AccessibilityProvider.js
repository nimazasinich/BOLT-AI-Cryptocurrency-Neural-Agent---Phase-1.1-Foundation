import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
const defaultSettings = {
    highContrast: false,
    reducedMotion: false,
    fontSize: 'medium',
    screenReaderMode: false,
    focusVisible: true
};
const AccessibilityContext = createContext(undefined);
export const AccessibilityProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('bolt-ai-accessibility');
        if (saved) {
            try {
                return { ...defaultSettings, ...JSON.parse(saved) };
            }
            catch {
                return defaultSettings;
            }
        }
        // Check system preferences
        return {
            ...defaultSettings,
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            highContrast: window.matchMedia('(prefers-contrast: high)').matches
        };
    });
    const updateSetting = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        localStorage.setItem('bolt-ai-accessibility', JSON.stringify(newSettings));
    };
    const resetSettings = () => {
        setSettings(defaultSettings);
        localStorage.removeItem('bolt-ai-accessibility');
    };
    useEffect(() => {
        // Apply accessibility settings to document
        const root = document.documentElement;
        // High contrast
        root.classList.toggle('high-contrast', settings.highContrast);
        // Reduced motion
        root.classList.toggle('reduced-motion', settings.reducedMotion);
        // Font size
        root.classList.remove('font-small', 'font-medium', 'font-large', 'font-extra-large');
        root.classList.add(`font-${settings.fontSize}`);
        // Screen reader mode
        root.classList.toggle('screen-reader-mode', settings.screenReaderMode);
        // Focus visible
        root.classList.toggle('focus-visible', settings.focusVisible);
        // Listen for system preference changes
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const contrastQuery = window.matchMedia('(prefers-contrast: high)');
        const handleMotionChange = (e) => {
            if (!localStorage.getItem('bolt-ai-accessibility')) {
                updateSetting('reducedMotion', e.matches);
            }
        };
        const handleContrastChange = (e) => {
            if (!localStorage.getItem('bolt-ai-accessibility')) {
                updateSetting('highContrast', e.matches);
            }
        };
        motionQuery.addEventListener('change', handleMotionChange);
        contrastQuery.addEventListener('change', handleContrastChange);
        return () => {
            motionQuery.removeEventListener('change', handleMotionChange);
            contrastQuery.removeEventListener('change', handleContrastChange);
        };
    }, [settings]);
    return (_jsx(AccessibilityContext.Provider, { value: { settings, updateSetting, resetSettings }, children: children }));
};
export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (context === undefined) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
};
