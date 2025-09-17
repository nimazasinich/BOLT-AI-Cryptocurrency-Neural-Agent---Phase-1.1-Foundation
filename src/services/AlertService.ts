import { Logger } from '../core/Logger.js';
import { Alert } from '../types/index.js';

export class AlertService {
  private static instance: AlertService;
  private logger = Logger.getInstance();
  private alerts: Map<string, Alert> = new Map();
  private subscribers: Array<(alert: Alert) => void> = [];

  private constructor() {}

  static getInstance(): AlertService {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService();
    }
    return AlertService.instance;
  }

  createAlert(alert: Omit<Alert, 'id'>): Alert {
    const fullAlert: Alert = {
      ...alert,
      id: this.generateAlertId()
    };

    this.alerts.set(fullAlert.id, fullAlert);
    this.logger.info('Alert created', { id: fullAlert.id, type: fullAlert.type });

    return fullAlert;
  }

  triggerAlert(alertId: string, currentValue: number): void {
    const alert = this.alerts.get(alertId);
    if (!alert) return;

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

  private evaluateCondition(alert: Alert, currentValue: number): boolean {
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

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  subscribe(callback: (alert: Alert) => void): void {
    this.subscribers.push(callback);
  }

  private notifySubscribers(alert: Alert): void {
    this.subscribers.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        this.logger.error('Error notifying alert subscriber', {}, error as Error);
      }
    });
  }

  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.triggered);
  }

  deleteAlert(alertId: string): boolean {
    return this.alerts.delete(alertId);
  }
}