import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Calendar,
  Layers,
  Palette,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Heart,
  X,
  ShieldAlert,
  Shuffle,
} from 'lucide-react';
import {
  ClothingType,
  DayOfWeekKey,
  MatchResultResponse,
  OccasionOption,
  OutfitCombination,
  StyleOption,
  UserProfile,
  DAY_INFO_LIST,
} from '../types';
import { OutfitVisualCard } from '../components/OutfitVisualCard';
import { api } from '../services/api';

interface MatchViewProps {
  currentUser: UserProfile | null;
  initialTargetDate?: string;
  initialStyle?: StyleOption;
  initialOccasion?: OccasionOption;
  onSaveOutfit: (comb: OutfitCombination) => void;
  savedOutfitIds: Set<string>;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onOpenRoulette?: () => void;
}

const STYLES: StyleOption[] = [
  'Minimal',
  'Korean',
  'Luxury',
  'Casual',
  'Office',
  'Street',
  'Smart Casual',
  'Elegant',
  'Romantic',
  'Sport',
  'Vintage',
];

const OCCASIONS: OccasionOption[] = [
  'ทำงาน',
  'ประชุม',
  'สัมภาษณ์งาน',
  'เที่ยว',
  'ออกเดท',
  'งานแต่ง',
  'งานบุญ',
  'ปาร์ตี้',
  'วันสบาย ๆ',
  'ออกงานกลางคืน',
];

export const MatchView: React.FC<MatchViewProps> = ({
  currentUser,
  initialTargetDate,
  initialStyle,
  initialOccasion,
  onSaveOutfit,
  savedOutfitIds,
  onShowToast,
  onOpenRoulette,
}) => {
  // Inputs
  const [birthday, setBirthday] = useState(currentUser?.birthday || '1998-05-20');
  const [birthDayOfWeek, setBirthDayOfWeek] = useState<DayOfWeekKey>(
    currentUser?.birthDayOfWeek || 'wednesday_day'
  );
  const [targetDate, setTargetDate] = useState(
    initialTargetDate || new Date().toISOString().split('T')[0]
  );
  const [selectedStyle, setSelectedStyle] = useState<StyleOption>(
    initialStyle || currentUser?.preferredStyle || 'Minimal'
  );
  const [selectedOccasion, setSelectedOccasion] = useState<OccasionOption>(
    initialOccasion || 'วันสบาย ๆ'
  );

  useEffect(() => {
    if (initialStyle) setSelectedStyle(initialStyle);
  }, [initialStyle]);

  useEffect(() => {
    if (initialOccasion) setSelectedOccasion(initialOccasion);
  }, [initialOccasion]);
  const [clothingTypes, setClothingTypes] = useState<ClothingType[]>([
    'top',
    'bottom',
    'shoes',
    'bag',
    'accessory',
  ]);
  const [preferredColor, setPreferredColor] = useState('');

  // Results
  const [result, setResult] = useState<MatchResultResponse | null>(null);
  const [selectedCombIndex, setSelectedCombIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [kaliWarningModal, setKaliWarningModal] = useState<string | null>(null);

  // Automatically update birthDayOfWeek when birthday date input changes
  const handleBirthdayDateChange = (val: string) => {
    setBirthday(val);
    if (val) {
      const d = new Date(val);
      const day = d.getDay();
      const map: DayOfWeekKey[] = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday_day',
        'thursday',
        'friday',
        'saturday',
      ];
      setBirthDayOfWeek(map[day] || 'wednesday_day');
    }
  };

  const handleGenerateOutfit = async () => {
    setLoading(true);
    try {
      const res = await api.matchOutfit({
        birthday,
        birthDayOfWeek,
        targetDate,
        occasion: selectedOccasion,
        style: selectedStyle,
        preferredColors: preferredColor ? [preferredColor] : [],
        userId: currentUser?.id,
      });

      setResult(res);
      setSelectedCombIndex(0);

      // Trigger Confetti on success
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#EC4899', '#FBBF24', '#10B981', '#6366F1', '#D4AF37'],
        });
      } catch (e) {
        // fallback
      }

      onShowToast('✨ ชุดของคุณพร้อมแล้ว!', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'เกิดข้อผิดพลาดในการสร้างชุด', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Check if preferred color clashes with kali
  const handlePreferredColorSelect = (hex: string, name: string) => {
    if (result) {
      const isKali = result.kaliColors.some(
        (k) => k.hexCode.toUpperCase() === hex.toUpperCase()
      );
      if (isKali) {
        setKaliWarningModal(
          `สี${name} (${hex}) ถูกตั้งค่าเป็นสีกาลกิณีสำหรับวันนี้ ระบบจะตัดออกจากชุดอัตโนมัติ`
        );
        return;
      }
    }
    setPreferredColor(hex);
  };

  const handleShare = async (comb: OutfitCombination) => {
    const text = `ชุดสีมงคลประจำวัน ${result?.targetDate} สไตล์ ${selectedStyle} จาก Daily Color Match โทนสีหลัก: ${comb.mainColor.name}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daily Color Match',
          text,
          url: window.location.href,
        });
      } catch (e) {
        // cancelled
      }
    } else {
      navigator.clipboard?.writeText(text + ' ' + window.location.href);
      onShowToast('คัดลอกลิงก์เรียบร้อยแล้ว ✓', 'success');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Page Title */}
      <div className="border-b border-stone-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Color Matching Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
          ระบบแมทช์สีชุดตามวันเกิด
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          คำนวณสีมงคลตามวันเกิด ผสานสีประจำวันแต่งตัว และตัดสีกาลกิณีออก 100%
        </p>
      </div>

      {/* Matching Form Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-7 shadow-xs space-y-6">
        {/* Step 1: Birthday Setup */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
            <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold">
              1
            </span>
            <span>ข้อมูลวันเกิดของคุณ (Layer 1)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-8">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                เลือกวัน/เดือน/ปีเกิด (ค.ศ.)
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => handleBirthdayDateChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-500 bg-stone-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                คุณเกิดวัน (ตามหลักโหราศาสตร์)
              </label>
              <select
                value={birthDayOfWeek}
                onChange={(e) => setBirthDayOfWeek(e.target.value as DayOfWeekKey)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-500 bg-white font-medium text-stone-800"
              >
                {DAY_INFO_LIST.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.symbol} {d.thaiName} ({d.label})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Target Date */}
        <div className="space-y-3 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
            <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold">
              2
            </span>
            <span>วันที่ต้องการแต่งตัว (Layer 2)</span>
          </div>

          <div className="pl-8 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTargetDate(new Date().toISOString().split('T')[0])}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                targetDate === new Date().toISOString().split('T')[0]
                  ? 'bg-rose-500 text-white border-rose-500 shadow-2xs'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
              }`}
            >
              วันนี้
            </button>
            <button
              type="button"
              onClick={() => {
                const tm = new Date();
                tm.setDate(tm.getDate() + 1);
                setTargetDate(tm.toISOString().split('T')[0]);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                targetDate !== new Date().toISOString().split('T')[0]
                  ? 'bg-rose-500 text-white border-rose-500 shadow-2xs'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
              }`}
            >
              วันพรุ่งนี้
            </button>
            <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-xl text-xs text-stone-600">
              <span className="text-stone-400">ระบุวันที่:</span>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="bg-transparent text-xs focus:outline-hidden cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Style Selection */}
        <div className="space-y-3 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
            <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold">
              3
            </span>
            <span>เลือกสไตล์ที่คุณต้องการ (Style)</span>
          </div>

          <div className="pl-8 flex flex-wrap gap-2">
            {STYLES.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStyle(st)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedStyle === st
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Step 4: Occasion */}
        <div className="space-y-3 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
            <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold">
              4
            </span>
            <span>โอกาสในการแต่งตัว (Occasion)</span>
          </div>

          <div className="pl-8 flex flex-wrap gap-2">
            {OCCASIONS.map((occ) => (
              <button
                key={occ}
                type="button"
                onClick={() => setSelectedOccasion(occ)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedOccasion === occ
                    ? 'bg-rose-50 text-rose-700 border border-rose-300 font-bold'
                    : 'bg-stone-50 text-stone-600 border border-stone-200 hover:border-stone-300'
                }`}
              >
                {occ}
              </button>
            ))}
          </div>
        </div>

        {/* Step 5: Optional Preferred Color */}
        <div className="space-y-3 pt-4 border-t border-stone-100">
          <div className="flex items-center justify-between pl-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
              <Palette className="w-4 h-4 text-stone-400" />
              <span>โทนสีที่อยากเน้นเป็นพิเศษ (ถ้ามี):</span>
            </div>
            {preferredColor && (
              <button
                type="button"
                onClick={() => setPreferredColor('')}
                className="text-[11px] text-stone-400 hover:text-stone-600"
              >
                ล้างการเลือก
              </button>
            )}
          </div>

          <div className="pl-8 flex flex-wrap gap-2">
            {[
              { name: 'ฟ้าพาสเทล', hex: '#38BDF8' },
              { name: 'ชมพูหวาน', hex: '#EC4899' },
              { name: 'เขียวมิ้นต์', hex: '#10B981' },
              { name: 'ทองหรู', hex: '#D4AF37' },
              { name: 'ขาวครีม', hex: '#FDFBF7' },
              { name: 'ส้มอิฐ', hex: '#EA580C' },
              { name: 'ม่วงลาเวนเดอร์', hex: '#8B5CF6' },
            ].map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => handlePreferredColorSelect(c.hex, c.name)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs border transition-all cursor-pointer ${
                  preferredColor === c.hex
                    ? 'border-stone-800 bg-stone-100 font-bold'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: c.hex }}
                />
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit & Randomizer Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleGenerateOutfit}
            disabled={loading}
            className="flex-1 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white font-bold text-base shadow-lg hover:shadow-rose-500/25 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>กำลังคำนวณและตัดสีกาลกิณี...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>สร้างชุดให้ฉัน ✨</span>
              </>
            )}
          </button>

          {onOpenRoulette && (
            <button
              type="button"
              onClick={onOpenRoulette}
              className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-stone-800"
            >
              <Shuffle className="w-5 h-5 text-amber-400 animate-spin-slow" />
              <span>หมุนสุ่มชุด 🎰</span>
            </button>
          )}
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <section className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
                <span>ผลลัพธ์การจัดชุด (Color Match Result)</span>
              </h2>
              <p className="text-xs text-stone-500">
                พบ {result.combinations.length} ชุดที่เข้ากันได้ดีที่สุด ตัดสีกาลกิณีออก {result.excludedColorsCount} สี
              </p>
            </div>

            {/* Combination Switcher Tabs */}
            <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl">
              {result.combinations.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCombIndex(idx)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCombIndex === idx
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  ชุดที่ {idx + 1} ({c.score}%)
                </button>
              ))}
            </div>
          </div>

          {/* Active Visual Outfit Card */}
          {result.combinations[selectedCombIndex] && (
            <OutfitVisualCard
              combination={result.combinations[selectedCombIndex]}
              occasion={result.occasion}
              style={result.style}
              targetDate={result.targetDate}
              onSave={(comb) => onSaveOutfit(comb)}
              isSaved={savedOutfitIds.has(result.combinations[selectedCombIndex].id)}
              onShare={handleShare}
              onTryAnother={() => {
                setSelectedCombIndex((prev) => (prev + 1) % result.combinations.length);
              }}
              onApplyCuratedStyle={(s, o) => {
                setSelectedStyle(s);
                setSelectedOccasion(o);
                onShowToast(`เลือกสไตล์ ${s} สำหรับ ${o} แล้ว`, 'info');
              }}
            />
          )}

          {/* Summary Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-stone-200">
              <div className="text-xs font-bold text-stone-800 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>สีมงคลประจำวันที่นำมาคำนวณ:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.recommendedColors.map((r) => (
                  <span
                    key={r.id}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg bg-stone-50 border border-stone-200"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: r.hexCode }}
                    />
                    <span>{r.colorName}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/60">
              <div className="text-xs font-bold text-rose-800 mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>สีกาลกิณีที่ตัดออกจากผลลัพธ์ทั้งหมด:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.kaliColors.map((k) => (
                  <span
                    key={k.id}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg bg-white border border-rose-200 text-rose-700"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: k.hexCode }}
                    />
                    <span>{k.colorName}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Kali Warning Modal when user selects or clicks a forbidden color */}
      {kaliWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-rose-200 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900">แจ้งเตือนสีกาลกิณี</h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">{kaliWarningModal}</p>
            <button
              onClick={() => setKaliWarningModal(null)}
              className="mt-5 w-full py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold cursor-pointer"
            >
              รับทราบ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
