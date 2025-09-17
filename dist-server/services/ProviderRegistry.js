import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../core/Logger.js';
/**
 * ProviderRegistry - Service for loading and managing cryptocurrency data providers
 * Loads providers from config/providers.generated.json with safe fallback
 */
export class ProviderRegistry {
    static instance;
    logger;
    bundle = null;
    configPath;
    constructor() {
        this.logger = Logger.getInstance();
        this.configPath = path.resolve(process.cwd(), 'config/providers.generated.json');
    }
    static getInstance() {
        if (!ProviderRegistry.instance) {
            ProviderRegistry.instance = new ProviderRegistry();
        }
        return ProviderRegistry.instance;
    }
    /**
     * Load providers from the generated JSON file
     * Returns empty bundle if file is missing or invalid
     */
    async loadProviders() {
        if (this.bundle) {
            return this.bundle;
        }
        try {
            this.logger.info('Loading providers from config', { configPath: this.configPath });
            if (!fs.existsSync(this.configPath)) {
                this.logger.warn('Providers config file not found, using empty bundle', { configPath: this.configPath });
                this.bundle = this.createEmptyBundle();
                return this.bundle;
            }
            const configContent = fs.readFileSync(this.configPath, 'utf-8');
            const parsedBundle = JSON.parse(configContent);
            // Validate the bundle structure
            if (!this.validateBundle(parsedBundle)) {
                this.logger.error('Invalid providers bundle structure, using empty bundle');
                this.bundle = this.createEmptyBundle();
                return this.bundle;
            }
            this.bundle = parsedBundle;
            this.logger.info('Successfully loaded providers', {
                source: this.bundle.source,
                count: this.bundle.count,
                categories: Object.keys(this.bundle.categories).filter(cat => this.bundle.categories[cat].length > 0)
            });
            return this.bundle;
        }
        catch (error) {
            this.logger.error('Failed to load providers config', { configPath: this.configPath }, error);
            this.bundle = this.createEmptyBundle();
            return this.bundle;
        }
    }
    /**
     * Get all providers grouped by category
     */
    async getProviders() {
        return await this.loadProviders();
    }
    /**
     * Get providers for a specific category
     */
    async getProvidersByCategory(category) {
        const bundle = await this.loadProviders();
        return bundle.categories[category] || [];
    }
    /**
     * Get a specific provider by ID
     */
    async getProviderById(id) {
        const bundle = await this.loadProviders();
        for (const categoryProviders of Object.values(bundle.categories)) {
            const provider = categoryProviders.find(p => p.id === id);
            if (provider) {
                return provider;
            }
        }
        return null;
    }
    /**
     * Get providers by authentication type
     */
    async getProvidersByAuth(authType) {
        const bundle = await this.loadProviders();
        const providers = [];
        for (const categoryProviders of Object.values(bundle.categories)) {
            providers.push(...categoryProviders.filter(p => p.auth === authType));
        }
        return providers;
    }
    /**
     * Search providers by name or notes
     */
    async searchProviders(query) {
        const bundle = await this.loadProviders();
        const providers = [];
        const searchTerm = query.toLowerCase();
        for (const categoryProviders of Object.values(bundle.categories)) {
            providers.push(...categoryProviders.filter(p => p.name.toLowerCase().includes(searchTerm) ||
                (p.notes && p.notes.toLowerCase().includes(searchTerm))));
        }
        return providers;
    }
    /**
     * Get registry statistics
     */
    async getStatistics() {
        const bundle = await this.loadProviders();
        const categoryCounts = {};
        const authTypeCounts = { apiKey: 0, oauth: 0, none: 0 };
        for (const [category, providers] of Object.entries(bundle.categories)) {
            categoryCounts[category] = providers.length;
            for (const provider of providers) {
                const authType = provider.auth || 'none';
                authTypeCounts[authType] = (authTypeCounts[authType] || 0) + 1;
            }
        }
        return {
            totalProviders: bundle.count,
            source: bundle.source,
            categoryCounts,
            authTypeCounts
        };
    }
    /**
     * Force reload providers from disk
     */
    async reloadProviders() {
        this.bundle = null;
        return await this.loadProviders();
    }
    /**
     * Check if providers config is available and valid
     */
    async isConfigValid() {
        try {
            const bundle = await this.loadProviders();
            return bundle.source !== '(missing)' && bundle.count > 0;
        }
        catch {
            return false;
        }
    }
    validateBundle(bundle) {
        if (!bundle || typeof bundle !== 'object')
            return false;
        if (typeof bundle.source !== 'string')
            return false;
        if (typeof bundle.count !== 'number')
            return false;
        if (!bundle.categories || typeof bundle.categories !== 'object')
            return false;
        // Check that all required categories exist
        const requiredCategories = [
            'MarketData', 'News', 'Sentiment', 'FearGreed', 'Whales', 'OnChain', 'Explorers', 'Community', 'Other'
        ];
        for (const category of requiredCategories) {
            if (!Array.isArray(bundle.categories[category]))
                return false;
        }
        return true;
    }
    createEmptyBundle() {
        return {
            source: '(missing)',
            count: 0,
            categories: {
                MarketData: [],
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
    }
}
