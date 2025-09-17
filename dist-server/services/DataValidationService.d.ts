import { MarketData } from '../types/index.js';
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export interface DataQualityMetrics {
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    validationRate: number;
    commonErrors: Map<string, number>;
    lastValidationTime: number;
}
export declare class DataValidationService {
    private static instance;
    private logger;
    private qualityMetrics;
    private constructor();
    static getInstance(): DataValidationService;
    validateMarketData(data: MarketData): ValidationResult;
    validateBatch(dataArray: MarketData[]): {
        results: ValidationResult[];
        summary: {
            total: number;
            valid: number;
            invalid: number;
            validationRate: number;
        };
    };
    getQualityMetrics(): DataQualityMetrics;
    resetMetrics(): void;
    getDataQualityReport(): {
        metrics: DataQualityMetrics;
        topErrors: Array<{
            error: string;
            count: number;
        }>;
        recommendations: string[];
    };
}
