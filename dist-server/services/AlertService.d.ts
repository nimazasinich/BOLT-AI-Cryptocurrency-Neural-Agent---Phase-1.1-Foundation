import { Alert } from '../types/index.js';
export declare class AlertService {
    private static instance;
    private logger;
    private alerts;
    private subscribers;
    private constructor();
    static getInstance(): AlertService;
    createAlert(alert: Omit<Alert, 'id'>): Alert;
    triggerAlert(alertId: string, currentValue: number): void;
    private evaluateCondition;
    private generateAlertId;
    subscribe(callback: (alert: Alert) => void): void;
    private notifySubscribers;
    getActiveAlerts(): Alert[];
    deleteAlert(alertId: string): boolean;
}
