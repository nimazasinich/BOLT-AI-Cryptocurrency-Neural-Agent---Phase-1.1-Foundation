import { Logger } from '../core/Logger.js';
export class NotificationService {
    static instance;
    logger = Logger.getInstance();
    config = {
        telegram: {
            botToken: '',
            chatId: '',
            enabled: false
        },
        email: {
            enabled: false,
            smtpHost: '',
            smtpPort: 587,
            username: '',
            password: '',
            from: '',
            to: ''
        },
        desktop: {
            enabled: true
        }
    };
    constructor() { }
    static getInstance() {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.logger.info('Notification config updated');
    }
    async sendAlert(alert) {
        const message = this.formatAlertMessage(alert);
        try {
            if (this.config.desktop.enabled) {
                await this.sendDesktopNotification(message, alert.priority);
            }
            if (this.config.telegram.enabled && this.config.telegram.botToken) {
                await this.sendTelegramMessage(message);
            }
            if (this.config.email.enabled) {
                await this.sendEmailNotification(message, alert);
            }
            this.logger.info('Alert notification sent', { alertId: alert.id });
        }
        catch (error) {
            this.logger.error('Failed to send alert notification', { alertId: alert.id }, error);
        }
    }
    formatAlertMessage(alert) {
        const timestamp = new Date(alert.triggerTime || Date.now()).toLocaleString();
        return `🚨 BOLT AI Alert - ${alert.priority}

Symbol: ${alert.symbol}
Type: ${alert.type}
Condition: ${alert.condition}
Current Value: ${alert.currentValue}
Threshold: ${alert.threshold}
Time: ${timestamp}

Message: ${alert.message}`;
    }
    async sendDesktopNotification(message, priority) {
        // In a real desktop app, this would use Windows Toast notifications
        console.log(`Desktop Notification [${priority}]: ${message}`);
    }
    async sendTelegramMessage(message) {
        try {
            const url = `https://api.telegram.org/bot${this.config.telegram.botToken}/sendMessage`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: this.config.telegram.chatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            });
            if (!response.ok) {
                throw new Error(`Telegram API error: ${response.statusText}`);
            }
            this.logger.info('Telegram notification sent successfully');
        }
        catch (error) {
            this.logger.error('Failed to send Telegram notification', {}, error);
            throw error;
        }
    }
    async sendEmailNotification(message, alert) {
        // Email implementation would go here
        this.logger.info('Email notification would be sent', { alertId: alert.id });
    }
    async sendSystemNotification(title, message, priority = 'MEDIUM') {
        try {
            if (this.config.desktop.enabled) {
                await this.sendDesktopNotification(`${title}\n\n${message}`, priority);
            }
            if (this.config.telegram.enabled && priority === 'CRITICAL') {
                await this.sendTelegramMessage(`🔥 ${title}\n\n${message}`);
            }
            this.logger.info('System notification sent', { title, priority });
        }
        catch (error) {
            this.logger.error('Failed to send system notification', { title }, error);
        }
    }
}
