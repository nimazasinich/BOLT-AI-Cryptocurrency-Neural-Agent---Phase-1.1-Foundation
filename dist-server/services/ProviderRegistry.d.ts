export type ProviderCategory = 'MarketData' | 'News' | 'Sentiment' | 'FearGreed' | 'Whales' | 'OnChain' | 'Explorers' | 'Community' | 'Other';
export interface ProviderSpec {
    id: string;
    name: string;
    url: string;
    docs?: string;
    apiBase?: string;
    category: ProviderCategory;
    auth?: 'apiKey' | 'oauth' | 'none';
    notes?: string;
}
export interface ProvidersBundle {
    source: string;
    count: number;
    categories: Record<ProviderCategory, ProviderSpec[]>;
}
/**
 * ProviderRegistry - Service for loading and managing cryptocurrency data providers
 * Loads providers from config/providers.generated.json with safe fallback
 */
export declare class ProviderRegistry {
    private static instance;
    private logger;
    private bundle;
    private configPath;
    private constructor();
    static getInstance(): ProviderRegistry;
    /**
     * Load providers from the generated JSON file
     * Returns empty bundle if file is missing or invalid
     */
    loadProviders(): Promise<ProvidersBundle>;
    /**
     * Get all providers grouped by category
     */
    getProviders(): Promise<ProvidersBundle>;
    /**
     * Get providers for a specific category
     */
    getProvidersByCategory(category: ProviderCategory): Promise<ProviderSpec[]>;
    /**
     * Get a specific provider by ID
     */
    getProviderById(id: string): Promise<ProviderSpec | null>;
    /**
     * Get providers by authentication type
     */
    getProvidersByAuth(authType: 'apiKey' | 'oauth' | 'none'): Promise<ProviderSpec[]>;
    /**
     * Search providers by name or notes
     */
    searchProviders(query: string): Promise<ProviderSpec[]>;
    /**
     * Get registry statistics
     */
    getStatistics(): Promise<{
        totalProviders: number;
        source: string;
        categoryCounts: Record<ProviderCategory, number>;
        authTypeCounts: Record<string, number>;
    }>;
    /**
     * Force reload providers from disk
     */
    reloadProviders(): Promise<ProvidersBundle>;
    /**
     * Check if providers config is available and valid
     */
    isConfigValid(): Promise<boolean>;
    private validateBundle;
    private createEmptyBundle;
}
