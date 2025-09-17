import React from 'react';
import { Settings, Moon, Sun, Shield, Database, Wifi } from 'lucide-react';
import { useTheme } from '../components/Theme/ThemeProvider';
import { useAccessibility } from '../components/Accessibility/AccessibilityProvider';

export const SettingsView: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSetting } = useAccessibility();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Settings & Configuration
        </h1>
        <p className={`${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Customize your BOLT AI experience
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <div className={`${
          theme === 'dark' 
            ? 'bg-white/10 border-blue-800/30' 
            : 'bg-white/80 border-blue-200/50'
        } backdrop-blur-md rounded-xl p-6 border`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <Settings className="w-5 h-5 mr-2 text-blue-400" />
            Appearance
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className={`font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Theme
                </label>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Switch between light and dark mode
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            <div>
              <label className={`block font-medium mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Font Size
              </label>
              <select 
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', e.target.value as any)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="extra-large">Extra Large</option>
              </select>
            </div>
          </div>
        </div>

        {/* Accessibility Settings */}
        <div className={`${
          theme === 'dark' 
            ? 'bg-white/10 border-blue-800/30' 
            : 'bg-white/80 border-blue-200/50'
        } backdrop-blur-md rounded-xl p-6 border`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <Shield className="w-5 h-5 mr-2 text-green-400" />
            Accessibility
          </h3>
          
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => updateSetting('highContrast', e.target.checked)}
                className="mr-3 rounded"
              />
              <div>
                <span className={`font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  High Contrast
                </span>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Increase contrast for better visibility
                </p>
              </div>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                className="mr-3 rounded"
              />
              <div>
                <span className={`font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Reduced Motion
                </span>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Minimize animations and transitions
                </p>
              </div>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.screenReaderMode}
                onChange={(e) => updateSetting('screenReaderMode', e.target.checked)}
                className="mr-3 rounded"
              />
              <div>
                <span className={`font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Screen Reader Mode
                </span>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Optimize for screen readers
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* API Configuration */}
        <div className={`${
          theme === 'dark' 
            ? 'bg-white/10 border-blue-800/30' 
            : 'bg-white/80 border-blue-200/50'
        } backdrop-blur-md rounded-xl p-6 border`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <Wifi className="w-5 h-5 mr-2 text-blue-400" />
            API Configuration
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className={`block font-medium mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Binance API Key
              </label>
              <input
                type="password"
                placeholder="Enter your API key"
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <div>
              <label className={`block font-medium mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Secret Key
              </label>
              <input
                type="password"
                placeholder="Enter your secret key"
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <label className="flex items-center">
              <input type="checkbox" className="mr-3 rounded" />
              <span className={`${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Use Testnet
              </span>
            </label>
          </div>
        </div>

        {/* Database Settings */}
        <div className={`${
          theme === 'dark' 
            ? 'bg-white/10 border-blue-800/30' 
            : 'bg-white/80 border-blue-200/50'
        } backdrop-blur-md rounded-xl p-6 border`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <Database className="w-5 h-5 mr-2 text-purple-400" />
            Database
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className={`font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Auto Backup
                </span>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Automatically backup database daily
                </p>
              </div>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <span className={`font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Encryption
                </span>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Encrypt sensitive data
                </p>
              </div>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>

            <button className={`w-full px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}>
              Backup Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};