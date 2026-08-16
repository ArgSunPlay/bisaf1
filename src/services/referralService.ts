import { AnalyticsService } from './analyticsService';

export interface Referral {
  id: string;
  inviter_id: string;
  invited_phone: string;
  invited_user_id?: string;
  status: 'pending' | 'successful';
  created_at: string;
}

export class ReferralService {
  private static referralsKey = 'bisaf_referrals';

  static getReferrals(): Referral[] {
    const data = localStorage.getItem(this.referralsKey);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static createReferral(inviterId: string, invitedPhone: string): Referral {
    const referrals = this.getReferrals();
    
    // Check if already exists
    const existing = referrals.find(r => r.invited_phone === invitedPhone);
    if (existing) return existing;

    const newRef: Referral = {
      id: `ref-${Date.now()}`,
      inviter_id: inviterId,
      invited_phone: invitedPhone,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    referrals.push(newRef);
    localStorage.setItem(this.referralsKey, JSON.stringify(referrals));
    
    AnalyticsService.trackEvent({
      event_name: 'referral',
      user_id: inviterId,
      metadata: { invited_phone: invitedPhone }
    });
    
    return newRef;
  }
}
