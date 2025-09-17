import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProviderRegistry, type ProviderCategory } from '../src/services/ProviderRegistry.js';
import * as fs from 'fs';
import * as path from 'path';

describe('ProviderRegistry', () => {
  let registry: ProviderRegistry;
  const testConfigPath = path.resolve(process.cwd(), 'config/providers.generated.json');
  let originalConfigExists = false;
  let originalConfigContent = '';

  beforeEach(() => {
    registry = ProviderRegistry.getInstance();
    
    // Backup original config if it exists
    if (fs.existsSync(testConfigPath)) {
      originalConfigExists = true;
      originalConfigContent = fs.readFileSync(testConfigPath, 'utf-8');
    }
  });

  afterEach(() => {
    // Restore original config
    if (originalConfigExists) {
      fs.writeFileSync(testConfigPath, originalConfigContent, 'utf-8');
    } else if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
    
    // Clear cached bundle for next test
    (registry as any).bundle = null;
  });

  describe('loadProviders', () => {
    it('should load providers from valid config file', async () => {
      // Create a test config
      const testBundle = {
        source: '/test/path/manifest.html',
        count: 5,
        categories: {
          MarketData: [
            {
              id: 'test_coingecko',
              name: 'CoinGecko Test',
              url: 'https://api.coingecko.com/api/v3',
              apiBase: 'https://api.coingecko.com/api/v3',
              category: 'MarketData' as ProviderCategory,
              auth: 'none' as const,
              notes: 'Test provider'
            }
          ],
          News: [],
          Sentiment: [],
          FearGreed: [],
          Whales: [],
          OnChain: [],
          Explorers: [],
          Community: [],
          Other: []
        }
      };

      // Ensure config directory exists
      const configDir = path.dirname(testConfigPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      fs.writeFileSync(testConfigPath, JSON.stringify(testBundle, null, 2), 'utf-8');

      const bundle = await registry.loadProviders();

      expect(bundle).toBeDefined();
      expect(bundle.source).toBe('/test/path/manifest.html');
      expect(bundle.count).toBe(5);
      expect(bundle.categories.MarketData).toHaveLength(1);
      expect(bundle.categories.MarketData[0].name).toBe('CoinGecko Test');
    });

    it('should return empty bundle when config file is missing', async () => {
      // Ensure config file doesn't exist
      if (fs.existsSync(testConfigPath)) {
        fs.unlinkSync(testConfigPath);
      }

      const bundle = await registry.loadProviders();

      expect(bundle).toBeDefined();
      expect(bundle.source).toBe('(missing)');
      expect(bundle.count).toBe(0);
      expect(Object.values(bundle.categories).every(cat => cat.length === 0)).toBe(true);
    });

    it('should return empty bundle when config file is invalid JSON', async () => {
      // Ensure config directory exists
      const configDir = path.dirname(testConfigPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      fs.writeFileSync(testConfigPath, 'invalid json content', 'utf-8');

      const bundle = await registry.loadProviders();

      expect(bundle).toBeDefined();
      expect(bundle.source).toBe('(missing)');
      expect(bundle.count).toBe(0);
    });
  });

  describe('getProvidersByCategory', () => {
    it('should return providers for a specific category', async () => {
      const testBundle = {
        source: '/test/path/manifest.html',
        count: 2,
        categories: {
          MarketData: [
            {
              id: 'test_coingecko',
              name: 'CoinGecko Test',
              url: 'https://api.coingecko.com/api/v3',
              apiBase: 'https://api.coingecko.com/api/v3',
              category: 'MarketData' as ProviderCategory,
              auth: 'none' as const
            }
          ],
          News: [
            {
              id: 'test_newsapi',
              name: 'NewsAPI Test',
              url: 'https://newsapi.org/v2',
              apiBase: 'https://newsapi.org/v2',
              category: 'News' as ProviderCategory,
              auth: 'apiKey' as const
            }
          ],
          Sentiment: [],
          FearGreed: [],
          Whales: [],
          OnChain: [],
          Explorers: [],
          Community: [],
          Other: []
        }
      };

      // Ensure config directory exists
      const configDir = path.dirname(testConfigPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      fs.writeFileSync(testConfigPath, JSON.stringify(testBundle, null, 2), 'utf-8');

      const marketDataProviders = await registry.getProvidersByCategory('MarketData');
      const newsProviders = await registry.getProvidersByCategory('News');
      const emptyCategory = await registry.getProvidersByCategory('Sentiment');

      expect(marketDataProviders).toHaveLength(1);
      expect(marketDataProviders[0].name).toBe('CoinGecko Test');
      expect(newsProviders).toHaveLength(1);
      expect(newsProviders[0].name).toBe('NewsAPI Test');
      expect(emptyCategory).toHaveLength(0);
    });
  });

  describe('searchProviders', () => {
    it('should find providers by name and notes', async () => {
      const testBundle = {
        source: '/test/path/manifest.html',
        count: 3,
        categories: {
          MarketData: [
            {
              id: 'test_coingecko',
              name: 'CoinGecko',
              url: 'https://api.coingecko.com/api/v3',
              apiBase: 'https://api.coingecko.com/api/v3',
              category: 'MarketData' as ProviderCategory,
              auth: 'none' as const,
              notes: 'Free cryptocurrency data'
            },
            {
              id: 'test_coinmarketcap',
              name: 'CoinMarketCap',
              url: 'https://pro-api.coinmarketcap.com/v1',
              apiBase: 'https://pro-api.coinmarketcap.com/v1',
              category: 'MarketData' as ProviderCategory,
              auth: 'apiKey' as const,
              notes: 'Premium market data provider'
            }
          ],
          News: [
            {
              id: 'test_cryptopanic',
              name: 'CryptoPanic',
              url: 'https://cryptopanic.com/api/v1',
              apiBase: 'https://cryptopanic.com/api/v1',
              category: 'News' as ProviderCategory,
              auth: 'apiKey' as const,
              notes: 'Cryptocurrency news aggregator'
            }
          ],
          Sentiment: [],
          FearGreed: [],
          Whales: [],
          OnChain: [],
          Explorers: [],
          Community: [],
          Other: []
        }
      };

      // Ensure config directory exists
      const configDir = path.dirname(testConfigPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      fs.writeFileSync(testConfigPath, JSON.stringify(testBundle, null, 2), 'utf-8');

      const coinResults = await registry.searchProviders('coin');
      const freeResults = await registry.searchProviders('free');
      const noResults = await registry.searchProviders('nonexistent');

      expect(coinResults).toHaveLength(2); // CoinGecko and CoinMarketCap
      expect(coinResults.map(p => p.name)).toContain('CoinGecko');
      expect(coinResults.map(p => p.name)).toContain('CoinMarketCap');

      expect(freeResults).toHaveLength(1); // CoinGecko (has "Free" in notes)
      expect(freeResults[0].name).toBe('CoinGecko');

      expect(noResults).toHaveLength(0);
    });
  });

  describe('getStatistics', () => {
    it('should return correct statistics', async () => {
      const testBundle = {
        source: '/test/path/manifest.html',
        count: 4,
        categories: {
          MarketData: [
            {
              id: 'test_coingecko',
              name: 'CoinGecko',
              url: 'https://api.coingecko.com/api/v3',
              apiBase: 'https://api.coingecko.com/api/v3',
              category: 'MarketData' as ProviderCategory,
              auth: 'none' as const
            },
            {
              id: 'test_coinmarketcap',
              name: 'CoinMarketCap',
              url: 'https://pro-api.coinmarketcap.com/v1',
              apiBase: 'https://pro-api.coinmarketcap.com/v1',
              category: 'MarketData' as ProviderCategory,
              auth: 'apiKey' as const
            }
          ],
          News: [
            {
              id: 'test_newsapi',
              name: 'NewsAPI',
              url: 'https://newsapi.org/v2',
              apiBase: 'https://newsapi.org/v2',
              category: 'News' as ProviderCategory,
              auth: 'apiKey' as const
            }
          ],
          Whales: [
            {
              id: 'test_whalealert',
              name: 'WhaleAlert',
              url: 'https://api.whale-alert.io/v1',
              apiBase: 'https://api.whale-alert.io/v1',
              category: 'Whales' as ProviderCategory,
              auth: 'apiKey' as const
            }
          ],
          Sentiment: [],
          FearGreed: [],
          OnChain: [],
          Explorers: [],
          Community: [],
          Other: []
        }
      };

      // Ensure config directory exists
      const configDir = path.dirname(testConfigPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      fs.writeFileSync(testConfigPath, JSON.stringify(testBundle, null, 2), 'utf-8');

      const stats = await registry.getStatistics();

      expect(stats.totalProviders).toBe(4);
      expect(stats.source).toBe('/test/path/manifest.html');
      expect(stats.categoryCounts.MarketData).toBe(2);
      expect(stats.categoryCounts.News).toBe(1);
      expect(stats.categoryCounts.Whales).toBe(1);
      expect(stats.categoryCounts.Sentiment).toBe(0);
      expect(stats.authTypeCounts.apiKey).toBe(3);
      expect(stats.authTypeCounts.none).toBe(1);
      expect(stats.authTypeCounts.oauth).toBe(0);
    });
  });

  describe('isConfigValid', () => {
    it('should return true for valid config with providers', async () => {
      const testBundle = {
        source: '/test/path/manifest.html',
        count: 1,
        categories: {
          MarketData: [
            {
              id: 'test_provider',
              name: 'Test Provider',
              url: 'https://api.test.com',
              apiBase: 'https://api.test.com',
              category: 'MarketData' as ProviderCategory,
              auth: 'none' as const
            }
          ],
          News: [],
          Sentiment: [],
          FearGreed: [],
          Whales: [],
          OnChain: [],
          Explorers: [],
          Community: [],
          Other: []
        }
      };

      // Ensure config directory exists
      const configDir = path.dirname(testConfigPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      fs.writeFileSync(testConfigPath, JSON.stringify(testBundle, null, 2), 'utf-8');

      const isValid = await registry.isConfigValid();
      expect(isValid).toBe(true);
    });

    it('should return false for missing config', async () => {
      // Ensure config file doesn't exist
      if (fs.existsSync(testConfigPath)) {
        fs.unlinkSync(testConfigPath);
      }

      const isValid = await registry.isConfigValid();
      expect(isValid).toBe(false);
    });
  });

  describe('Integration with real generated config', () => {
    it('should load real providers config and validate minimum count', async () => {
      // This test runs against the actual generated config if it exists
      const realConfigPath = path.resolve(process.cwd(), 'config/providers.generated.json');
      
      if (fs.existsSync(realConfigPath)) {
        const realRegistry = ProviderRegistry.getInstance();
        // Clear any cached data
        (realRegistry as any).bundle = null;
        
        const bundle = await realRegistry.loadProviders();
        
        // Validate structure
        expect(bundle).toBeDefined();
        expect(bundle.source).toBeDefined();
        expect(typeof bundle.count).toBe('number');
        expect(bundle.categories).toBeDefined();
        
        // Validate all categories exist
        const expectedCategories: ProviderCategory[] = [
          'MarketData', 'News', 'Sentiment', 'FearGreed', 'Whales', 'OnChain', 'Explorers', 'Community', 'Other'
        ];
        
        for (const category of expectedCategories) {
          expect(bundle.categories[category]).toBeDefined();
          expect(Array.isArray(bundle.categories[category])).toBe(true);
        }
        
        // If source is not missing, validate minimum provider count
        if (bundle.source !== '(missing)') {
          expect(bundle.count).toBeGreaterThanOrEqual(42);
          console.log(`✅ Real config validation passed: ${bundle.count} providers from ${bundle.source}`);
        } else {
          console.log('⚠️  Real config not found, using empty bundle');
        }
      } else {
        console.log('ℹ️  Real providers config not found, skipping integration test');
      }
    });
  });
});