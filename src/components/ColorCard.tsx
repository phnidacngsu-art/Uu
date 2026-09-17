import React, { useState } from 'react';
import { Copy, Check, ShieldAlert, Sparkles, Star } from 'lucide-react';
import { ColorRule } from '../types';

interface ColorCardProps {
  rule: ColorRule;
  onCopy?: (hex: string) => void;
  compact?: boolean;
}

export const ColorCard: React.FC<ColorCardProps> = ({ rule, onCopy, compact = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(rule.hexCode);
    setCopied(true);
    if (onCopy) onCopy(rule.hexCode);
    setTimeout(() => setCopied(false), 1800);
  };

  const isLightColor = () => {
    const hex = rule.hexCode.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 165;
  };

  const getBadgeStyle = () => {
    switch (rule.type) {
      case 'recommended':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          label: 'สีมงคลหลัก',
          icon: <Sparkles className="w-3 h-3" />,
        };
      case 'secondary':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          label: 'สีมงคลรอง',
          icon: <Star className="w-3 h-3" />,
        };
      case 'avoid':
        return {
          bg: 'bg-stone-100 text-stone-600 border-stone-200',
          label: 'ควรหลีกเลี่ยง',
          icon: null,
        };
      case 'kali':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200',
          label: 'สีกาลกิณี',
          icon: <ShieldAlert className="w-3 h-3" />,
        };
    }
  };

  const badge = getBadgeStyle();

  if (compact) {
    return (
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 p-2 rounded-xl bg-white border border-stone-200 hover:border-stone-300 shadow-xs transition-all text-left group"
        title="คลิกเพื่อคัดลอกรหัส HEX"
      >
        <span
          className="w-7 h-7 rounded-lg border border-stone-200/80 shadow-inner shrink-0"
          style={{ backgroundColor: rule.hexCode }}
        />
        <div className="min-w-0 pr-1">
          <div className="text-xs font-semibold text-stone-800 truncate">{rule.colorName}</div>
          <div className="text-[11px] font-mono text-stone-400 group-hover:text-stone-600 transition-colors">
            {rule.hexCode}
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-stone-200 p-4 shadow-xs hover:shadow-md transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl shadow-inner border border-black/10 shrink-0 flex items-center justify-center transition-transform group-hover:scale-105"
            style={{ backgroundColor: rule.hexCode }}
          >
            {isLightColor() ? (
              <span className="w-2 h-2 rounded-full bg-black/20" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-white/40" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-sm font-semibold text-stone-800">{rule.colorName}</h4>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${badge.bg}`}
              >
                {badge.icon}
                {badge.label}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="mt-1 flex items-center gap-1 text-xs font-mono text-stone-400 hover:text-stone-700 transition-colors"
            >
              <span>{rule.hexCode}</span>
              {copied ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3 opacity-60" />
              )}
            </button>
          </div>
        </div>
      </div>

      {rule.description && (
        <p className="mt-3 text-xs text-stone-600 leading-relaxed border-t border-stone-100 pt-2.5">
          {rule.description}
        </p>
      )}
    </div>
  );
};
