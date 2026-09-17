import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  RotateCw,
  X,
  Check,
  Calendar,
  Layers,
  ShoppingBag,
  Palette,
  Eye,
  Shuffle,
  ChevronRight,
  Flame,
  Star,
} from 'lucide-react';
import {
  StyleOption,
  OccasionOption,
  OutfitCombination,
  UserProfile,
  ColorRule,
} from '../types';
import { CURATED_SIMULATION_OUTFITS } from '../data/outfitSimulations';
import { api } from '../services/api';

interface OutfitRouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  currentDate?: string;
  onSelectResultOutfit: (
    comb: OutfitCombination,
    style: StyleOption,
    occasion: OccasionOption
  ) => void;
  onSaveOutfit?: (comb: OutfitCombination) => void;
  isSaved?: boolean;
}

export const OutfitRouletteModal: React.FC<OutfitRouletteModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentDate = new Date().toISOString().split('T')[0],
  onSelectResultOutfit,
  onSaveOutfit,
  isSaved = false,
}) => {
  // Roulette spinning states
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const [selectedCuratedIndex, setSelectedCuratedIndex] = useState(0);

  // Dynamic slot items simulation for visual excitement
  const [activeSlotImage, setActiveSlotImage] = useState<string>(
    CURATED_SIMULATION_OUTFITS[0].image
  );
  const [activeSlotTitle, setActiveSlotTitle] = useState<string>(
    CURATED_SIMULATION_OUTFITS[0].title
  );

  // Filters for the roulette spin
  const [spinStyleFilter, setSpinStyleFilter] = useState<'All' | StyleOption>('All');
  const [spinOccasionFilter, setSpinOccasionFilter] = useState<'All' | OccasionOption>('All');

  // Lucky Color Match generated for the chosen date
  const [luckyRule, setLuckyRule] = useState<ColorRule | null>(null);
  const [targetDayThaiName, setTargetDayThaiName] = useState<string>('');
  const [generatedComb, setGeneratedComb] = useState<OutfitCombination | null>(null);

  const spinTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch color rule for the selected date
  useEffect(() => {
    if (!isOpen) return;
    api
      .matchOutfit({
        targetDate: currentDate,
        birthday: currentUser?.birthday || '1998-05-20',
        birthDayOfWeek: currentUser?.birthDayOfWeek || 'wednesday_day',
      })
      .then((res) => {
        if (res) {
          setTargetDayThaiName(res.targetDayInfo.thaiName);
          if (res.recommendedColors && res.recommendedColors.length > 0) {
            setLuckyRule(res.recommendedColors[0]);
          }
        }
      })
      .catch((err) => console.error('Error fetching lucky rules for roulette:', err));
  }, [isOpen, currentDate, currentUser]);

  const currentOutfit = CURATED_SIMULATION_OUTFITS[selectedCuratedIndex];

  // Function to spin the roulette
  const startSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setGeneratedComb(null);

    let counter = 0;
    const totalTicks = 24 + Math.floor(Math.random() * 8); // 24-32 rapid iterations
    const speed = 75; // ms per tick

    // Filter candidate pool
    const candidates = CURATED_SIMULATION_OUTFITS.filter((item) => {
      const matchStyle = spinStyleFilter === 'All' || item.style === spinStyleFilter;
      const matchOccasion = spinOccasionFilter === 'All' || item.occasion === spinOccasionFilter;
      return matchStyle && matchOccasion;
    });

    const pool = candidates.length > 0 ? candidates : CURATED_SIMULATION_OUTFITS;

    if (spinTimerRef.current) clearInterval(spinTimerRef.current);

    spinTimerRef.current = setInterval(() => {
      counter++;
      const randomIdx = Math.floor(Math.random() * pool.length);
      const chosen = pool[randomIdx];

      setActiveSlotImage(chosen.image);
      setActiveSlotTitle(chosen.title);

      if (counter >= totalTicks) {
        if (spinTimerRef.current) clearInterval(spinTimerRef.current);
        const finalCandidate = pool[randomIdx];
        const masterIdx = CURATED_SIMULATION_OUTFITS.findIndex((c) => c.id === finalCandidate.id);
        setSelectedCuratedIndex(masterIdx >= 0 ? masterIdx : 0);
        setIsSpinning(false);
        setSpinCount((prev) => prev + 1);

        // Auto generate combination result matching this lookbook & today's lucky colors
        generateMatchingResult(finalCandidate);
      }
    }, speed);
  };

  // Generate an OutfitCombination from the selected curated look & lucky rule
  const generateMatchingResult = async (curated: (typeof CURATED_SIMULATION_OUTFITS)[0]) => {
    try {
      const res = await api.matchOutfit({
        targetDate: currentDate,
        birthday: currentUser?.birthday || '1998-05-20',
        birthDayOfWeek: currentUser?.birthDayOfWeek || 'wednesday_day',
        style: curated.style,
        occasion: curated.occasion,
      });

      if (res && res.combinations && res.combinations.length > 0) {
        setGeneratedComb(res.combinations[0]);
      }
    } catch (err) {
      console.error('Error generating roulette match:', err);
    }
  };

  useEffect(() => {
    return () => {
      if (spinTimerRef.current) clearInterval(spinTimerRef.current);
    };
  }, []);

  // When modal opens the first time, if not spun yet, do initial spin
  useEffect(() => {
    if (isOpen && spinCount === 0) {
      startSpin();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar with gradient */}
        <div className="relative p-5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Shuffle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">
                  วงล้อสุ่มแมทช์ชุดอัตโนมัติ (Lucky Outfit Roulette)
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-white/25 text-[10px] font-bold uppercase tracking-wider">
                  Randomizer
                </span>
              </div>
              <p className="text-xs text-rose-100 flex items-center gap-1.5">
                <span>หมุนสุ่มค้นหาชุดพร้อมรูปภาพจำลองและสีมงคล</span>
                {targetDayThaiName && (
                  <span className="font-semibold text-white underline decoration-white/40">
                    • วัน{targetDayThaiName}
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/15 hover:bg-white/30 text-white transition-all cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar to narrow down the spin */}
        <div className="px-5 py-2.5 bg-stone-50 border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium">ฟิลเตอร์สไตล์:</span>
              <select
                value={spinStyleFilter}
                onChange={(e) => setSpinStyleFilter(e.target.value as any)}
                disabled={isSpinning}
                className="px-2.5 py-1 rounded-lg bg-white border border-stone-300 text-stone-700 font-medium cursor-pointer"
              >
                <option value="All">สุ่มทุกสไตล์</option>
                <option value="Minimal">Minimal</option>
                <option value="Korean">Korean</option>
                <option value="Casual">Casual</option>
                <option value="Luxury">Luxury</option>
                <option value="Romantic">Romantic</option>
                <option value="Street">Street</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium">โอกาส:</span>
              <select
                value={spinOccasionFilter}
                onChange={(e) => setSpinOccasionFilter(e.target.value as any)}
                disabled={isSpinning}
                className="px-2.5 py-1 rounded-lg bg-white border border-stone-300 text-stone-700 font-medium cursor-pointer"
              >
                <option value="All">สุ่มทุกโอกาส</option>
                <option value="วันสบาย ๆ">วันสบาย ๆ</option>
                <option value="เที่ยว">เที่ยว</option>
                <option value="ออกเดท">ออกเดท</option>
                <option value="ประชุม">ประชุม</option>
                <option value="ออกงานกลางคืน">ออกงานกลางคืน</option>
              </select>
            </div>
          </div>

          <div className="text-[11px] text-stone-400 font-medium">
            หมุนไปแล้ว {spinCount} ครั้ง
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Roulette Display Box */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-stone-200 bg-stone-950 shadow-md group">
            {/* Spinning Animation Overlay */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden flex items-center justify-center bg-stone-900">
              <img
                src={isSpinning ? activeSlotImage : currentOutfit.image}
                alt={isSpinning ? activeSlotTitle : currentOutfit.title}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover object-center transition-all duration-300 ${
                  isSpinning ? 'scale-110 blur-[1.5px] brightness-90' : 'scale-100 blur-0'
                }`}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

              {/* Slot machine frame border accents */}
              {isSpinning && (
                <div className="absolute inset-0 border-4 border-amber-400/80 animate-pulse pointer-events-none flex items-center justify-center">
                  <div className="px-5 py-2.5 rounded-2xl bg-black/75 backdrop-blur-md text-white text-sm font-bold flex items-center gap-2 shadow-2xl border border-white/20">
                    <RotateCw className="w-5 h-5 text-amber-400 animate-spin" />
                    <span>กำลังหมุนสุ่มชุดที่ใช่...</span>
                  </div>
                </div>
              )}

              {/* Badges on image */}
              <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold border border-white/10">
                  {isSpinning ? 'กำลังสุ่ม...' : `${currentOutfit.style} • ${currentOutfit.occasion}`}
                </span>
                {!isSpinning && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-xs font-bold shadow-xs">
                    Harmony {currentOutfit.harmonyScore}%
                  </span>
                )}
              </div>

              {/* Lucky Day Match Tag */}
              {luckyRule && !isSpinning && (
                <div className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-amber-500 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-md">
                  <Flame className="w-3.5 h-3.5 text-rose-800" />
                  <span>สีมงคลวัน{luckyRule.dayName}</span>
                </div>
              )}

              {/* Title and Tagline inside image */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h2 className="text-lg sm:text-xl font-black drop-shadow-md">
                  {isSpinning ? activeSlotTitle : currentOutfit.title}
                </h2>
                <p className="text-xs sm:text-sm text-stone-200 drop-shadow-xs line-clamp-1">
                  {isSpinning ? 'สแกนคู่สีและโครงร่างชุด...' : currentOutfit.tagline}
                </p>
              </div>
            </div>

            {/* Quick Quick Details bar below photo */}
            {!isSpinning && (
              <div className="p-4 bg-stone-900 border-t border-stone-800 text-white space-y-2.5">
                {/* Palette preview */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-stone-400 font-semibold">สูตรสี 60-30-10:</span>
                    <div className="flex items-center gap-1">
                      <span
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: currentOutfit.palette.main.hex }}
                        title={`สีหลัก: ${currentOutfit.palette.main.name}`}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: currentOutfit.palette.secondary.hex }}
                        title={`สีรอง: ${currentOutfit.palette.secondary.name}`}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: currentOutfit.palette.accent.hex }}
                        title={`สีเด่น: ${currentOutfit.palette.accent.name}`}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-stone-300">
                    <strong>สูตรทฤษฎี:</strong> {currentOutfit.harmonyType}
                  </div>
                </div>

                {/* Garments Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-stone-300 pt-1">
                  <div className="p-2 rounded-xl bg-stone-800/80 border border-stone-700/60 truncate">
                    <span className="text-stone-400 text-[10px] block">ท่อนบน</span>
                    {currentOutfit.garments.top}
                  </div>
                  <div className="p-2 rounded-xl bg-stone-800/80 border border-stone-700/60 truncate">
                    <span className="text-stone-400 text-[10px] block">ท่อนล่าง</span>
                    {currentOutfit.garments.bottom}
                  </div>
                  <div className="p-2 rounded-xl bg-stone-800/80 border border-stone-700/60 truncate">
                    <span className="text-stone-400 text-[10px] block">รองเท้า/กระเป๋า</span>
                    {currentOutfit.garments.shoes}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lucky Color Guidance Card */}
          {luckyRule && !isSpinning && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Star className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <span>สีมงคลเสริมดวงประจำวัน{targetDayThaiName || 'นี้'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-200/70 text-amber-800 font-semibold">
                    {currentDate}
                  </span>
                </div>
                <div className="text-xs text-amber-800 mt-1 flex flex-wrap gap-2 items-center">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <span
                      className="w-3 h-3 rounded-full border border-black/10 inline-block shadow-2xs"
                      style={{ backgroundColor: luckyRule.hexCode }}
                    />
                    <strong>สีมงคลหลัก:</strong> {luckyRule.colorName} ({luckyRule.hexCode})
                  </span>
                  {luckyRule.description && (
                    <>
                      <span>•</span>
                      <span className="text-amber-700/90">{luckyRule.description}</span>
                    </>
                  )}
                </div>
                <div className="text-[11px] text-amber-700/80 mt-1 italic">
                  💡 เคล็ดลับสไตล์: {currentOutfit.stylingTip}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Spin Button */}
            <button
              onClick={startSpin}
              disabled={isSpinning}
              className="flex-1 sm:flex-initial py-2.5 px-5 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'กำลังหมุนสุ่ม...' : 'หมุนสุ่มชุดใหม่อีกครั้ง 🎲'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-2xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 text-xs font-bold transition-all cursor-pointer"
            >
              ปิด
            </button>

            <button
              disabled={isSpinning}
              onClick={() => {
                if (generatedComb) {
                  onSelectResultOutfit(generatedComb, currentOutfit.style, currentOutfit.occasion);
                  onClose();
                } else {
                  // Generate quickly then select
                  api
                    .matchOutfit({
                      targetDate: currentDate,
                      birthday: currentUser?.birthday || '1998-05-20',
                      birthDayOfWeek: currentUser?.birthDayOfWeek || 'wednesday_day',
                      style: currentOutfit.style,
                      occasion: currentOutfit.occasion,
                    })
                    .then((res) => {
                      if (res && res.combinations && res.combinations[0]) {
                        onSelectResultOutfit(
                          res.combinations[0],
                          currentOutfit.style,
                          currentOutfit.occasion
                        );
                      }
                      onClose();
                    });
                }
              }}
              className="flex-1 sm:flex-initial py-2.5 px-5 rounded-2xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>เลือกชุดนี้และไปแต่งตาม</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
