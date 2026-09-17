import React, { useState } from 'react';
import {
  Sparkles,
  Maximize2,
  X,
  Palette,
  Eye,
  Check,
  Shirt,
  ShoppingBag,
  Footprints,
  Scissors,
  Watch,
  Layers,
  Info,
  ChevronRight,
} from 'lucide-react';
import { OutfitCombination, OccasionOption, StyleOption, CuratedSimulationOutfit } from '../types';
import { CURATED_SIMULATION_OUTFITS, getOutfitMockupImage } from '../data/outfitSimulations';

interface OutfitSimulatorProps {
  combination: OutfitCombination;
  occasion: OccasionOption;
  style: StyleOption;
  onApplyCuratedStyle?: (style: StyleOption, occasion: OccasionOption) => void;
}

export const OutfitSimulator: React.FC<OutfitSimulatorProps> = ({
  combination,
  occasion,
  style,
  onApplyCuratedStyle,
}) => {
  const [activeTab, setActiveTab] = useState<'lookbook' | 'mannequin' | 'gallery'>('lookbook');
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);
  const [selectedCurated, setSelectedCurated] = useState<CuratedSimulationOutfit | null>(null);

  const mockupImage = combination.mockupImage || getOutfitMockupImage(style, occasion, combination.id);

  // Clothing pieces mapping
  const pieces = [
    {
      id: 'top',
      label: 'ท่อนบน (Top)',
      item: combination.items.top,
      icon: <Shirt className="w-3.5 h-3.5" />,
      position: { top: '32%', left: '46%' },
      ratio: '60%',
    },
    {
      id: 'bottom',
      label: 'ท่อนล่าง (Bottom)',
      item: combination.items.bottom,
      icon: <Scissors className="w-3.5 h-3.5" />,
      position: { top: '56%', left: '44%' },
      ratio: '30%',
    },
    {
      id: 'shoes',
      label: 'รองเท้า (Shoes)',
      item: combination.items.shoes,
      icon: <Footprints className="w-3.5 h-3.5" />,
      position: { top: '78%', left: '70%' },
      ratio: 'Neutral',
    },
    {
      id: 'bag',
      label: 'กระเป๋า (Bag)',
      item: combination.items.bag,
      icon: <ShoppingBag className="w-3.5 h-3.5" />,
      position: { top: '48%', left: '80%' },
      ratio: 'Accent 10%',
    },
    {
      id: 'accessory',
      label: 'เครื่องประดับ (Accessory)',
      item: combination.items.accessory,
      icon: <Watch className="w-3.5 h-3.5" />,
      position: { top: '22%', left: '78%' },
      ratio: 'Accent',
    },
  ];

  return (
    <div className="bg-stone-900 rounded-3xl text-white overflow-hidden shadow-lg border border-stone-800">
      {/* Simulation Header */}
      <div className="p-4 sm:p-5 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-stone-900 via-stone-800/80 to-stone-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                OUTFIT SIMULATION STUDIO
              </span>
              <span className="text-stone-600">•</span>
              <span className="text-xs text-stone-300 font-medium">ชุดจำลองสไตล์ลิสต์</span>
            </div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <span>{style} Look</span>
              <span className="text-xs font-normal text-stone-400">({occasion})</span>
            </h4>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 bg-stone-950/80 rounded-2xl border border-stone-800 text-xs">
          <button
            onClick={() => setActiveTab('lookbook')}
            className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'lookbook'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>ภาพชุดจริง</span>
          </button>
          <button
            onClick={() => setActiveTab('mannequin')}
            className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'mannequin'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>หุ่นจำลอง 2D</span>
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>แกลเลอรีสไตล์</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6">
        {activeTab === 'lookbook' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Visual Photo Mockup with Interactive Pins */}
            <div className="lg:col-span-7 relative group">
              <div className="relative aspect-[3/4] sm:aspect-[4/3] lg:aspect-[3/4] rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 shadow-inner">
                <img
                  src={mockupImage}
                  alt={`ชุดจำลองสไตล์ ${style}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-102"
                />

                {/* Subtle vignette gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

                {/* Expand Fullscreen Button */}
                <button
                  onClick={() => setIsPhotoZoomed(true)}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-stone-900/80 backdrop-blur-md border border-white/10 text-white hover:bg-stone-900 transition-colors shadow-md cursor-pointer"
                  title="ดูภาพชุดขนาดเต็ม"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Floating Interactive Garment Pins */}
                {pieces.map((p) => {
                  const isSelected = selectedPin === p.id;
                  return (
                    <div
                      key={p.id}
                      style={{ top: p.position.top, left: p.position.left }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                    >
                      <button
                        onClick={() => setSelectedPin(isSelected ? null : p.id)}
                        className={`group/btn relative flex items-center justify-center transition-all cursor-pointer ${
                          isSelected ? 'scale-125' : 'hover:scale-110'
                        }`}
                        title={`${p.label}: ${p.item.colorName}`}
                      >
                        <span className="absolute -inset-1 rounded-full bg-white/40 animate-ping opacity-60 pointer-events-none" />
                        <div
                          className="w-7 h-7 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-white relative z-10"
                          style={{ backgroundColor: p.item.hexCode }}
                        >
                          <span className="drop-shadow-xs">{p.item.role[0].toUpperCase()}</span>
                        </div>
                      </button>

                      {/* Tooltip on pin */}
                      {isSelected && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 rounded-xl bg-stone-900/95 backdrop-blur-md border border-stone-700 shadow-2xl text-left z-30 pointer-events-none">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                            {p.label}
                          </div>
                          <div className="text-xs font-bold text-white truncate mt-0.5">
                            {p.item.colorName}
                          </div>
                          <div className="text-[10px] text-stone-400 flex items-center gap-1.5 mt-1 font-mono">
                            <span
                              className="w-2.5 h-2.5 rounded-xs border border-white/20 shrink-0"
                              style={{ backgroundColor: p.item.hexCode }}
                            />
                            <span>{p.item.hexCode}</span>
                            <span className="text-stone-500">•</span>
                            <span className="text-stone-300">{p.ratio}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Bottom Photo Overlay Badge */}
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-stone-900/85 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-stone-200 font-medium">
                      ภาพจำลอง Flat-lay คุมโทนสไตล์ลิสต์
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-rose-300">
                    แตะที่หมุดสีเพื่อดูชิ้นผ้า
                  </span>
                </div>
              </div>
            </div>

            {/* Sidebar Details: Garments Color breakdown */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                  COLOR COORDINATION RATIO
                </span>
                <h5 className="text-lg font-bold text-white mt-0.5">
                  สัดส่วนสีชุดตามสูตร 60-30-10
                </h5>
                <p className="text-xs text-stone-400 mt-1">
                  จำลองการกระจายเฉดสีบนร่างกาย ให้ลุคดูสมดุล ไม่กลืนและไม่ฉูดฉาดเกินไป
                </p>
              </div>

              {/* Ratio Bar */}
              <div className="space-y-1.5">
                <div className="h-3 w-full rounded-full overflow-hidden flex shadow-inner bg-stone-800">
                  <div
                    style={{
                      width: '60%',
                      backgroundColor: combination.mainColor.hex,
                    }}
                    title={`สีหลัก 60%: ${combination.mainColor.name}`}
                  />
                  <div
                    style={{
                      width: '30%',
                      backgroundColor: combination.secondaryColor.hex,
                    }}
                    title={`สีรอง 30%: ${combination.secondaryColor.name}`}
                  />
                  <div
                    style={{
                      width: '10%',
                      backgroundColor: combination.accentColor.hex,
                    }}
                    title={`Accent 10%: ${combination.accentColor.name}`}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-400 font-medium">
                  <span className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-xs"
                      style={{ backgroundColor: combination.mainColor.hex }}
                    />
                    สีหลัก 60%
                  </span>
                  <span className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-xs"
                      style={{ backgroundColor: combination.secondaryColor.hex }}
                    />
                    สีรอง 30%
                  </span>
                  <span className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-xs"
                      style={{ backgroundColor: combination.accentColor.hex }}
                    />
                    Accent 10%
                  </span>
                </div>
              </div>

              {/* Garment Pieces List */}
              <div className="space-y-2">
                {pieces.map((p) => {
                  const isSelected = selectedPin === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPin(isSelected ? null : p.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-stone-800 border-rose-500/50 shadow-sm'
                          : 'bg-stone-900/60 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg shadow-sm border border-white/20 shrink-0 flex items-center justify-center"
                          style={{ backgroundColor: p.item.hexCode }}
                        >
                          <span className="text-[10px] font-bold text-white drop-shadow-xs">
                            {p.item.role[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                            {p.icon}
                            <span>{p.label}</span>
                          </div>
                          <div className="text-[11px] text-stone-400 truncate">
                            {p.item.colorName} ({p.item.hexCode})
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 shrink-0">
                        {p.ratio}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/40 text-rose-200 text-xs leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Stylist Note:</strong> {combination.explanation}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mannequin' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Mannequin Silhouette SVG dyed dynamically */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-stone-950 rounded-2xl border border-stone-800 relative">
              <div className="text-xs font-medium text-stone-400 mb-3">
                หุ่นจำลองสวมใส่แบบไดนามิก (Dynamic Mannequin)
              </div>

              {/* Silhouette SVG Canvas */}
              <div className="relative w-64 h-96 flex items-center justify-center">
                <svg viewBox="0 0 200 320" className="w-full h-full drop-shadow-2xl">
                  <defs>
                    {/* Fabric shading filters */}
                    <linearGradient id="topGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={combination.items.top.hexCode} stopOpacity="1" />
                      <stop offset="100%" stopColor={combination.items.top.hexCode} stopOpacity="0.85" />
                    </linearGradient>
                    <linearGradient id="bottomGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={combination.items.bottom.hexCode} stopOpacity="1" />
                      <stop offset="100%" stopColor={combination.items.bottom.hexCode} stopOpacity="0.88" />
                    </linearGradient>
                    <linearGradient id="shoesGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={combination.items.shoes.hexCode} stopOpacity="1" />
                      <stop offset="100%" stopColor={combination.items.shoes.hexCode} stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="bagGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={combination.items.bag.hexCode} stopOpacity="1" />
                      <stop offset="100%" stopColor={combination.items.bag.hexCode} stopOpacity="0.85" />
                    </linearGradient>
                  </defs>

                  {/* Head & Neck silhouette */}
                  <ellipse cx="100" cy="35" rx="15" ry="19" fill="#E2D9D2" opacity="0.6" />
                  <path d="M96 54 L104 54 L103 66 L97 66 Z" fill="#D6CCC2" opacity="0.6" />

                  {/* Top Garment (Blazer / Jacket / Shirt) */}
                  <g className="cursor-pointer transition-transform hover:scale-101">
                    <path
                      d="M72 66 Q100 70 128 66 L144 110 L130 114 L122 84 L122 152 Q100 155 78 152 L78 84 L70 114 L56 110 Z"
                      fill="url(#topGradient)"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="1.5"
                    />
                    {/* Inner lapel neckline */}
                    <path d="M88 67 L100 102 L112 67" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" />
                    {/* Buttons / Seam */}
                    <circle cx="100" cy="115" r="2" fill="rgba(255,255,255,0.4)" />
                    <circle cx="100" cy="132" r="2" fill="rgba(255,255,255,0.4)" />
                  </g>

                  {/* Accessory Pin (Watch / Belt / Necklace) */}
                  <g className="cursor-pointer">
                    <rect
                      x="78"
                      y="149"
                      width="44"
                      height="5"
                      rx="2"
                      fill={combination.items.accessory.hexCode}
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth="0.8"
                    />
                    <circle cx="100" cy="151.5" r="3.5" fill="#F59E0B" stroke="#FFF" strokeWidth="0.5" />
                  </g>

                  {/* Bottom Garment (Trousers / Skirt) */}
                  <g className="cursor-pointer transition-transform hover:scale-101">
                    <path
                      d="M78 154 L122 154 L126 265 L106 265 L100 185 L94 265 L74 265 Z"
                      fill="url(#bottomGradient)"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="1.5"
                    />
                    {/* Trouser crease lines */}
                    <line x1="88" y1="165" x2="86" y2="260" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
                    <line x1="112" y1="165" x2="114" y2="260" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
                  </g>

                  {/* Footwear (Shoes) */}
                  <g className="cursor-pointer">
                    {/* Left shoe */}
                    <path
                      d="M73 266 L86 266 L88 277 L68 277 Z"
                      fill="url(#shoesGradient)"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="1"
                    />
                    {/* Right shoe */}
                    <path
                      d="M114 266 L127 266 L132 277 L112 277 Z"
                      fill="url(#shoesGradient)"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="1"
                    />
                  </g>

                  {/* Handbag (Held on side) */}
                  <g className="cursor-pointer">
                    {/* Strap */}
                    <path
                      d="M136 112 Q148 135 146 160"
                      fill="none"
                      stroke={combination.items.bag.hexCode}
                      strokeWidth="2.5"
                    />
                    {/* Bag body */}
                    <rect
                      x="136"
                      y="160"
                      width="28"
                      height="24"
                      rx="4"
                      fill="url(#bagGradient)"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="1.2"
                    />
                    {/* Bag clasp */}
                    <circle cx="150" cy="172" r="2.5" fill="#D4AF37" />
                  </g>
                </svg>
              </div>

              <div className="text-[11px] text-stone-500 mt-3 text-center">
                สีเสื้อผ้าจะปรับเปลี่ยนตามรหัสสี HEX ของผลการคำนวณแบบเรียลไทม์
              </div>
            </div>

            {/* Mannequin Specs */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                  COLOR LAYERING ANATOMY
                </span>
                <h5 className="text-lg font-bold text-white mt-0.5">โครงสร้างการจัดวางเลเยอร์สี</h5>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg border border-white/20 shrink-0"
                      style={{ backgroundColor: combination.items.top.hexCode }}
                    />
                    <div>
                      <div className="text-xs font-bold text-white">
                        {combination.items.top.label}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        {combination.items.top.colorName} ({combination.items.top.hexCode})
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-rose-400">Main Focus</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg border border-white/20 shrink-0"
                      style={{ backgroundColor: combination.items.bottom.hexCode }}
                    />
                    <div>
                      <div className="text-xs font-bold text-white">
                        {combination.items.bottom.label}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        {combination.items.bottom.colorName} ({combination.items.bottom.hexCode})
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-stone-400">Ground Balance</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg border border-white/20 shrink-0"
                      style={{ backgroundColor: combination.items.bag.hexCode }}
                    />
                    <div>
                      <div className="text-xs font-bold text-white">
                        {combination.items.bag.label}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        {combination.items.bag.colorName} ({combination.items.bag.hexCode})
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-amber-400">Accent Highlight</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-800/80 border border-stone-700 text-xs text-stone-300">
                <p className="leading-relaxed">
                  💡 <strong>เทคนิคจากสไตลิสต์:</strong> การใส่สีหลักไว้ที่ท่อนบนจะช่วยดึงสายตาของผู้พบเห็นมาที่ระดับใบหน้า เพิ่มความมั่นใจในการสนทนา และตัดด้วยกางเกงโทนกลางเพื่อความสมดุล
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h5 className="text-base font-bold text-white">
                  ชุดจำลองสไตล์ลิสต์ยอดนิยม (Curated Stylist Outfits)
                </h5>
                <p className="text-xs text-stone-400">
                  เลือกดูชุดจำลองที่คัดสรรคู่สีอย่างลงตัวและดูดีมีระดับ พร้อมสไตล์และเคล็ดลับการแต่ง
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CURATED_SIMULATION_OUTFITS.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedCurated(item)}
                  className="group bg-stone-950 rounded-2xl border border-stone-800 overflow-hidden hover:border-rose-500/50 transition-all cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone-900">
                    <img
                      src={item.image}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-rose-300">
                      {item.style} • {item.occasion}
                    </div>

                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-500/90 text-[10px] font-bold text-white">
                      {item.harmonyScore}%
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      <div className="text-xs font-bold text-white truncate">{item.title}</div>
                      <div className="text-[11px] text-stone-300 truncate">{item.tagline}</div>
                    </div>
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    {/* Mini Palette */}
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: item.palette.main.hex }}
                        title={item.palette.main.name}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: item.palette.secondary.hex }}
                        title={item.palette.secondary.name}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: item.palette.accent.hex }}
                        title={item.palette.accent.name}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: item.palette.neutral.hex }}
                        title={item.palette.neutral.name}
                      />
                      <span className="text-[10px] text-stone-400 ml-1 truncate">
                        {item.palette.main.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-rose-400 font-semibold pt-1 border-t border-stone-850">
                      <span>ดูรายละเอียดชุด</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Photo Zoom Modal */}
      {isPhotoZoomed && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 shadow-2xl">
            <button
              onClick={() => setIsPhotoZoomed(false)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-[3/4] max-h-[75vh] w-full overflow-hidden">
              <img
                src={mockupImage}
                alt="ชุดจำลองขนาดเต็ม"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-4 bg-stone-900 border-t border-stone-800 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">
                  ชุดจำลองสไตล์ {style} ({occasion})
                </div>
                <div className="text-xs text-stone-400">
                  โทนสีหลัก: {combination.mainColor.name} • สีกาลกิณีถูกตัดออก 100%
                </div>
              </div>
              <button
                onClick={() => setIsPhotoZoomed(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-white cursor-pointer"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Curated Outfit Detail Modal */}
      {selectedCurated && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                  {selectedCurated.style} • {selectedCurated.occasion}
                </span>
                <span className="text-stone-600">•</span>
                <span className="text-xs text-emerald-400 font-bold">
                  Harmony {selectedCurated.harmonyScore}%
                </span>
              </div>
              <button
                onClick={() => setSelectedCurated(null)}
                className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-stone-950 border border-stone-800">
                  <img
                    src={selectedCurated.image}
                    alt={selectedCurated.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-lg font-bold text-white">{selectedCurated.title}</h4>
                    <p className="text-xs text-stone-300 mt-1">{selectedCurated.tagline}</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="text-[11px] font-semibold text-stone-400 uppercase">
                      ชิ้นเสื้อผ้าที่แนะนำ:
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5 text-stone-300">
                      <div>
                        <strong>ท่อนบน:</strong> {selectedCurated.garments.top}
                      </div>
                      <div>
                        <strong>ท่อนล่าง:</strong> {selectedCurated.garments.bottom}
                      </div>
                      <div>
                        <strong>รองเท้า:</strong> {selectedCurated.garments.shoes}
                      </div>
                      <div>
                        <strong>กระเป๋า:</strong> {selectedCurated.garments.bag}
                      </div>
                      <div>
                        <strong>เครื่องประดับ:</strong> {selectedCurated.garments.accessories}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-900/40 text-amber-200 text-xs">
                    <strong>คำแนะนำสไตล์ลิสต์:</strong> {selectedCurated.stylingTip}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between gap-3">
              <span className="text-xs text-stone-400">{selectedCurated.suitableDay}</span>
              <div className="flex items-center gap-2">
                {onApplyCuratedStyle && (
                  <button
                    onClick={() => {
                      onApplyCuratedStyle(selectedCurated.style, selectedCurated.occasion);
                      setSelectedCurated(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ใช้สไตล์นี้แมทช์สีมงคลฉัน</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedCurated(null)}
                  className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300 cursor-pointer"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
