import { StorageService } from './storage';
import { SMSLog } from '../types';

export class NotificationService {
  /**
   * Request browser notification permissions
   */
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Send browser notification
   */
  static sendBrowserNotification(title: string, body: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/pwa-192x192.png',
          dir: 'rtl'
        });
      } catch (e) {
        console.error('Browser notification error', e);
      }
    }
  }

  /**
   * Send SMS Fallback (Section 49)
   * Exact text: "بی‌صف: سلام {نام}. الان {threshold} نفر تا نوبت شما در {نام کامل فروشگاه} باقی‌مانده. لطفاً به فروشگاه مراجعه کنید."
   */
  static sendSMSFallback(params: {
    customerName: string;
    customerPhone: string;
    threshold: number;
    shopName: string;
  }): SMSLog {
    const text = `بی‌صف: سلام ${params.customerName}. الان ${params.threshold} نفر تا نوبت شما در ${params.shopName} باقی‌مانده. لطفاً به فروشگاه مراجعه کنید.`;

    const smsLog: SMSLog = {
      id: `sms-${Date.now()}`,
      recipient_phone: params.customerPhone,
      message: text,
      provider: 'kavenegar',
      status: 'sent',
      created_at: new Date().toISOString()
    };

    return smsLog;
  }
}
