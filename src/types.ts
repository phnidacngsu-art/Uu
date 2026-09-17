export type DayOfWeekKey =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday_day'
  | 'wednesday_night'
  | 'thursday'
  | 'friday'
  | 'saturday';

export interface DayInfo {
  key: DayOfWeekKey;
  label: string;
  thaiName: string;
  defaultColor: string;
  symbol: string;
}

export const DAY_INFO_LIST: DayInfo[] = [
  { key: 'sunday', label: 'Sunday', thaiName: 'วันอาทิตย์', defaultColor: '#EF4444', symbol: '☀️' },
  { key: 'monday', label: 'Monday', thaiName: 'วันจันทร์', defaultColor: '#FBBF24', symbol: '🌙' },
  { key: 'tuesday', label: 'Tuesday', thaiName: 'วันอังคาร', defaultColor: '#EC4899', symbol: '🌸' },
  { key: 'wednesday_day', label: 'Wednesday (Day)', thaiName: 'วันพุธ (กลางวัน)', defaultColor: '#10B981', symbol: '🌿' },
  { key: 'wednesday_night', label: 'Wednesday (Night)', thaiName: 'วันพุธ (กลางคืน/ราหู)', defaultColor: '#6366F1', symbol: '🌌' },
  { key: 'thursday', label: 'Thursday', thaiName: 'วันพฤหัสบดี', defaultColor: '#F97316', symbol: '🦉' },
  { key: 'friday', label: 'Friday', thaiName: 'วันศุกร์', defaultColor: '#06B6D4', symbol: '💎' },
  { key: 'saturday', label: 'Saturday', thaiName: 'วันเสาร์', defaultColor: '#8B5CF6', symbol: '🪐' },
];

export type ColorRuleType = 'recommended' | 'secondary' | 'avoid' | 'kali';

export interface ColorRule {
  id: string;
  dayOfWeek: DayOfWeekKey;
  colorName: string;
  hexCode: string;
  type: ColorRuleType;
  priority: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StyleOption =
  | 'Minimal'
  | 'Korean'
  | 'Luxury'
  | 'Casual'
  | 'Office'
  | 'Street'
  | 'Smart Casual'
  | 'Elegant'
  | 'Romantic'
  | 'Sport'
  | 'Vintage';

export type OccasionOption =
  | 'ทำงาน'
  | 'ประชุม'
  | 'สัมภาษณ์งาน'
  | 'เที่ยว'
  | 'ออกเดท'
  | 'งานแต่ง'
  | 'งานบุญ'
  | 'ปาร์ตี้'
  | 'วันสบาย ๆ'
  | 'ออกงานกลางคืน';

export type ClothingType = 'top' | 'bottom' | 'shoes' | 'bag' | 'accessory';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  birthday?: string;
  birthDayOfWeek?: DayOfWeekKey;
  gender?: 'female' | 'male' | 'unspecified';
  preferredStyle?: StyleOption;
  favoriteColors?: string[];
  dislikedColors?: string[];
  status: 'active' | 'disabled';
  createdAt: string;
  lastActive: string;
}

export interface OutfitItemPiece {
  category: ClothingType;
  label: string;
  colorName: string;
  hexCode: string;
  role: 'main' | 'secondary' | 'accent' | 'neutral';
  description: string;
}

export interface OutfitCombination {
  id: string;
  score: number; // 0-100%
  harmonyType: string;
  mainColor: { name: string; hex: string };
  secondaryColor: { name: string; hex: string };
  accentColor: { name: string; hex: string };
  neutralColor: { name: string; hex: string };
  items: {
    top: OutfitItemPiece;
    bottom: OutfitItemPiece;
    shoes: OutfitItemPiece;
    bag: OutfitItemPiece;
    accessory: OutfitItemPiece;
  };
  explanation: string;
  luckyHighlights: string[];
  kaliExcludedCount: number;
}

export interface MatchResultResponse {
  birthDayOfWeek: DayOfWeekKey;
  birthDayInfo: DayInfo;
  targetDate: string;
  targetDayOfWeek: DayOfWeekKey;
  targetDayInfo: DayInfo;
  occasion: OccasionOption;
  style: StyleOption;
  recommendedColors: ColorRule[];
  secondaryColors: ColorRule[];
  avoidColors: ColorRule[];
  kaliColors: ColorRule[];
  combinations: OutfitCombination[];
  excludedColorsCount: number;
  notice: string;
}

export interface SavedOutfit {
  id: string;
  userId: string;
  title: string;
  targetDate: string;
  targetDayOfWeek: DayOfWeekKey;
  style: StyleOption;
  occasion: OccasionOption;
  combination: OutfitCombination;
  notes?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'lucky' | 'info' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalMembers: number;
  activeMembers: number;
  newMembers: number;
  totalMatches: number;
  todayMatches: number;
  savedOutfitsCount: number;
  popularColors: { name: string; hex: string; count: number }[];
  popularStyles: { name: string; count: number }[];
  popularOccasions: { name: string; count: number }[];
  growthData: { month: string; members: number; matches: number }[];
  dailyMatches: { day: string; matches: number }[];
}

export interface SystemSettings {
  siteName: string;
  logoText: string;
  themeColor: string;
  defaultStyle: StyleOption;
  harmonyThreshold: number;
  enableAnimations: boolean;
  enableWelcomePopup: boolean;
  enableResultConfetti: boolean;
  enableNotifications: boolean;
  seedDataDisclaimer: string;
}
