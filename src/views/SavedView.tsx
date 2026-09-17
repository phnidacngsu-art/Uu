import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2, Calendar, Sparkles, ChevronRight, Share2, Plus } from 'lucide-react';
import { SavedOutfit, UserProfile } from '../types';
import { api } from '../services/api';
import { OutfitVisualCard } from '../components/OutfitVisualCard';

interface SavedViewProps {
  currentUser: UserProfile | null;
  onNavigateToMatch: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SavedView: React.FC<SavedViewProps> = ({
  currentUser,
  onNavigateToMatch,
  onShowToast,
}) => {
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [selectedOutfit, setSelectedOutfit] = useState<SavedOutfit | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSaved = async () => {
    setLoading(true);
    try {
      const res = await api.getSavedOutfits(currentUser?.id);
      setSavedOutfits(res.savedOutfits);
      if (res.savedOutfits.length > 0 && !selectedOutfit) {
        setSelectedOutfit(res.savedOutfits[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, [currentUser?.id]);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteSavedOutfit(id);
      setSavedOutfits((prev) => prev.filter((o) => o.id !== id));
      if (selectedOutfit?.id === id) {
        setSelectedOutfit(null);
      }
      onShowToast('ลบชุดที่บันทึกแล้วเรียบร้อย ✓', 'info');
    } catch (err: any) {
      onShowToast('ไม่สามารถลบได้', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Title */}
      <div className="border-b border-stone-200 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider">
            <Bookmark className="w-4 h-4" />
            <span>Saved Outfits</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            ชุดที่บันทึกไว้ ({savedOutfits.length})
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            ชุดสีมงคลและสูตรการจับคู่ที่คุณบันทึกไว้สำหรับใช้งาน
          </p>
        </div>

        <button
          onClick={onNavigateToMatch}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-all cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>แมทช์ชุดใหม่</span>
        </button>
      </div>

      {savedOutfits.length === 0 && !loading ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-10 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
            <Bookmark className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-800">ยังไม่มีชุดที่บันทึกไว้</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
              เมื่อคุณทำการแมทช์ชุดในหน้า &quot;แมทช์สี&quot; สามารถกดปุ่ม &quot;บันทึกชุด&quot; เพื่อเก็บไว้ดูย้อนหลังได้ที่นี่
            </p>
          </div>
          <button
            onClick={onNavigateToMatch}
            className="px-6 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-all cursor-pointer inline-flex items-center gap-2 shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>เริ่มแมทช์ชุดแรกของคุณ</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* List Sidebar */}
          <div className="space-y-2.5 md:col-span-1">
            <div className="text-xs font-semibold text-stone-500 uppercase px-1">
              รายการชุด ({savedOutfits.length})
            </div>
            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
              {savedOutfits.map((outfit) => {
                const isSelected = selectedOutfit?.id === outfit.id;
                return (
                  <div
                    key={outfit.id}
                    onClick={() => setSelectedOutfit(outfit)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-rose-50/70 border-rose-300 shadow-xs'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-rose-600">
                          <span>{outfit.style}</span>
                          <span>•</span>
                          <span>{outfit.occasion}</span>
                        </div>
                        <h4 className="text-xs font-bold text-stone-800 truncate mt-0.5">
                          {outfit.title}
                        </h4>
                        <div className="text-[11px] font-mono text-stone-400 mt-1">
                          {outfit.targetDate}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(outfit.id);
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                        title="ลบชุดนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Palette snippet */}
                    <div className="mt-2.5 flex items-center gap-1">
                      <span
                        className="w-3.5 h-3.5 rounded-md border border-black/10"
                        style={{ backgroundColor: outfit.combination.mainColor.hex }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-md border border-black/10"
                        style={{ backgroundColor: outfit.combination.secondaryColor.hex }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-md border border-black/10"
                        style={{ backgroundColor: outfit.combination.neutralColor.hex }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-md border border-black/10"
                        style={{ backgroundColor: outfit.combination.accentColor.hex }}
                      />
                      <span className="text-[10px] font-bold text-stone-600 ml-auto">
                        {outfit.combination.score}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Detail Display */}
          <div className="md:col-span-2">
            {selectedOutfit ? (
              <OutfitVisualCard
                combination={selectedOutfit.combination}
                occasion={selectedOutfit.occasion}
                style={selectedOutfit.style}
                targetDate={selectedOutfit.targetDate}
                isSaved={true}
                onShare={async (comb) => {
                  const text = `ชุดสีมงคล ${selectedOutfit.title} (${selectedOutfit.targetDate}) จาก Daily Color Match`;
                  if (navigator.share) {
                    try {
                      await navigator.share({ title: 'Daily Color Match', text, url: window.location.href });
                    } catch (e) {
                      // ignore
                    }
                  } else {
                    navigator.clipboard?.writeText(text + ' ' + window.location.href);
                    onShowToast('คัดลอกลิงก์เรียบร้อยแล้ว ✓', 'success');
                  }
                }}
              />
            ) : (
              <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center text-stone-400 text-xs">
                เลือกชุดจากรายการทางซ้ายเพื่อดูรายละเอียด
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
