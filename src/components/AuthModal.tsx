import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Mail, User, Calendar, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { DayOfWeekKey, StyleOption, UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('1998-05-20');
  const [birthDayOfWeek, setBirthDayOfWeek] = useState<DayOfWeekKey>('wednesday_day');
  const [preferredStyle, setPreferredStyle] = useState<StyleOption>('Minimal');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(email, password);
        onSuccess(res.user);
        onClose();
      } else {
        const res = await api.register({
          name,
          email,
          password,
          birthday,
          birthDayOfWeek,
          preferredStyle,
        });
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการดำเนินการ');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (type: 'user' | 'admin') => {
    setError(null);
    setLoading(true);
    try {
      const creds =
        type === 'admin'
          ? { email: 'admin@dailycolormatch.com', password: 'admin1234' }
          : { email: 'user@example.com', password: 'password123' };
      const res = await api.login(creds.email, creds.password);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-xl border border-stone-200 p-6 overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-rose-50 text-rose-600 mb-2">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-stone-900">
              {mode === 'login' ? 'เข้าสู่ระบบสมาชิก' : 'สมัครสมาชิกใหม่'}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              บันทึกชุดที่ชอบ เก็บประวัติ และคำนวณสีประจำวันอัตโนมัติ
            </p>
          </div>

          {/* Quick Demo Login Bar */}
          <div className="mb-5 p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
            <div className="text-[11px] font-semibold text-stone-500 mb-2 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>ทดลองเข้าสู่ระบบแบบรวดเร็ว (One-Click Demo):</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('user')}
                className="py-1.5 px-2.5 rounded-xl bg-white border border-stone-200 hover:border-rose-400 text-xs font-semibold text-stone-700 shadow-2xs hover:text-rose-600 transition-all cursor-pointer text-center"
              >
                👤 สมาชิกทั่วไป (User)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="py-1.5 px-2.5 rounded-xl bg-white border border-stone-200 hover:border-purple-400 text-xs font-semibold text-purple-700 shadow-2xs hover:bg-purple-50 transition-all cursor-pointer text-center"
              >
                🛡️ ผู้ดูแล (Admin)
              </button>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-stone-100 p-1 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'login' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'register' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
              }`}
            >
              สมัครสมาชิก
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">ชื่อ-นามสกุล</label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น สมศรี ใจดี"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">อีเมล</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">รหัสผ่าน</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-500"
                />
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      วัน/เดือน/ปีเกิด
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="date"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        className="w-full pl-9 pr-2 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">วันเกิดทางโหราศาสตร์</label>
                    <select
                      value={birthDayOfWeek}
                      onChange={(e) => setBirthDayOfWeek(e.target.value as DayOfWeekKey)}
                      className="w-full px-2.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-500 bg-white"
                    >
                      <option value="sunday">วันอาทิตย์</option>
                      <option value="monday">วันจันทร์</option>
                      <option value="tuesday">วันอังคาร</option>
                      <option value="wednesday_day">วันพุธ (กลางวัน)</option>
                      <option value="wednesday_night">วันพุธ (กลางคืน/ราหู)</option>
                      <option value="thursday">วันพฤหัสบดี</option>
                      <option value="friday">วันศุกร์</option>
                      <option value="saturday">วันเสาร์</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">สไตล์ที่ชอบ</label>
                  <select
                    value={preferredStyle}
                    onChange={(e) => setPreferredStyle(e.target.value as StyleOption)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-500 bg-white"
                  >
                    <option value="Minimal">Minimal</option>
                    <option value="Korean">Korean</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Casual">Casual</option>
                    <option value="Office">Office</option>
                    <option value="Smart Casual">Smart Casual</option>
                    <option value="Elegant">Elegant</option>
                    <option value="Romantic">Romantic</option>
                    <option value="Street">Street</option>
                    <option value="Sport">Sport</option>
                    <option value="Vintage">Vintage</option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-2xl bg-stone-900 text-white font-bold text-sm shadow-md hover:bg-stone-800 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading
                ? 'กำลังดำเนินการ...'
                : mode === 'login'
                ? 'เข้าสู่ระบบ'
                : 'สร้างบัญชีสมาชิก'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
