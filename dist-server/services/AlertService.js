import { Logger } from '../core/Logger.js';
export class AlertService {
    static instance;
    logger = Logger.getInstance();
    alerts = new Map();
    subscribers = [];
    constructor() { }
    static getInstance() {
        if (!AlertService.instance) {
            AlertService.instance = new AlertService();
        }
        return AlertService.instance;
    }
    createAlert(alert) {
        const fullAlert = {
            ...alert,
            id: this.generateAlertId()
        };
        this.alerts.set(fullAlert.id, fullAlert);
        this.logger.info('Alert created', { id: fullAlert.id, type: fullAlert.type });
        return fullAlert;
    }
    triggerAlert(alertId, currentValue) {
        const alert = this.alerts.get(alertId);
        if (!alert)
            return;
        const now = Date.now();
        // Check cooldown period
        if (alert.lastTriggered && (now - alert.lastTriggered) < (alert.cooldownPeriod * 60 * 1000)) {
            return;
        }
        // Check if condition is met
        const conditionMet = this.evaluateCondition(alert, currentValue);
        if (conditionMet && !alert.triggered) {
            alert.triggered = true;
            alert.triggerTime = now;
            alert.lastTriggered = now;
            alert.currentValue = currentValue;
            this.logger.info('Alert triggered', {
                id: alert.id,
                type: alert.type,
                currentValue,
                threshold: alert.threshold
            });
            // Notify subscribers
            this.notifySubscribers(alert);
        }
    }
    evaluateCondition(alert, currentValue) {
        switch (alert.condition) {
            case 'GREATER_THAN':
                return currentValue > alert.threshold;
            case 'LESS_THAN':
                return currentValue < alert.threshold;
            case 'EQUALS':
                return Math.abs(currentValue - alert.threshold) < 0.0001;
            case 'CROSSES_ABOVE':
                return currentValue > alert.threshold && alert.currentValue <= alert.threshold;
            case 'CROSSES_BELOW':
                return currentValue < alert.threshold && alert.currentValue >= alert.threshold;
            default:
                return false;
        }
    }
    generateAlertId() {
        return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    subscribe(callback) {
        this.subscribers.push(callback);
    }
    notifySubscribers(alert) {
        this.subscribers.forEach(callback => {
            try {
                callback(alert);
            }
            catch (error) {
                this.logger.error('Error notifying alert subscriber', {}, error);
            }
        });
    }
    getActiveAlerts() {
        return Array.from(this.alerts.values()).filter(alert => !alert.triggered);
    }
    deleteAlert(alertId) {
        return this.alerts.delete(alertId);
    }
}
