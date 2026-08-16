import { QueueItem, TicketType, TicketStatus } from '../types';
import { StorageService } from './storage';
import { AnalyticsService } from './analyticsService';

export class QueueService {
  /**
   * Calculate wait time estimation based on historical served records (Section 27)
   */
  static getWaitTimeEstimation(shopId: string): { minutes: number | null; text: string } {
    const allItems = StorageService.getQueueItems();
    const servedItems = allItems
      .filter(item => item.shop_id === shopId && item.status === 'served' && item.served_at && (item.created_at || item.joined_at))
      .sort((a, b) => new Date(b.served_at!).getTime() - new Date(a.served_at!).getTime())
      .slice(0, 30);

    // If fewer than 2 valid records: return collecting data text
    if (servedItems.length < 2) {
      return { minutes: null, text: 'در حال جمع‌آوری داده' };
    }

    let totalCalculatedMinutes = 0;
    let count = 0;

    for (const item of servedItems) {
      const startTime = new Date(item.created_at || item.joined_at).getTime();
      const endTime = new Date(item.served_at!).getTime();
      
      let durationSec = item.wait_duration_seconds;
      if (!durationSec || durationSec <= 0) {
        durationSec = Math.max(1, Math.round((endTime - startTime) / 1000));
      }

      let diffMinutes = durationSec / 60;

      // If quantity > 1, normalize per ticket/unit
      if (item.quantity && item.quantity > 1) {
        diffMinutes = diffMinutes / item.quantity;
      }

      totalCalculatedMinutes += diffMinutes;
      count++;
    }

    const avgMinutes = Math.max(1, Math.round(totalCalculatedMinutes / count));
    return { minutes: avgMinutes, text: `${avgMinutes} دقیقه` };
  }

  /**
   * Get active queue items for a shop
   */
  static getShopQueue(shopId: string) {
    const allItems = StorageService.getQueueItems();
    const shopItems = allItems.filter(i => i.shop_id === shopId);

    const servingItem = shopItems.find(i => i.status === 'serving' || i.status === 'calling');
    const waitingItems = shopItems
      .filter(i => i.status === 'waiting')
      .sort((a, b) => new Date(a.created_at || a.joined_at).getTime() - new Date(b.created_at || b.joined_at).getTime())
      .map((item, index) => ({
        ...item,
        position: index + 1
      }));

    const servedCount = shopItems.filter(i => i.status === 'served').length;

    return {
      servingItem,
      waitingItems,
      waitingCount: waitingItems.length,
      servedCount,
      estimatedWait: this.getWaitTimeEstimation(shopId)
    };
  }

  /**
   * Create a new ticket (Section 21, 23) with exact creation timestamp
   */
  static createTicket(params: {
    shopId: string;
    customerName?: string;
    customerPhone?: string;
    customerUserId?: string;
    ticketType?: TicketType;
    quantity?: number;
    threshold?: number;
    orderedItems?: { name: string; quantity: number }[];
    itemsSummary?: string;
  }): QueueItem {
    const allItems = StorageService.getQueueItems();
    const shopItems = allItems.filter(i => i.shop_id === params.shopId);

    // Calculate max ticket number for today
    const maxTicketNum = shopItems.reduce((max, item) => Math.max(max, item.ticket_number || 0), 0);
    const nextTicketNumber = maxTicketNum + 1;

    const waitingCount = shopItems.filter(i => i.status === 'waiting').length;
    const nowIso = new Date().toISOString();

    const newItem: QueueItem = {
      id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      shop_id: params.shopId,
      ticket_number: nextTicketNumber,
      customer_user_id: params.customerUserId,
      customer_name: params.customerName || 'مشتری محترم',
      customer_phone: params.customerPhone,
      ticket_type: params.ticketType || 'in_person_single',
      quantity: params.quantity || 1,
      ordered_items: params.orderedItems,
      items_summary: params.itemsSummary,
      status: 'waiting',
      position: waitingCount + 1,
      threshold: params.threshold || 3,
      joined_at: nowIso,
      created_at: nowIso
    };

    StorageService.saveQueueItem(newItem);

    // Track analytics
    AnalyticsService.trackEvent({
      event_name: 'ticket_create',
      shop_id: params.shopId,
      user_id: params.customerUserId,
      queue_item_id: newItem.id
    });

    return newItem;
  }

  /**
   * Serve Next with Interleaving Algorithm (Section 26) & Exact Timestamp and Duration Calculation
   */
  static serveNext(shopId: string): { success: boolean; item?: QueueItem; message?: string } {
    const allItems = StorageService.getQueueItems();
    const shopItems = allItems.filter(i => i.shop_id === shopId);
    const nowIso = new Date().toISOString();

    const currentServing = shopItems.find(i => i.status === 'serving' || i.status === 'calling');
    const waitingItems = shopItems
      .filter(i => i.status === 'waiting')
      .sort((a, b) => new Date(a.created_at || a.joined_at).getTime() - new Date(b.created_at || b.joined_at).getTime());

    if (waitingItems.length === 0) {
      if (currentServing) {
        currentServing.status = 'served';
        currentServing.served_at = nowIso;
        const startTime = new Date(currentServing.created_at || currentServing.joined_at).getTime();
        currentServing.wait_duration_seconds = Math.max(1, Math.round((new Date(nowIso).getTime() - startTime) / 1000));
        StorageService.saveQueueItem(currentServing);
      }
      return { success: false, message: 'هیچ نوبتی در صف انتظار نیست' };
    }

    // Mark current serving as served with calculated wait duration
    if (currentServing) {
      currentServing.status = 'served';
      currentServing.served_at = nowIso;
      const startTime = new Date(currentServing.created_at || currentServing.joined_at).getTime();
      currentServing.wait_duration_seconds = Math.max(1, Math.round((new Date(nowIso).getTime() - startTime) / 1000));
      StorageService.saveQueueItem(currentServing);
    }

    // Determine last served type from Shop
    const shops = StorageService.getShops();
    const shop = shops.find(s => s.id === shopId);
    let lastServedType = shop?.last_served_type || null;

    if (!lastServedType) {
      // Fallback to queue_items history if not in shop yet
      const lastServed = shopItems
        .filter(i => i.status === 'served' && i.served_at)
        .sort((a, b) => new Date(b.served_at!).getTime() - new Date(a.served_at!).getTime())[0];
      lastServedType = lastServed?.ticket_type || null;
    }

    // Algorithm (Section 26):
    // If last_served_type is null or multi -> next type = in_person_single
    // Otherwise -> next type = in_person_multi
    let nextItem: QueueItem | undefined;

    if (!lastServedType || lastServedType === 'in_person_multi') {
      nextItem = waitingItems.find(i => i.ticket_type === 'in_person_single');
    } else {
      nextItem = waitingItems.find(i => i.ticket_type === 'in_person_multi');
    }

    // Fallback if target type not found
    if (!nextItem) {
      nextItem = waitingItems[0];
    }

    nextItem.status = 'serving';
    nextItem.called_at = nowIso;
    const startNext = new Date(nextItem.created_at || nextItem.joined_at).getTime();
    nextItem.wait_duration_seconds = Math.max(1, Math.round((new Date(nowIso).getTime() - startNext) / 1000));
    
    StorageService.saveQueueItem(nextItem);
    
    if (shop) {
      shop.last_served_type = nextItem.ticket_type;
      StorageService.saveShop(shop);
    }

    // Update positions for remaining
    this.recalculatePositions(shopId);

    // Track analytics
    AnalyticsService.trackEvent({
      event_name: 'ticket_served',
      shop_id: shopId,
      queue_item_id: nextItem.id
    });

    // Dispatch global event for header banner & live announcer
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bisaf-ticket-calling', { 
        detail: {
          ticket: nextItem,
          shopName: shop?.name || 'فروشگاه'
        }
      }));
    }

    return { success: true, item: nextItem };
  }

  /**
   * Complete ticket manually
   */
  static completeTicket(ticketId: string): boolean {
    const allItems = StorageService.getQueueItems();
    const item = allItems.find(i => i.id === ticketId);
    if (!item) return false;

    const nowIso = new Date().toISOString();
    item.status = 'served';
    item.served_at = nowIso;

    const startTime = new Date(item.created_at || item.joined_at).getTime();
    item.wait_duration_seconds = Math.max(1, Math.round((new Date(nowIso).getTime() - startTime) / 1000));

    StorageService.saveQueueItem(item);
    this.recalculatePositions(item.shop_id);

    AnalyticsService.trackEvent({
      event_name: 'ticket_served',
      shop_id: item.shop_id,
      queue_item_id: item.id
    });

    return true;
  }

  /**
   * Cancel ticket
   */
  static cancelTicket(ticketId: string): boolean {
    const allItems = StorageService.getQueueItems();
    const item = allItems.find(i => i.id === ticketId);
    if (!item) return false;

    item.status = 'cancelled';
    item.cancelled_at = new Date().toISOString();
    StorageService.saveQueueItem(item);

    this.recalculatePositions(item.shop_id);

    AnalyticsService.trackEvent({
      event_name: 'ticket_cancel',
      shop_id: item.shop_id,
      queue_item_id: item.id
    });

    return true;
  }

  /**
   * Recalculate positions for all waiting items in a shop
   */
  private static recalculatePositions(shopId: string): void {
    const allItems = StorageService.getQueueItems();
    const waiting = allItems
      .filter(i => i.shop_id === shopId && i.status === 'waiting')
      .sort((a, b) => new Date(a.created_at || a.joined_at).getTime() - new Date(b.created_at || b.joined_at).getTime());

    waiting.forEach((item, index) => {
      item.position = index + 1;
      StorageService.saveQueueItem(item);
    });
  }
}
