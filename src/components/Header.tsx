import React from 'react';
import { Bell, Sparkles, User, Shield, LogOut, Shuffle } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  currentUser: UserProfile | null;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  isAdminView: boolean;
  onToggleAdminView: () => void;
  onLogout: () => void;
  onOpenRoulette?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  unreadCount,
  onOpenNotifications,
  onOpenAuth,
  onOpenProfile,
  isAdminView,
  onToggleAdminView,
  onLogout,
  onOpenRoulette,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => {
          if (isAdminView) onToggleAdminView();
        }}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 p-0.5 shadow-sm flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-rose-500" />
            </div>
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-stone-900 leading-tight flex items-center gap-1.5">
              <span>Daily Color Match</span>
              {isAdminView && (
                <span className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </div>
            <div className="text-[11px] text-stone-500 leading-none">
              ระบบแมทสีชุดตามวันเกิด
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Lucky Outfit Roulette Button */}
          {onOpenRoulette && (
            <button
              onClick={onOpenRoulette}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:opacity-95 text-white shadow-xs transition-all cursor-pointer"
              title="หมุนสุ่มชุดแต่งตัว (Outfit Roulette)"
            >
              <Shuffle className="w-3.5 h-3.5 animate-spin-slow" />
              <span className="hidden xs:inline sm:inline">สุ่มชุดแมทช์</span>
            </button>
          )}

          {/* Admin Switch Button */}
          <button
            onClick={onToggleAdminView}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isAdminView
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700 border-stone-200'
            }`}
            title="สลับโหมดหลังบ้าน (Admin Dashboard)"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isAdminView ? 'กลับหน้าผู้ใช้' : 'ระบบ Admin'}</span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-xl hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
            title="การแจ้งเตือน"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile / Login */}
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/70 border border-stone-200 transition-colors cursor-pointer text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-stone-800 leading-tight truncate max-w-[100px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-stone-500 capitalize leading-none">
                    {currentUser.role}
                  </div>
                </div>
              </button>

              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="ออกจากระบบ"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 shadow-xs transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>เข้าสู่ระบบ</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
