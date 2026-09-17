import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Layers,
  ChevronRight,
  CheckCircle2,
  Share2,
  Palette,
  Eye,
  Shirt,
  Shuffle,
} from 'lucide-react';
import {
  ColorRule,
  DayOfWeekKey,
  MatchResultResponse,
  UserProfile,
  DAY_INFO_LIST,
  StyleOption,
  OccasionOption,
  CuratedSimulationOutfit,
} from '../types';
import { ColorCard } from '../components/ColorCard';
import { OutfitVisualCard } from '../components/OutfitVisualCard';
import { CURATED_SIMULATION_OUTFITS } from '../data/outfitSimulations';
import { api } from '../services/api';

interface HomeViewProps {
  currentUser: UserProfile | null;
  onNavigateToMatch: (
    initialTargetDate?: string,
    style?: StyleOption,
    occasion?: OccasionOption
  ) => void;
  onOpenAuth: () => void;
  onSaveOutfit: (comb: any) => void;
  savedOutfitIds: Set<string>;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onOpenRoulette?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentUser,
  onNavigateToMatch,
  onOpenAuth,
  onSaveOutfit,
  savedOutfitIds,
  onShowToast,
  onOpenRoulette,
}) => {
  const [todayDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [todayMatchResult, setTodayMatchResult] = useState<MatchResultResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCuratedPreview, setSelectedCuratedPreview] = useState<CuratedSimulationOutfit | null>(null);

  // Fetch match for the dashboard
  useEffect(() => {
    const fetchDailyData = async () => {
      setLoading(true);
      try {
        const userBirthDayKey: DayOfWeekKey = currentUser?.birthDayOfWeek || 'wednesday_day';
        const res = await api.matchOutfit({
          birthday: currentUser?.birthday || '1998-05-20',
          birthDayOfWeek: userBirthDayKey,
          targetDate: selectedDate,
          occasion: 'วันสบาย ๆ',
          style: currentUser?.preferredStyle || 'Minimal',
          userId: currentUser?.id,
        });
        setTodayMatchResult(res);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDailyData();
  }, [selectedDate, currentUser?.birthDayOfWeek, currentUser?.preferredStyle]);

  const handleShare = async (combination: any) => {
    const shareText = `ชุดสีมงคลประจำวันจาก Daily Color Match ✨ สไตล์ ${todayMatchResult?.style} โทนสีหลัก: ${combination.mainColor.name} (${combination.mainColor.hex}) คะแนนความเข้ากัน: ${combination.score}%`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daily Color Match',
          text: shareText,
          url: window.location.href,
        });
      } catch (e) {
        // user cancelled
      }
    } else {
      navigator.clipboard?.writeText(shareText + ' ' + window.location.href);
      onShowToast('คัดลอกลิงก์และรายละเอียดชุดแล้วเรียบร้อย ✓', 'success');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-rose-500/20 via-pink-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-rose-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ระบบแมทสีเสื้อผ้าตามวันเกิดและสีประจำวัน</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            วันนี้แต่งสีอะไรดี? ✨
          </h1>
          <p className="mt-2.5 text-stone-300 text-sm sm:text-base leading-relaxed">
            จับคู่สีชุดให้สวยลงตัวด้วยหลัก <strong>Color Harmony</strong> พร้อมดึงสีมงคลและ{' '}
            <strong className="text-rose-300">ตัดสีกาลกิณีออก 100%</strong> ตามกฎวันเกิดของคุณ
          </p>

          {/* Quick Date Switcher */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedDate(todayDate)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDate === todayDate
                  ? 'bg-white text-stone-900 shadow-md'
                  : 'bg-white/10 text-stone-300 hover:bg-white/20'
              }`}
            >
              📅 วันนี้ ({new Date(todayDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })})
            </button>
            <button
              onClick={() => {
                const tm = new Date();
                tm.setDate(tm.getDate() + 1);
                setSelectedDate(tm.toISOString().split('T')[0]);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDate !== todayDate
                  ? 'bg-white text-stone-900 shadow-md'
                  : 'bg-white/10 text-stone-300 hover:bg-white/20'
              }`}
            >
              ✨ พรุ่งนี้
            </button>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl text-xs text-stone-300">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-stone-200 text-xs focus:outline-hidden cursor-pointer"
              />
            </div>
          </div>

          {/* Hero CTA Button */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateToMatch(selectedDate)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white font-bold text-sm shadow-lg hover:shadow-rose-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Match ชุดให้ฉัน</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onOpenRoulette && (
              <button
                onClick={onOpenRoulette}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-stone-900 font-bold text-sm shadow-md hover:bg-stone-50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-white/20"
              >
                <Shuffle className="w-4 h-4 text-rose-600 animate-spin-slow" />
                <span>🎰 หมุนสุ่มหาชุดแมทช์</span>
              </button>
            )}

            {!currentUser && (
              <button
                onClick={onOpenAuth}
                className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
              >
                บันทึกวันเกิดของฉัน →
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Daily Color Highlights Card */}
      {todayMatchResult && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Target Day auspicious colors */}
          <div className="md:col-span-2 bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{todayMatchResult.targetDayInfo.symbol}</span>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    สีที่เหมาะกับคุณ ({todayMatchResult.targetDayInfo.thaiName})
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    คำนวณจากวันเกิด {todayMatchResult.birthDayInfo.thaiName} + วันแต่งตัว {todayMatchResult.targetDayInfo.thaiName}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                มงคลประจำวัน
              </span>
            </div>

            {/* Recommended Swatches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {todayMatchResult.recommendedColors.map((rule) => (
                <ColorCard key={rule.id} rule={rule} onCopy={(hex) => onShowToast(`คัดลอก ${hex} แล้ว ✓`)} />
              ))}
            </div>

            {/* Secondary Colors */}
            {todayMatchResult.secondaryColors.length > 0 && (
              <div className="pt-2 border-t border-stone-100">
                <div className="text-xs font-semibold text-stone-500 mb-2">สีมงคลรองที่สามารถใช้ร่วมกันได้:</div>
                <div className="flex flex-wrap gap-2">
                  {todayMatchResult.secondaryColors.map((rule) => (
                    <ColorCard key={rule.id} rule={rule} compact onCopy={(hex) => onShowToast(`คัดลอก ${hex} แล้ว ✓`)} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Kali Warning Card */}
          <div className="bg-rose-50/60 rounded-3xl border border-rose-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-2">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                <span>สีกาลกิณีที่ควรหลีกเลี่ยง</span>
              </div>
              <p className="text-xs text-rose-700/90 leading-relaxed">
                ตามหลักวันเกิด ({todayMatchResult.birthDayInfo.thaiName}) และวันที่แต่งตัว ({todayMatchResult.targetDayInfo.thaiName}) สีเหล่านี้ถูกตัดออกจากระบบ Color Match 100%:
              </p>

              <div className="mt-3.5 space-y-2">
                {todayMatchResult.kaliColors.map((k) => (
                  <div
                    key={k.id}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-white/90 border border-rose-200 shadow-2xs"
                  >
                    <span
                      className="w-6 h-6 rounded-lg border border-black/10 shrink-0"
                      style={{ backgroundColor: k.hexCode }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-stone-800 truncate">{k.colorName}</div>
                      <div className="text-[10px] text-rose-600 font-medium">สีกาลกิณี (ห้ามใช้)</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-rose-200/60 text-[11px] text-rose-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Matching Engine คัดกรองออกเรียบร้อยแล้ว</span>
            </div>
          </div>
        </section>
      )}

      {/* Featured Outfit Preview */}
      {todayMatchResult?.combinations && todayMatchResult.combinations.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <span>ชุดสีที่แนะนำสำหรับคุณ</span>
                <span className="text-xs font-normal text-stone-400">
                  (สไตล์ {todayMatchResult.style})
                </span>
              </h2>
              <p className="text-xs text-stone-500">
                ตัวอย่างการจับคู่ชิ้นเสื้อผ้า เสื้อ กางเกง รองเท้า กระเป๋า และเครื่องประดับ พร้อมชุดจำลองเสมือนจริง
              </p>
            </div>
            <button
              onClick={() => onNavigateToMatch(selectedDate)}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
            >
              <span>ปรับแต่งเพิ่มเติม</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <OutfitVisualCard
            combination={todayMatchResult.combinations[0]}
            occasion={todayMatchResult.occasion}
            style={todayMatchResult.style}
            targetDate={todayMatchResult.targetDate}
            onSave={(comb) => onSaveOutfit(comb)}
            isSaved={savedOutfitIds.has(todayMatchResult.combinations[0].id)}
            onShare={handleShare}
            onTryAnother={() => onNavigateToMatch(selectedDate)}
            onApplyCuratedStyle={(s, o) => onNavigateToMatch(selectedDate, s, o)}
          />
        </section>
      )}

      {/* Curated Stylish Outfit Simulations Showcase */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LOOKBOOK & SIMULATION STUDIO</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900">
              ชุดจำลองที่แมทช์กันแล้วดูดีมีสไตล์ ✨
            </h2>
            <p className="text-xs text-stone-500">
              คอลเลกชันชุดตัวอย่างจัดวางตามสูตร Color Harmony และสัดส่วน 60-30-10 แต่งแล้วสวยชิคในทุกโอกาส
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onOpenRoulette && (
              <button
                onClick={onOpenRoulette}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>หมุนสุ่มจากตู้ชุด</span>
              </button>
            )}
            <button
              onClick={() => onNavigateToMatch(selectedDate)}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
            >
              <span>แมทช์ชุดของฉันเอง</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CURATED_SIMULATION_OUTFITS.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden hover:shadow-md hover:border-rose-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Photo container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent pointer-events-none" />

                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white">
                    {item.style} • {item.occasion}
                  </div>

                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-600 text-[11px] font-bold text-white shadow-xs">
                    Harmony {item.harmonyScore}%
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-sm font-bold text-white drop-shadow-xs">{item.title}</h3>
                    <p className="text-xs text-stone-200 line-clamp-1">{item.tagline}</p>
                  </div>
                </div>

                {/* Content body */}
                <div className="p-4 space-y-3">
                  {/* Palette Swatches */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                      คุมโทนสี (Color Palette):
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-50 border border-stone-200 text-[11px] text-stone-700">
                        <span
                          className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: item.palette.main.hex }}
                        />
                        <span className="font-medium truncate max-w-[90px]">{item.palette.main.name}</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-50 border border-stone-200 text-[11px] text-stone-700">
                        <span
                          className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: item.palette.secondary.hex }}
                        />
                        <span className="font-medium truncate max-w-[90px]">{item.palette.secondary.name}</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-50 border border-stone-200 text-[11px] text-stone-700">
                        <span
                          className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: item.palette.accent.hex }}
                        />
                        <span className="font-medium truncate max-w-[80px]">Accent</span>
                      </div>
                    </div>
                  </div>

                  {/* Garment Summary */}
                  <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-200/60 text-[11px] text-stone-600 space-y-1">
                    <div className="truncate">
                      <strong>ท่อนบน:</strong> {item.garments.top}
                    </div>
                    <div className="truncate">
                      <strong>ท่อนล่าง:</strong> {item.garments.bottom}
                    </div>
                    <div className="truncate">
                      <strong>กระเป๋า/รองเท้า:</strong> {item.garments.bag}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => onNavigateToMatch(selectedDate, item.style, item.occasion)}
                  className="w-full py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs group-hover:bg-rose-600 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>แมทช์ลุคนี้ตามสีวันเกิดฉัน</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section (Landing Information for Users) */}
      <section className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
        <h3 className="text-base font-bold text-stone-900 mb-1">ขั้นตอนการทำงานของ Daily Color Match</h3>
        <p className="text-xs text-stone-500 mb-5">ออกแบบตามหลักจิตวิทยาคู่สีและโหราศาสตร์ไทยแบบ Configurable</p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[
            { step: '01', title: 'ใส่วันเกิด', desc: 'ระบุวันเกิดเพื่อดึงกฎสีมงคลและสีกาลกิณีส่วนบุคคล' },
            { step: '02', title: 'เลือกวันแต่งตัว', desc: 'เลือกวันนี้ พรุ่งนี้ หรือแพลนออกงานในอนาคต' },
            { step: '03', title: 'เลือก Style & งาน', desc: 'Minimal, Korean, Luxury และโอกาสการใช้งาน' },
            { step: '04', title: 'ระบบ Match สี', desc: 'ตัดสีกาลกิณีและจับคู่ด้วย Color Harmony Engine' },
            { step: '05', title: 'ได้ชุดพร้อมใช้งาน', desc: 'ชุดสี เสื้อ-กางเกง-รองเท้า-กระเป๋า พร้อมรหัส HEX' },
          ].map((s, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold text-rose-500">{s.step}</span>
                <h4 className="text-xs font-bold text-stone-800 mt-1">{s.title}</h4>
                <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer as required by Requirement #39 & #40 */}
        <div className="mt-5 p-3 rounded-2xl bg-stone-100/70 border border-stone-200/60 text-[11px] text-stone-500 leading-relaxed flex items-center gap-2">
          <Layers className="w-4 h-4 text-stone-400 shrink-0" />
          <span>
            <strong>หมายเหตุ:</strong> ข้อมูลสีใน Seed Data เป็นข้อมูลตัวอย่างสำหรับทดสอบระบบ สามารถแก้ไข เพิ่มเติม หรือเปลี่ยนชุดกฎได้จาก Admin หลังบ้านโดยไม่ต้องแก้ไข Source Code
          </span>
        </div>
      </section>
    </div>
  );
};
