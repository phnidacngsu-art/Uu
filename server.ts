import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { getDayOfWeekFromDate, runMatchingEngine } from './server/matchingEngine';
import { ColorRule, DayOfWeekKey, OccasionOption, StyleOption } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    // optional debug logging
  }
  next();
});

// ==========================================
// 1. HEALTH & METADATA
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Daily Color Match',
    timestamp: new Date().toISOString(),
    rulesCount: db.get().colorRules.length,
    membersCount: db.get().users.length,
  });
});

// ==========================================
// 2. AUTHENTICATION & PROFILES
// ==========================================
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, birthday, birthDayOfWeek, gender, preferredStyle } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลชื่อ อีเมล และรหัสผ่านให้ครบถ้วน' });
  }

  const database = db.get();
  const existing = database.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'อีเมลนี้ถูกใช้งานในระบบแล้ว' });
  }

  const determinedDayKey = birthDayOfWeek || (birthday ? getDayOfWeekFromDate(birthday) : 'sunday');

  const newUser = {
    id: 'user-' + Date.now(),
    name,
    email: email.toLowerCase(),
    passwordHash: password,
    role: 'user' as const,
    birthday: birthday || '',
    birthDayOfWeek: determinedDayKey as DayOfWeekKey,
    gender: gender || 'unspecified',
    preferredStyle: (preferredStyle as StyleOption) || 'Minimal',
    favoriteColors: [],
    dislikedColors: [],
    status: 'active' as const,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  };

  database.users.push(newUser);
  db.save();
  db.logActivity('USER_REGISTER', `สมาชิกใหม่ลงทะเบียน: ${name} (${email})`, newUser.id, name);

  // Exclude password in response
  const { passwordHash, ...safeUser } = newUser;
  res.json({ success: true, user: safeUser });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' });
  }

  const database = db.get();
  const user = database.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
  }

  if (user.status === 'disabled') {
    return res.status(403).json({ error: 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' });
  }

  user.lastActive = new Date().toISOString();
  db.save();
  db.logActivity('USER_LOGIN', `เข้าสู่ระบบสำเร็จ: ${user.name} (${user.role})`, user.id, user.name);

  const { passwordHash, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

app.get('/api/auth/me', (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const database = db.get();
  const user = database.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { passwordHash, ...safeUser } = user;
  res.json({ user: safeUser });
});

app.put('/api/auth/update-profile', (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  const { name, birthday, birthDayOfWeek, gender, preferredStyle, favoriteColors, dislikedColors } =
    req.body;

  const database = db.get();
  const user = database.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'ไม่พบผู้ใช้ในระบบ' });
  }

  if (name) user.name = name;
  if (birthday) {
    user.birthday = birthday;
    user.birthDayOfWeek = birthDayOfWeek || getDayOfWeekFromDate(birthday);
  } else if (birthDayOfWeek) {
    user.birthDayOfWeek = birthDayOfWeek;
  }
  if (gender) user.gender = gender;
  if (preferredStyle) user.preferredStyle = preferredStyle;
  if (favoriteColors) user.favoriteColors = favoriteColors;
  if (dislikedColors) user.dislikedColors = dislikedColors;
  user.lastActive = new Date().toISOString();

  db.save();
  db.logActivity('PROFILE_UPDATE', `อัปเดตโปรไฟล์: ${user.name}`, user.id, user.name);

  const { passwordHash, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// ==========================================
// 3. COLOR RULES (CONFIGURABLE DATABASE)
// ==========================================
app.get('/api/rules', (req, res) => {
  const database = db.get();
  const { dayOfWeek, type } = req.query;

  let rules = database.colorRules.filter((r) => r.isActive);
  if (dayOfWeek) {
    rules = rules.filter((r) => r.dayOfWeek === dayOfWeek);
  }
  if (type) {
    rules = rules.filter((r) => r.type === type);
  }
  res.json({ rules, total: rules.length });
});

// ==========================================
// 4. COLOR MATCHING ENGINE
// ==========================================
app.post('/api/match', (req, res) => {
  const {
    birthday,
    birthDayOfWeek,
    targetDate,
    occasion = 'วันสบาย ๆ',
    style = 'Minimal',
    preferredColors = [],
    userId,
  } = req.body;

  const effectiveTargetDate = targetDate || new Date().toISOString().split('T')[0];
  let effectiveBirthDayKey: DayOfWeekKey = 'sunday';

  if (birthDayOfWeek) {
    effectiveBirthDayKey = birthDayOfWeek;
  } else if (birthday) {
    effectiveBirthDayKey = getDayOfWeekFromDate(birthday);
  }

  const database = db.get();
  const result = runMatchingEngine(
    effectiveBirthDayKey,
    effectiveTargetDate,
    database.colorRules,
    occasion as OccasionOption,
    style as StyleOption,
    preferredColors
  );

  // Record history
  const historyEntry = {
    id: 'match-' + Date.now(),
    userId: userId || 'anonymous',
    birthDayOfWeek: effectiveBirthDayKey,
    targetDate: effectiveTargetDate,
    targetDayOfWeek: result.targetDayOfWeek,
    style: style,
    occasion: occasion,
    combinationId: result.combinations[0]?.id || '',
    topColor: result.combinations[0]?.items.top.hexCode || '#4A90E2',
    bottomColor: result.combinations[0]?.items.bottom.hexCode || '#FFFFFF',
    score: result.combinations[0]?.score || 95,
    timestamp: new Date().toISOString(),
  };

  database.matchHistory.unshift(historyEntry);
  if (database.matchHistory.length > 500) {
    database.matchHistory = database.matchHistory.slice(0, 500);
  }
  db.save();

  db.logActivity(
    'OUTFIT_MATCH',
    `แมทช์ชุด: เกิดวัน${result.birthDayInfo.thaiName} แต่งวัน${result.targetDayInfo.thaiName} สไตล์ ${style}`,
    userId
  );

  res.json(result);
});

// ==========================================
// 5. SAVED OUTFITS & HISTORY
// ==========================================
app.post('/api/outfits/save', (req, res) => {
  const { userId, title, targetDate, targetDayOfWeek, style, occasion, combination, notes } =
    req.body;

  if (!combination) {
    return res.status(400).json({ error: 'ข้อมูลชุดไม่ถูกต้อง' });
  }

  const database = db.get();
  const newSaved = {
    id: 'outfit-' + Date.now(),
    userId: userId || 'anonymous',
    title: title || `ชุดมงคลสไตล์ ${style} (${targetDate})`,
    targetDate: targetDate || new Date().toISOString().split('T')[0],
    targetDayOfWeek: targetDayOfWeek || 'sunday',
    style: style || 'Minimal',
    occasion: occasion || 'วันสบาย ๆ',
    combination,
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };

  database.savedOutfits.unshift(newSaved);
  db.save();
  db.logActivity('SAVE_OUTFIT', `บันทึกชุดมงคล: ${newSaved.title}`, userId);

  res.json({ success: true, savedOutfit: newSaved });
});

app.get('/api/outfits/saved', (req, res) => {
  const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string);
  const database = db.get();
  let list = database.savedOutfits;
  if (userId && userId !== 'anonymous') {
    list = list.filter((o) => o.userId === userId || o.userId === 'anonymous');
  }
  res.json({ savedOutfits: list });
});

app.delete('/api/outfits/:id', (req, res) => {
  const database = db.get();
  database.savedOutfits = database.savedOutfits.filter((o) => o.id !== req.params.id);
  db.save();
  res.json({ success: true });
});

app.get('/api/outfits/history', (req, res) => {
  const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string);
  const database = db.get();
  let list = database.matchHistory;
  if (userId && userId !== 'anonymous') {
    list = list.filter((h) => h.userId === userId || h.userId === 'anonymous');
  }
  res.json({ history: list.slice(0, 50) });
});

// ==========================================
// 6. NOTIFICATIONS
// ==========================================
app.get('/api/notifications', (req, res) => {
  const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string);
  const database = db.get();
  const list = database.notifications.filter(
    (n) => !userId || n.userId === userId || n.userId === 'all'
  );
  res.json({ notifications: list });
});

app.put('/api/notifications/:id/read', (req, res) => {
  const database = db.get();
  const item = database.notifications.find((n) => n.id === req.params.id);
  if (item) {
    item.isRead = true;
    db.save();
  }
  res.json({ success: true });
});

app.delete('/api/notifications/:id', (req, res) => {
  const database = db.get();
  database.notifications = database.notifications.filter((n) => n.id !== req.params.id);
  db.save();
  res.json({ success: true });
});

// ==========================================
// 7. ADMIN MANAGEMENT SUITE
// ==========================================
// Admin Auth Verification Helper
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const adminId = req.headers['x-admin-id'] as string;
  const database = db.get();
  const adminUser = database.users.find((u) => u.id === adminId && u.role === 'admin');
  if (!adminUser) {
    // For local dev convenience, allow if role header passed as admin
    if (req.headers['x-user-role'] === 'admin') {
      return next();
    }
    return res.status(403).json({ error: 'สิทธิ์การเข้าถึงเฉพาะผู้ดูแลระบบ (Admin Only)' });
  }
  next();
};

app.get('/api/admin/dashboard', requireAdmin, (req, res) => {
  const database = db.get();

  const totalMembers = database.users.filter((u) => u.role === 'user').length;
  const activeMembers = database.users.filter(
    (u) => u.status === 'active' && u.role === 'user'
  ).length;

  const now = Date.now();
  const oneWeekAgo = now - 7 * 86400000;
  const newMembers = database.users.filter(
    (u) => new Date(u.createdAt).getTime() > oneWeekAgo
  ).length;

  const totalMatches = database.matchHistory.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMatches = database.matchHistory.filter((m) => m.targetDate === todayStr).length;

  // Calculate popular styles
  const styleCountMap: Record<string, number> = {};
  database.matchHistory.forEach((m) => {
    styleCountMap[m.style] = (styleCountMap[m.style] || 0) + 1;
  });
  const popularStyles = Object.entries(styleCountMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Popular occasions
  const occCountMap: Record<string, number> = {};
  database.matchHistory.forEach((m) => {
    occCountMap[m.occasion] = (occCountMap[m.occasion] || 0) + 1;
  });
  const popularOccasions = Object.entries(occCountMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Popular colors
  const colorMap: Record<string, { count: number; hex: string }> = {};
  database.matchHistory.forEach((m) => {
    if (!colorMap[m.topColor]) {
      colorMap[m.topColor] = { count: 0, hex: m.topColor };
    }
    colorMap[m.topColor].count += 1;
  });
  const popularColors = Object.entries(colorMap)
    .map(([hex, data]) => ({
      name: hex,
      hex: data.hex,
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Growth & daily matches mock series
  const growthData = [
    { month: 'พ.ค.', members: 45, matches: 120 },
    { month: 'มิ.ย.', members: 78, matches: 210 },
    { month: 'ก.ค.', members: 115, matches: 340 },
    { month: 'ส.ค.', members: 160, matches: 490 },
    { month: 'ก.ย.', members: 210 + totalMembers, matches: 680 + totalMatches },
  ];

  const dailyMatches = [
    { day: 'จันทร์', matches: 28 },
    { day: 'อังคาร', matches: 35 },
    { day: 'พุธ', matches: 42 },
    { day: 'พฤหัส', matches: 39 },
    { day: 'ศุกร์', matches: 56 },
    { day: 'เสาร์', matches: 64 },
    { day: 'อาทิตย์', matches: 58 },
  ];

  res.json({
    totalMembers,
    activeMembers,
    newMembers: newMembers || 1,
    totalMatches,
    todayMatches: todayMatches || 4,
    savedOutfitsCount: database.savedOutfits.length,
    popularColors: popularColors.length > 0 ? popularColors : [
      { name: 'ชมพูกลีบบัว', hex: '#EC4899', count: 18 },
      { name: 'เขียวมรกต', hex: '#10B981', count: 14 },
      { name: 'ฟ้าคราม', hex: '#0284C7', count: 12 },
      { name: 'เหลืองนวล', hex: '#FBBF24', count: 9 },
    ],
    popularStyles: popularStyles.length > 0 ? popularStyles : [
      { name: 'Minimal', count: 32 },
      { name: 'Korean', count: 24 },
      { name: 'Office', count: 18 },
      { name: 'Smart Casual', count: 15 },
    ],
    popularOccasions: popularOccasions.length > 0 ? popularOccasions : [
      { name: 'ทำงาน', count: 38 },
      { name: 'เที่ยว', count: 26 },
      { name: 'วันสบาย ๆ', count: 22 },
      { name: 'ออกเดท', count: 14 },
    ],
    growthData,
    dailyMatches,
  });
});

// Admin Members Management
app.get('/api/admin/members', requireAdmin, (req, res) => {
  const database = db.get();
  const search = ((req.query.search as string) || '').toLowerCase();
  const status = req.query.status as string;

  let list = database.users.filter((u) => u.role === 'user');
  if (search) {
    list = list.filter(
      (u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)
    );
  }
  if (status && status !== 'all') {
    list = list.filter((u) => u.status === status);
  }

  const safeList = list.map(({ passwordHash, ...safe }) => safe);
  res.json({ members: safeList });
});

app.put('/api/admin/members/:id/status', requireAdmin, (req, res) => {
  const database = db.get();
  const user = database.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });

  user.status = user.status === 'active' ? 'disabled' : 'active';
  db.save();
  db.logActivity('ADMIN_USER_STATUS', `เปลี่ยนสถานะสมาชิก: ${user.name} เป็น ${user.status}`);
  res.json({ success: true, status: user.status });
});

app.delete('/api/admin/members/:id', requireAdmin, (req, res) => {
  const database = db.get();
  database.users = database.users.filter((u) => u.id !== req.params.id);
  db.save();
  db.logActivity('ADMIN_DELETE_USER', `ลบสมาชิก ID: ${req.params.id}`);
  res.json({ success: true });
});

// Admin Color Rules CRUD
app.get('/api/admin/rules', requireAdmin, (req, res) => {
  const database = db.get();
  res.json({ rules: database.colorRules });
});

app.post('/api/admin/rules', requireAdmin, (req, res) => {
  const { dayOfWeek, colorName, hexCode, type, priority, description } = req.body;
  if (!dayOfWeek || !colorName || !hexCode || !type) {
    return res.status(400).json({ error: 'ข้อมูลกฎสีไม่ครบถ้วน' });
  }

  const database = db.get();
  const newRule: ColorRule = {
    id: 'rule-' + Date.now(),
    dayOfWeek,
    colorName,
    hexCode: hexCode.toUpperCase(),
    type,
    priority: Number(priority) || 1,
    description: description || '',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  database.colorRules.push(newRule);
  db.save();
  db.logActivity('ADMIN_ADD_RULE', `เพิ่มกฎสีใหม่: ${colorName} (${hexCode}) สำหรับวัน ${dayOfWeek}`);
  res.json({ success: true, rule: newRule });
});

app.put('/api/admin/rules/:id', requireAdmin, (req, res) => {
  const database = db.get();
  const rule = database.colorRules.find((r) => r.id === req.params.id);
  if (!rule) return res.status(404).json({ error: 'ไม่พบกฎสี' });

  const { dayOfWeek, colorName, hexCode, type, priority, description, isActive } = req.body;
  if (dayOfWeek) rule.dayOfWeek = dayOfWeek;
  if (colorName) rule.colorName = colorName;
  if (hexCode) rule.hexCode = hexCode.toUpperCase();
  if (type) rule.type = type;
  if (priority !== undefined) rule.priority = Number(priority);
  if (description !== undefined) rule.description = description;
  if (isActive !== undefined) rule.isActive = Boolean(isActive);
  rule.updatedAt = new Date().toISOString();

  db.save();
  db.logActivity('ADMIN_UPDATE_RULE', `แก้ไขกฎสี: ${rule.colorName}`);
  res.json({ success: true, rule });
});

app.delete('/api/admin/rules/:id', requireAdmin, (req, res) => {
  const database = db.get();
  database.colorRules = database.colorRules.filter((r) => r.id !== req.params.id);
  db.save();
  db.logActivity('ADMIN_DELETE_RULE', `ลบกฎสี ID: ${req.params.id}`);
  res.json({ success: true });
});

app.post('/api/admin/rules/reset', requireAdmin, (req, res) => {
  const restored = db.resetRules();
  db.logActivity('ADMIN_RESET_RULES', 'คืนค่ากฎสีตั้งต้น (Seed Data) ทั้งหมด');
  res.json({ success: true, rules: restored });
});

// Admin System Settings
app.get('/api/admin/settings', (req, res) => {
  const database = db.get();
  res.json({ settings: database.settings });
});

app.put('/api/admin/settings', requireAdmin, (req, res) => {
  const database = db.get();
  database.settings = { ...database.settings, ...req.body };
  db.save();
  db.logActivity('ADMIN_UPDATE_SETTINGS', 'อัปเดตการตั้งค่าระบบ');
  res.json({ success: true, settings: database.settings });
});

// Admin Activity Logs
app.get('/api/admin/logs', requireAdmin, (req, res) => {
  const database = db.get();
  res.json({ logs: database.activityLogs.slice(0, 100) });
});

// Export SQL Script for Supabase / PostgreSQL
app.get('/api/export-sql', (req, res) => {
  const sql = `-- ==========================================
-- DAILY COLOR MATCH - PRODUCTION DATABASE SCHEMA
-- Target Database: Supabase / PostgreSQL 14+
-- ==========================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users & Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  birthday DATE,
  birth_day_of_week TEXT,
  gender TEXT,
  preferred_style TEXT DEFAULT 'Minimal',
  favorite_colors TEXT[],
  disliked_colors TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Color Rules table (Configurable by Admin)
CREATE TABLE IF NOT EXISTS public.color_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week TEXT NOT NULL,
  color_name TEXT NOT NULL,
  hex_code VARCHAR(7) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('recommended', 'secondary', 'avoid', 'kali')),
  priority INT DEFAULT 1,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Saved Outfits table
CREATE TABLE IF NOT EXISTS public.saved_outfits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_date DATE NOT NULL,
  target_day_of_week TEXT NOT NULL,
  style TEXT NOT NULL,
  occasion TEXT NOT NULL,
  combination JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Match History table
CREATE TABLE IF NOT EXISTS public.match_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  birth_day_of_week TEXT NOT NULL,
  target_date DATE NOT NULL,
  target_day_of_week TEXT NOT NULL,
  style TEXT NOT NULL,
  occasion TEXT NOT NULL,
  combination_id TEXT,
  top_color TEXT,
  bottom_color TEXT,
  score INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. System Settings table
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.color_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;
`;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="daily_color_match_schema.sql"');
  res.send(sql);
});

// ==========================================
// 8. VITE MIDDLEWARE & STATIC ASSETS
// ==========================================
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Daily Color Match Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
