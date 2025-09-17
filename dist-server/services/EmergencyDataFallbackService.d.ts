import { MarketData } from '../types/index.js';
export declare class EmergencyDataFallbackService {
    private static instance;
    private logger;
    private isEmergencyMode;
    private fallbackSources;
    private constructor();
    static getInstance(): EmergencyDataFallbackService;
    activateEmergencyMode(): Promise<void>;
    deactivateEmergencyMode(): Promise<void>;
    isInEmergencyMode(): boolean;
    getEmergencyMarketData(symbol: string): Promise<MarketData | null>;
    private fetchFromSource;
    private fetchFromCoinGecko;
    private fetchFromCoinMarketCap;
    private fetchFromCryptoCompare;
    private symbolToCoinGeckoId;
    private symbolToCMCSlug;
    testAllSources(): Promise<{
        [source: string]: boolean;
    }>;
}
