import { Alert } from '../types/index.js';
export interface NotificationConfig {
    telegram: {
        botToken: string;
        chatId: string;
        enabled: boolean;
    };
    email: {
        enabled: boolean;
        smtpHost: string;
        smtpPort: number;
        username: string;
        password: string;
        from: string;
        to: string;
    };
    desktop: {
        enabled: boolean;
    };
}
export declare class NotificationService {
    private static instance;
    private logger;
    private config;
    private constructor();
    static getInstance(): NotificationService;
    updateConfig(config: Partial<NotificationConfig>): void;
    sendAlert(alert: Alert): Promise<void>;
    private formatAlertMessage;
    private sendDesktopNotification;
    private sendTelegramMessage;
    private sendEmailNotification;
    sendSystemNotification(title: string, message: string, priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): Promise<void>;
}
