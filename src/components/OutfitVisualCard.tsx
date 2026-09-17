import React, { useState } from 'react';
import {
  Bookmark,
  Share2,
  Sparkles,
  ShieldCheck,
  Check,
  Shirt,
  Scissors,
  Footprints,
  ShoppingBag,
  Watch,
  Copy,
} from 'lucide-react';
import { OutfitCombination, OccasionOption, StyleOption } from '../types';

interface OutfitVisualCardProps {
  combination: OutfitCombination;
  occasion: OccasionOption;
  style: StyleOption;
  targetDate: string;
  onSave?: (comb: OutfitCombination) => void;
  isSaved?: boolean;
  onShare?: (comb: OutfitCombination) => void;
  onTryAnother?: () => void;
}

export const OutfitVisualCard: React.FC<OutfitVisualCardProps> = ({
  combination,
  occasion,
  style,
  targetDate,
  onSave,
  isSaved = false,
  onShare,
  onTryAnother,
}) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const copyHex = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 80) return 'text-indigo-700 bg-indigo-50 border-indigo-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  const items = [
    {
      category: 'TOP',
      label: 'ท่อนบน (เสื้อ)',
      icon: <Shirt className="w-4 h-4 text-stone-600" />,
      item: combination.items.top,
    },
    {
      category: 'BOTTOM',
      label: 'ท่อนล่าง (กางเกง/กระโปรง)',
      icon: <Scissors className="w-4 h-4 text-stone-600" />,
      item: combination.items.bottom,
    },
    {
      category: 'SHOES',
      label: 'รองเท้า',
      icon: <Footprints className="w-4 h-4 text-stone-600" />,
      item: combination.items.shoes,
    },
    {
      category: 'BAG',
      label: 'กระเป๋า',
      icon: <ShoppingBag className="w-4 h-4 text-stone-600" />,
      item: combination.items.bag,
    },
    {
      category: 'ACCESSORY',
      label: 'เครื่องประดับ / นาฬิกา',
      icon: <Watch className="w-4 h-4 text-stone-600" />,
      item: combination.items.accessory,
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden transition-all">
      {/* Header Banner */}
      <div className="p-5 pb-4 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-rose-50/50 via-white to-amber-50/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">
              {style} Style • {occasion}
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-xs text-stone-500 font-mono">{targetDate}</span>
          </div>
          <h3 className="text-base font-bold text-stone-800 mt-0.5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            {combination.harmonyType}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Harmony Score */}
          <div
            className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 shadow-xs ${getScoreColor(
              combination.score
            )}`}
          >
            <span className="text-[10px] uppercase font-semibold">Color Harmony</span>
            <span className="text-sm">{combination.score}%</span>
          </div>
        </div>
      </div>

      {/* Color Palette Strip */}
      <div className="px-5 py-3.5 bg-stone-50/80 border-b border-stone-100 flex items-center justify-between gap-2 overflow-x-auto">
        <span className="text-xs font-medium text-stone-500 whitespace-nowrap">Palette สรุป:</span>
        <div className="flex items-center gap-2">
          {[
            { label: 'หลัก', c: combination.mainColor },
            { label: 'รอง', c: combination.secondaryColor },
            { label: 'Accent', c: combination.accentColor },
            { label: 'Neutral', c: combination.neutralColor },
          ].map((p, idx) => (
            <button
              key={idx}
              onClick={() => copyHex(p.c.hex)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-stone-200/80 shadow-2xs hover:border-stone-400 transition-colors text-left"
              title={`คลิกเพื่อคัดลอก ${p.c.name} (${p.c.hex})`}
            >
              <span
                className="w-3.5 h-3.5 rounded-md border border-black/10 shrink-0"
                style={{ backgroundColor: p.c.hex }}
              />
              <span className="text-[11px] font-mono text-stone-600 font-medium">{p.c.hex}</span>
              {copiedHex === p.c.hex ? (
                <Check className="w-2.5 h-2.5 text-emerald-600" />
              ) : (
                <Copy className="w-2.5 h-2.5 text-stone-300" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Outfit Breakdown Grid */}
      <div className="p-5 space-y-3">
        <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
          การจัดสัดส่วนชิ้นเสื้อผ้า (Outfit Breakdown)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {items.map((it, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50/60 border border-stone-200/70 hover:bg-stone-50 transition-colors"
            >
              <div
                className="w-12 h-12 rounded-xl shadow-inner border border-black/10 shrink-0 flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: it.item.hexCode }}
              >
                <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1 rounded-sm bg-black/25 text-white">
                  {it.item.role[0].toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase">
                    {it.category}
                  </span>
                  <span className="text-[11px] font-mono text-stone-400">{it.item.hexCode}</span>
                </div>
                <div className="text-sm font-bold text-stone-800 truncate">{it.item.colorName}</div>
                <p className="text-xs text-stone-500 truncate mt-0.5">{it.item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Harmony Explanation */}
        <div className="mt-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            คำอธิบายความเข้ากันของสี (Color Harmony Rationale)
          </div>
          <p className="text-xs text-stone-700 leading-relaxed">{combination.explanation}</p>
          <div className="pt-2 border-t border-amber-200/50 space-y-1">
            {combination.luckyHighlights.map((hl, i) => (
              <div key={i} className="text-[11px] text-amber-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>{hl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Badge */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60 text-emerald-800 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ผ่านการตรวจสอบ: <strong>ตัดสีกาลกิณีออกทั้งหมด 100%</strong></span>
          </div>
          <span className="text-[11px] text-emerald-700/80">ระบบกรองอัตโนมัติ</span>
        </div>
      </div>

      {/* Card Actions */}
      <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {onSave && (
            <button
              onClick={() => onSave(combination)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isSaved
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-stone-200 hover:border-stone-300 text-stone-700 shadow-2xs'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
              {isSaved ? 'บันทึกแล้ว ✓' : 'บันทึกชุด'}
            </button>
          )}

          {onShare && (
            <button
              onClick={() => onShare(combination)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-stone-200 hover:border-stone-300 text-stone-700 shadow-2xs transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              แชร์ชุด
            </button>
          )}
        </div>

        {onTryAnother && (
          <button
            onClick={onTryAnother}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
          >
            ลองชุดอื่น →
          </button>
        )}
      </div>
    </div>
  );
};
