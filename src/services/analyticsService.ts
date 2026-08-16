import { AnalyticsEvent } from '../types';

const ANALYTICS_KEY = 'bisaf_analytics_events';

export class AnalyticsService {
  /**
   * Track analytics event (Section 52)
   * Events: page_view, login, logout, registration, qr_scan, ticket_create, ticket_cancel, ticket_served, app_install, bot_click, referral, payment_started, payment_success, payment_failed, notification_sent, notification_failed
   */
  static trackEvent(params: {
    event_name: string;
    user_id?: string;
    shop_id?: string;
    queue_item_id?: string;
    provider?: string;
    metadata?: Record<string, unknown>;
  }): void {
    try {
      const stored = localStorage.getItem(ANALYTICS_KEY);
      const events: AnalyticsEvent[] = stored ? JSON.parse(stored) : [];

      const newEvent: AnalyticsEvent = {
        id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        event_name: params.event_name,
        user_id: params.user_id,
        shop_id: params.shop_id,
        queue_item_id: params.queue_item_id,
        provider: params.provider,
        metadata: params.metadata || {},
        created_at: new Date().toISOString()
      };

      events.unshift(newEvent);
      // Keep recent 500 events
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events.slice(0, 500)));
    } catch (e) {
      console.error('Analytics tracking error', e);
    }
  }

  static getEvents(): AnalyticsEvent[] {
    try {
      const stored = localStorage.getItem(ANALYTICS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get detailed per-shop activity & daily breakdown stats
   */
  static getShopDetailedStats(shopId: string): {
    totalTickets: number;
    todayTickets: number;
    guestConversions: number;
    operatorUsages: number;
    servedTickets: number;
    cancelledTickets: number;
    avgWaitMinutes: number;
    dailyBreakdown: Array<{
      date: string;
      jalaliDate: string;
      ticketsCount: number;
      servedCount: number;
      cancelledCount: number;
      guestConversions: number;
      operatorUsages: number;
      avgWaitMinutes: number;
    }>;
  } {
    const rawQueue = localStorage.getItem('bisaf_queue_items');
    const queueItems: any[] = rawQueue ? JSON.parse(rawQueue) : [];
    const shopTickets = queueItems.filter(item => item.shop_id === shopId);

    const events = this.getEvents().filter(e => e.shop_id === shopId);

    // Operator app usages: operator calls + operator logins
    const operatorEvents = events.filter(e => e.event_name === 'operator_login' || e.event_name === 'ticket_served');
    const operatorUsagesCount = Math.max(
      operatorEvents.length,
      shopTickets.filter(t => t.status === 'served').length
    );

    // Guest conversions: tickets where user converted / registered
    const guestConversionsCount = shopTickets.filter(t => t.customer_user_id || t.customer_phone).length;

    // Filter today
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTicketsCount = shopTickets.filter(t => t.created_at?.startsWith(todayStr)).length;

    const servedList = shopTickets.filter(t => t.status === 'served');
    const cancelledList = shopTickets.filter(t => t.status === 'cancelled');

    // Calculate average wait duration in minutes
    let totalWaitSec = 0;
    let waitCount = 0;
    servedList.forEach(t => {
      if (t.wait_duration_seconds) {
        totalWaitSec += t.wait_duration_seconds;
        waitCount++;
      } else if (t.joined_at && t.served_at) {
        const diffSec = Math.max(1, (new Date(t.served_at).getTime() - new Date(t.joined_at).getTime()) / 1000);
        totalWaitSec += diffSec;
        waitCount++;
      }
    });
    const avgWaitMinutes = waitCount > 0 ? Math.round((totalWaitSec / waitCount) / 60) : 0;

    // Group by Date for Daily Breakdown
    const dateGroups: Record<string, any[]> = {};
    shopTickets.forEach(t => {
      const dateKey = (t.created_at || t.joined_at || new Date().toISOString()).split('T')[0];
      if (!dateGroups[dateKey]) dateGroups[dateKey] = [];
      dateGroups[dateKey].push(t);
    });

    const dailyBreakdown = Object.keys(dateGroups)
      .sort((a, b) => b.localeCompare(a)) // latest dates first
      .map(dateKey => {
        const items = dateGroups[dateKey];
        const dateObj = new Date(dateKey);
        const jalaliDate = dateObj.toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' });

        const sCount = items.filter(i => i.status === 'served').length;
        const cCount = items.filter(i => i.status === 'cancelled').length;
        const gConverted = items.filter(i => i.customer_user_id || i.customer_phone).length;

        let dayWaitSec = 0;
        let dayWaitCount = 0;
        items.filter(i => i.status === 'served').forEach(i => {
          if (i.wait_duration_seconds) {
            dayWaitSec += i.wait_duration_seconds;
            dayWaitCount++;
          }
        });
        const dayAvgWait = dayWaitCount > 0 ? Math.round((dayWaitSec / dayWaitCount) / 60) : avgWaitMinutes;

        return {
          date: dateKey,
          jalaliDate,
          ticketsCount: items.length,
          servedCount: sCount,
          cancelledCount: cCount,
          guestConversions: gConverted,
          operatorUsages: Math.max(sCount, 1),
          avgWaitMinutes: dayAvgWait
        };
      });

    return {
      totalTickets: shopTickets.length,
      todayTickets: todayTicketsCount,
      guestConversions: guestConversionsCount,
      operatorUsages: operatorUsagesCount,
      servedTickets: servedList.length,
      cancelledTickets: cancelledList.length,
      avgWaitMinutes,
      dailyBreakdown
    };
  }
}
