import React, { useState, useEffect } from 'react';
import { History, Calendar, Sparkles, Filter, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';
import { api } from '../services/api';

interface HistoryViewProps {
  currentUser: UserProfile | null;
  onNavigateToMatch: (date?: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ currentUser, onNavigateToMatch }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await api.getHistory(currentUser?.id);
        setHistory(res.history);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [currentUser?.id]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Title */}
      <div className="border-b border-stone-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider">
          <History className="w-4 h-4" />
          <span>Match History</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
          ประวัติการค้นหาและแมทช์สี
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          บันทึกการคำนวณสีชุดทั้งหมดของคุณเพื่อใช้เปรียบเทียบในแต่ละวัน
        </p>
      </div>

      {history.length === 0 && !loading ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-10 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
            <History className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-800">ยังไม่มีประวัติการแมทช์สี</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
              เริ่มค้นหาสีเสื้อผ้าที่เข้ากับวันเกิดและโอกาสของคุณได้ทันที
            </p>
          </div>
          <button
            onClick={() => onNavigateToMatch()}
            className="px-6 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>เริ่มแมทช์ชุด</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between text-xs font-semibold text-stone-500">
            <span>รายการล่าสุด ({history.length} ครั้ง)</span>
            <span>เรียงตามเวลาล่าสุด</span>
          </div>

          <div className="divide-y divide-stone-100">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-stone-50 transition-colors flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className="w-5 h-5 rounded-lg border border-black/10 shadow-2xs"
                      style={{ backgroundColor: item.topColor }}
                    />
                    <span
                      className="w-5 h-5 rounded-lg border border-black/10 shadow-2xs"
                      style={{ backgroundColor: item.bottomColor }}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-800">
                        สไตล์ {item.style} • {item.occasion}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.score}% Harmony
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-2">
                      <span>วันแต่งตัว: {item.targetDate}</span>
                      <span>•</span>
                      <span>{new Date(item.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateToMatch(item.targetDate)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors shrink-0 cursor-pointer"
                >
                  <span>แมทช์อีกครั้ง</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
