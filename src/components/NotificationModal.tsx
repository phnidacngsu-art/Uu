import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Sparkles, Check, Trash2, Info } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onDelete,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-xl border border-stone-200 p-6 overflow-hidden max-h-[85vh] flex flex-col"
        >
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">ศูนย์การแจ้งเตือน</h3>
                <p className="text-[11px] text-stone-400">อัปเดตสีมงคลและข่าวสารระบบ</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-stone-400 text-xs">
                ไม่มีการแจ้งเตือนใหม่ในขณะนี้
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    n.isRead
                      ? 'bg-stone-50/70 border-stone-200/80 text-stone-600'
                      : 'bg-white border-rose-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {n.type === 'lucky' ? (
                        <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                          <Sparkles className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                          <Info className="w-4 h-4" />
                        </span>
                      )}
                      <h4 className="text-xs font-bold text-stone-900">{n.title}</h4>
                    </div>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">{n.message}</p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-stone-400 pt-2 border-t border-stone-100">
                    <span>{new Date(n.createdAt).toLocaleDateString('th-TH')}</span>
                    <div className="flex items-center gap-2">
                      {!n.isRead && (
                        <button
                          onClick={() => onMarkRead(n.id)}
                          className="flex items-center gap-1 text-indigo-600 hover:underline cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          อ่านแล้ว
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(n.id)}
                        className="text-stone-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
