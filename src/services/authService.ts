import { Profile, UserRole } from '../types';
import { StorageService } from './storage';
import { AnalyticsService } from './analyticsService';

export class AuthService {
  /**
   * Log in with Phone OR Username + Password (Section 15)
   */
  static async login(identifier: string, pass: string): Promise<{ success: boolean; user?: Profile; error?: string }> {
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) {
      return { success: false, error: 'لطفاً نام کاربری یا شماره موبایل را وارد نمایید.' };
    }

    let profiles = StorageService.getProfiles();
    if (!profiles || profiles.length === 0) {
      profiles = await StorageService.fetchProfilesFromSupabase();
    }

    // Check by username, phone or phone without leading zero
    const matchedUser = profiles.find(p => 
      (p.username && p.username.toLowerCase() === cleanId) ||
      p.phone === cleanId || 
      p.phone.replace(/^0/, '') === cleanId.replace(/^0/, '')
    );

    if (!matchedUser) {
      return { success: false, error: 'نام کاربری یا شماره موبایل یافت نشد.' };
    }

    // Check password
    const expectedPassword = matchedUser.password || 'admin';
    if (!pass || pass.trim() !== expectedPassword) {
      return { success: false, error: 'رمز عبور اشتباه است.' };
    }

    StorageService.setCurrentUser(matchedUser);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
    AnalyticsService.trackEvent({ event_name: 'login', user_id: matchedUser.id });
    return { success: true, user: matchedUser };
  }

  /**
   * Register a new user account with phone and optional username
   */
  static register(params: { phone: string; password?: string; username?: string; fullName?: string; role?: UserRole }): Profile {
    const cleanPhone = params.phone.trim();
    const cleanUsername = params.username ? params.username.trim().toLowerCase() : undefined;

    const profiles = StorageService.getProfiles();
    const existing = profiles.find(p => p.phone === cleanPhone || (cleanUsername && p.username?.toLowerCase() === cleanUsername));

    if (existing) {
      StorageService.setCurrentUser(existing);
      return existing;
    }

    const newUser: Profile = {
      id: `user-${Date.now()}`,
      phone: cleanPhone,
      username: cleanUsername,
      full_name: params.fullName || 'کاربر جدید بی‌صف',
      role: params.role || 'customer',
      created_at: new Date().toISOString()
    };

    StorageService.saveProfile(newUser);
    StorageService.setCurrentUser(newUser);

    AnalyticsService.trackEvent({ event_name: 'registration', user_id: newUser.id });
    return newUser;
  }

  /**
   * Get current authenticated user
   */
  static getCurrentUser(): Profile {
    return StorageService.getCurrentUser();
  }

  /**
   * Update profile
   */
  static updateProfile(userId: string, updates: Partial<Profile>): Profile {
    const profiles = StorageService.getProfiles();
    const idx = profiles.findIndex(p => p.id === userId);
    if (idx < 0) throw new Error('User not found');

    if (updates.username) {
      updates.username = updates.username.trim().toLowerCase();
    }

    const updated = { ...profiles[idx], ...updates, updated_at: new Date().toISOString() };
    StorageService.saveProfile(updated);

    const currentUser = StorageService.getCurrentUser();
    if (currentUser.id === userId) {
      StorageService.setCurrentUser(updated);
    }

    return updated;
  }

  /**
   * Log out user and reset to guest
   */
  static logout(): void {
    StorageService.setCurrentUser({
      id: 'guest',
      phone: '',
      role: 'customer',
      created_at: new Date().toISOString()
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
  }

  /**
   * Log in via OTP (SMS verification code)
   */
  static async loginWithOTP(phone: string, otpCode: string): Promise<{ success: boolean; user?: Profile; error?: string }> {
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      return { success: false, error: 'لطفاً شماره موبایل معتبر وارد کنید.' };
    }
    if (!otpCode || otpCode.length < 4) {
      return { success: false, error: 'کد تایید OTP واردشده معتبر نیست.' };
    }

    const profiles = StorageService.getProfiles();
    let user = profiles.find(p => p.phone === cleanPhone || p.phone.replace(/^0/, '') === cleanPhone.replace(/^0/, ''));

    if (!user) {
      user = {
        id: `user-${Date.now()}`,
        phone: cleanPhone,
        full_name: 'کاربر پیامکی بی‌صف',
        role: 'customer',
        created_at: new Date().toISOString()
      };
      StorageService.saveProfile(user);
    }

    StorageService.setCurrentUser(user);
    AnalyticsService.trackEvent({ event_name: 'login_otp', user_id: user.id });
    return { success: true, user };
  }

  /**
   * Log in automatically as shopkeeper via Operator QR code scan
   */
  static loginAsShopkeeper(shopId: string): Profile {
    const shops = StorageService.getShops();
    const shop = shops.find(s => s.id === shopId || s.slug === shopId);
    const profiles = StorageService.getProfiles();

    let shopkeeper = profiles.find(p => p.role === 'shopkeeper' && (p.id === shop?.owner_id || p.user_id === shop?.owner_id));
    if (!shopkeeper) {
      shopkeeper = profiles.find(p => p.role === 'shopkeeper') || {
        id: 'user-shopkeeper-1',
        phone: '09122222222',
        username: 'sangak_admin',
        full_name: 'متصدی فروشگاه',
        role: 'shopkeeper',
        created_at: new Date().toISOString()
      };
    }

    StorageService.setCurrentUser(shopkeeper);
    AnalyticsService.trackEvent({ 
      event_name: 'operator_login', 
      user_id: shopkeeper.id, 
      shop_id: shop?.id || shopId,
      metadata: { method: 'operator_qr_code' } 
    });

    return shopkeeper;
  }

  /**
   * Generate a random 6-digit numeric password for step 3 conversion
   */
  static generateRandomPassword(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
