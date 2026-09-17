import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, X } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMatching: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onStartMatching,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 sm:p-7 overflow-hidden"
        >
          {/* Subtle Ambient Glow Circles */}
          <div className="absolute -top-14 -right-14 w-40 h-40 bg-rose-200/50 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-14 -left-14 w-40 h-40 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon Badge */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 text-white shadow-md mb-4">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>

          <div className="text-xs font-bold uppercase tracking-wider text-rose-600">
            Daily Color Match
          </div>
          <h2 className="text-2xl font-black text-stone-900 mt-1 leading-snug">
            วันนี้ให้สีช่วยเลือก<br />สไตล์ของคุณ ✨
          </h2>

          <p className="mt-2.5 text-sm text-stone-600 leading-relaxed">
            ค้นหาสีเสื้อผ้าที่ส่งเสริมพลังประจำวันเกิดของคุณ พร้อมระบบคัดกรอง <strong>สีกาลกิณีออก 100%</strong> และจับคู่ชุดตามหลัก Color Harmony สวยงาม ทันสมัย ใส่ได้จริงทุกโอกาส
          </p>

          <div className="mt-5 space-y-2 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[11px]">1</span>
              <span>เลือกวันเกิด & วันที่ต้องการแต่งตัว</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[11px]">2</span>
              <span>เลือกสไตล์และโอกาส (ทำงาน, เที่ยว, ออกเดท)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[11px]">3</span>
              <span>รับไอเดียชุด เสื้อ-กางเกง-รองเท้า-กระเป๋า-เครื่องประดับ</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => {
                onClose();
                onStartMatching();
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-sm shadow-md hover:shadow-lg hover:from-rose-600 hover:to-pink-700 transition-all cursor-pointer"
            >
              <span>เริ่มเลือกสีเลย</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs text-stone-400 hover:text-stone-600 font-medium"
            >
              ดูหน้าหลักก่อน
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>ปลอดภัยด้วยระบบตัดสีกาลกิณีอัตโนมัติ</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
