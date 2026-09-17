import fs from 'fs';
import path from 'path';
import {
  ColorRule,
  NotificationItem,
  SavedOutfit,
  SystemSettings,
  UserProfile,
} from '../src/types';
import { SEED_COLOR_RULES } from './seedRules';

export interface UserAccount extends UserProfile {
  passwordHash: string;
}

export interface ActivityLog {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  details: string;
  ip?: string;
  timestamp: string;
}

export interface MatchHistoryEntry {
  id: string;
  userId?: string;
  birthDayOfWeek: string;
  targetDate: string;
  targetDayOfWeek: string;
  style: string;
  occasion: string;
  combinationId: string;
  topColor: string;
  bottomColor: string;
  score: number;
  timestamp: string;
}

export interface DatabaseSchema {
  users: UserAccount[];
  colorRules: ColorRule[];
  savedOutfits: SavedOutfit[];
  matchHistory: MatchHistoryEntry[];
  notifications: NotificationItem[];
  activityLogs: ActivityLog[];
  settings: SystemSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const DEFAULT_SETTINGS: SystemSettings = {
  siteName: 'Daily Color Match',
  logoText: 'Daily Color Match',
  themeColor: '#EC4899',
  defaultStyle: 'Minimal',
  harmonyThreshold: 85,
  enableAnimations: true,
  enableWelcomePopup: true,
  enableResultConfetti: true,
  enableNotifications: true,
  seedDataDisclaimer:
    'ข้อมูลสีใน Seed Data เป็นข้อมูลตัวอย่างสำหรับทดสอบระบบ สามารถแก้ไขได้จาก Admin',
};

// In-memory fallback / cache
let dbCache: DatabaseSchema | null = null;

function ensureDbFile(): DatabaseSchema {
  if (dbCache) return dbCache;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(content);
      // Ensure seed rules exist if empty
      if (!dbCache?.colorRules || dbCache.colorRules.length === 0) {
        dbCache!.colorRules = [...SEED_COLOR_RULES];
      }
      return dbCache!;
    } catch (e) {
      console.warn('Could not read db.json, reinitializing default data:', e);
    }
  }

  // Initialize fresh database
  const initialAdmin: UserAccount = {
    id: 'user-admin-1',
    name: 'Admin System',
    email: 'admin@dailycolormatch.com',
    passwordHash: 'admin1234', // For demonstration/testing
    role: 'admin',
    birthday: '1995-08-12',
    birthDayOfWeek: 'saturday',
    gender: 'female',
    preferredStyle: 'Minimal',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  };

  const sampleMember: UserAccount = {
    id: 'user-demo-1',
    name: 'Natcha Somchai',
    email: 'user@example.com',
    passwordHash: 'password123',
    role: 'user',
    birthday: '1998-05-20',
    birthDayOfWeek: 'wednesday_day',
    gender: 'female',
    preferredStyle: 'Korean',
    favoriteColors: ['#EC4899', '#38BDF8'],
    dislikedColors: ['#000000'],
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    lastActive: new Date().toISOString(),
  };

  const initialNotifications: NotificationItem[] = [
    {
      id: 'notif-1',
      userId: 'user-demo-1',
      title: 'ยินดีต้อนรับสู่ Daily Color Match ✨',
      message: 'เริ่มค้นหาสีเสื้อผ้าที่เสริมความมั่นใจและโชคลาภประจำวันของคุณได้เลย!',
      type: 'info',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif-2',
      userId: 'user-demo-1',
      title: 'สีมงคลวันนี้สำหรับคุณ 🌸',
      message: 'คนเกิดวันพุธกลางวัน วันนี้สีเขียวมรกตและน้ำเงินครามนำพาโชคลาภเป็นพิเศษ',
      type: 'lucky',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  ];

  dbCache = {
    users: [initialAdmin, sampleMember],
    colorRules: [...SEED_COLOR_RULES],
    savedOutfits: [],
    matchHistory: [
      {
        id: 'hist-1',
        userId: 'user-demo-1',
        birthDayOfWeek: 'wednesday_day',
        targetDate: new Date().toISOString().split('T')[0],
        targetDayOfWeek: 'thursday',
        style: 'Minimal',
        occasion: 'ทำงาน',
        combinationId: 'comb-harmony-1',
        topColor: '#10B981',
        bottomColor: '#FFFFFF',
        score: 95,
        timestamp: new Date().toISOString(),
      },
    ],
    notifications: initialNotifications,
    activityLogs: [
      {
        id: 'log-1',
        action: 'SYSTEM_BOOT',
        details: 'ระบบ Daily Color Match เริ่มต้นทำงานเรียบร้อยพร้อม Seed Rules',
        timestamp: new Date().toISOString(),
      },
    ],
    settings: DEFAULT_SETTINGS,
  };

  persistDb();
  return dbCache;
}

function persistDb() {
  if (!dbCache) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to persist db.json:', e);
  }
}

export const db = {
  get: () => ensureDbFile(),
  save: () => persistDb(),
  resetRules: () => {
    const data = ensureDbFile();
    data.colorRules = [...SEED_COLOR_RULES];
    persistDb();
    return data.colorRules;
  },
  logActivity: (action: string, details: string, userId?: string, userName?: string) => {
    const data = ensureDbFile();
    data.activityLogs.unshift({
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId,
      userName,
      action,
      details,
      timestamp: new Date().toISOString(),
    });
    if (data.activityLogs.length > 200) {
      data.activityLogs = data.activityLogs.slice(0, 200);
    }
    persistDb();
  },
};
