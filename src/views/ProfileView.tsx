import React, { useState } from 'react';
import { User, Calendar, Palette, Heart, LogOut, CheckCircle2, Shield } from 'lucide-react';
import { DayOfWeekKey, StyleOption, UserProfile, DAY_INFO_LIST } from '../types';
import { api } from '../services/api';

interface ProfileViewProps {
  currentUser: UserProfile | null;
  onUpdateUser: (user: UserProfile) => void;
  onLogout: () => void;
  onOpenAuth: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onUpdateUser,
  onLogout,
  onOpenAuth,
  onShowToast,
}) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [birthday, setBirthday] = useState(currentUser?.birthday || '1998-05-20');
  const [birthDayOfWeek, setBirthDayOfWeek] = useState<DayOfWeekKey>(
    currentUser?.birthDayOfWeek || 'wednesday_day'
  );
  const [gender, setGender] = useState(currentUser?.gender || 'female');
  const [preferredStyle, setPreferredStyle] = useState<StyleOption>(
    currentUser?.preferredStyle || 'Minimal'
  );
  const [saving, setSaving] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-stone-900">โปรไฟล์ผู้ใช้งาน</h2>
          <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
            เข้าสู่ระบบเพื่อบันทึกข้อมูลวันเกิด สไตล์ที่ชอบ และซิงค์ชุดโปรดของคุณได้ตลอดเวลา
          </p>
        </div>
        <button
          onClick={onOpenAuth}
          className="px-6 py-3 rounded-2xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 shadow-md transition-all cursor-pointer"
        >
          เข้าสู่ระบบ / สมัครสมาชิก
        </button>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateProfile({
        name,
        birthday,
        birthDayOfWeek,
        gender: gender as any,
        preferredStyle,
      });
      onUpdateUser(res.user);
      onShowToast('อัปเดตโปรไฟล์เรียบร้อยแล้ว ✓', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'บันทึกไม่สำเร็จ', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-stone-900">{currentUser.name}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 capitalize">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-stone-500">{currentUser.email}</p>
            <p className="text-[11px] text-stone-400 mt-1">
              สมาชิกตั้งแต่: {new Date(currentUser.createdAt).toLocaleDateString('th-TH')}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>ออกจากระบบ</span>
        </button>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-stone-900 pb-3 border-b border-stone-100">
          ข้อมูลประจำตัวและการตั้งค่าสี
        </h3>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">ชื่อที่แสดง</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              วัน/เดือน/ปีเกิด
            </label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              วันเกิดทางโหราศาสตร์
            </label>
            <select
              value={birthDayOfWeek}
              onChange={(e) => setBirthDayOfWeek(e.target.value as DayOfWeekKey)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-500 bg-white"
            >
              {DAY_INFO_LIST.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.symbol} {d.thaiName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">เพศ</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-500 bg-white"
            >
              <option value="female">หญิง</option>
              <option value="male">ชาย</option>
              <option value="unspecified">ไม่ระบุ</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">สไตล์แต่งตัวที่ชอบ</label>
            <select
              value={preferredStyle}
              onChange={(e) => setPreferredStyle(e.target.value as StyleOption)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-500 bg-white"
            >
              <option value="Minimal">Minimal</option>
              <option value="Korean">Korean</option>
              <option value="Luxury">Luxury</option>
              <option value="Casual">Casual</option>
              <option value="Office">Office</option>
              <option value="Smart Casual">Smart Casual</option>
              <option value="Elegant">Elegant</option>
              <option value="Romantic">Romantic</option>
              <option value="Sport">Sport</option>
              <option value="Vintage">Vintage</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full mt-4 py-3 rounded-2xl bg-stone-900 text-white font-bold text-xs shadow-md hover:bg-stone-800 transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? 'กำลังบันทึกข้อมูล...' : 'บันทึกการเปลี่ยนแปลง'}
        </button>
      </form>
    </div>
  );
};
