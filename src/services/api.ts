import {
  AdminStats,
  ColorRule,
  DayOfWeekKey,
  MatchResultResponse,
  NotificationItem,
  OccasionOption,
  SavedOutfit,
  StyleOption,
  SystemSettings,
  UserProfile,
} from '../types';

class ApiService {
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const storedUser = localStorage.getItem('dcm_user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u?.id) headers['x-user-id'] = u.id;
        if (u?.role === 'admin') {
          headers['x-admin-id'] = u.id;
          headers['x-user-role'] = 'admin';
        }
      } catch (e) {
        // ignore
      }
    }
    return headers;
  }

  // Session & Local Storage
  getStoredUser(): UserProfile | null {
    try {
      const u = localStorage.getItem('dcm_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }

  setStoredUser(user: UserProfile | null): void {
    if (user) {
      localStorage.setItem('dcm_user', JSON.stringify(user));
      localStorage.setItem('dcm_token', user.id);
    } else {
      localStorage.removeItem('dcm_user');
      localStorage.removeItem('dcm_token');
    }
  }

  getToken(): string | null {
    return localStorage.getItem('dcm_token');
  }

  logout(): void {
    this.setStoredUser(null);
  }

  async getCurrentUser(): Promise<UserProfile> {
    const res = await this.getMe();
    if (res.user) {
      this.setStoredUser(res.user);
      return res.user;
    }
    throw new Error('No active user');
  }

  // Auth
  async login(email: string, password: string): Promise<{ success: boolean; user: UserProfile }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
    this.setStoredUser(data.user);
    return data;
  }

  async register(payload: {
    name: string;
    email: string;
    password: string;
    birthday?: string;
    birthDayOfWeek?: DayOfWeekKey;
    gender?: string;
    preferredStyle?: StyleOption;
  }): Promise<{ success: boolean; user: UserProfile }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'ลงทะเบียนไม่สำเร็จ');
    this.setStoredUser(data.user);
    return data;
  }

  async getMe(): Promise<{ user: UserProfile }> {
    const res = await fetch('/api/auth/me', {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  }

  async updateProfile(payload: Partial<UserProfile>): Promise<{ success: boolean; user: UserProfile }> {
    const res = await fetch('/api/auth/update-profile', {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'ไม่สามารถอัปเดตข้อมูลได้');
    return data;
  }

  // Rules
  async getRules(dayOfWeek?: DayOfWeekKey, type?: string): Promise<{ rules: ColorRule[] }> {
    const params = new URLSearchParams();
    if (dayOfWeek) params.append('dayOfWeek', dayOfWeek);
    if (type) params.append('type', type);
    const res = await fetch(`/api/rules?${params.toString()}`);
    return res.json();
  }

  // Match Engine
  async matchOutfit(payload: {
    birthday?: string;
    birthDayOfWeek?: DayOfWeekKey;
    targetDate?: string;
    occasion?: OccasionOption;
    style?: StyleOption;
    preferredColors?: string[];
    userId?: string;
  }): Promise<MatchResultResponse> {
    const res = await fetch('/api/match', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'ขออภัย ระบบกำลังประมวลผล กรุณาลองใหม่อีกครั้ง');
    return data;
  }

  // Saved Outfits
  async saveOutfit(payload: {
    userId?: string;
    title?: string;
    targetDate: string;
    targetDayOfWeek?: DayOfWeekKey;
    style: StyleOption;
    occasion: OccasionOption;
    combination: any;
    notes?: string;
  }): Promise<{ success: boolean; savedOutfit: SavedOutfit }> {
    const res = await fetch('/api/outfits/save', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'ไม่สามารถบันทึกชุดได้');
    return data;
  }

  async getSavedOutfits(userId?: string): Promise<{ savedOutfits: SavedOutfit[] }> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    const res = await fetch(`/api/outfits/saved?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async deleteSavedOutfit(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/outfits/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async getHistory(userId?: string): Promise<{ history: any[] }> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    const res = await fetch(`/api/outfits/history?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  // Notifications
  async getNotifications(): Promise<{ notifications: NotificationItem[] }> {
    const res = await fetch('/api/notifications', {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async deleteNotification(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/notifications/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return res.json();
  }

  // Admin
  async getAdminDashboard(): Promise<AdminStats> {
    const res = await fetch('/api/admin/dashboard', {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Unauthorized or failed to load dashboard');
    return res.json();
  }

  async getAdminMembers(search?: string, status?: string): Promise<{ members: UserProfile[] }> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    const res = await fetch(`/api/admin/members?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async toggleMemberStatus(id: string): Promise<{ success: boolean; status: string }> {
    const res = await fetch(`/api/admin/members/${id}/status`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async deleteMember(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/admin/members/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async getAdminRules(): Promise<{ rules: ColorRule[] }> {
    const res = await fetch('/api/admin/rules', {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async createRule(payload: Partial<ColorRule>): Promise<{ success: boolean; rule: ColorRule }> {
    const res = await fetch('/api/admin/rules', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create rule');
    return data;
  }

  async updateRule(id: string, payload: Partial<ColorRule>): Promise<{ success: boolean; rule: ColorRule }> {
    const res = await fetch(`/api/admin/rules/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update rule');
    return data;
  }

  async deleteRule(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/admin/rules/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async resetRulesToSeed(): Promise<{ success: boolean; rules: ColorRule[] }> {
    const res = await fetch('/api/admin/rules/reset', {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async getSettings(): Promise<{ settings: SystemSettings }> {
    const res = await fetch('/api/admin/settings');
    return res.json();
  }

  async updateSettings(payload: Partial<SystemSettings>): Promise<{ success: boolean; settings: SystemSettings }> {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  async getAdminLogs(): Promise<{ logs: any[] }> {
    const res = await fetch('/api/admin/logs', {
      headers: this.getHeaders(),
    });
    return res.json();
  }
}

export const api = new ApiService();
