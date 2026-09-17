import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { BottomNav, TabKey } from './components/BottomNav';
import { WelcomeModal } from './components/WelcomeModal';
import { AuthModal } from './components/AuthModal';
import { NotificationModal } from './components/NotificationModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { HomeView } from './views/HomeView';
import { MatchView } from './views/MatchView';
import { SavedView } from './views/SavedView';
import { HistoryView } from './views/HistoryView';
import { ProfileView } from './views/ProfileView';
import { AdminView } from './views/AdminView';
import { api } from './services/api';
import { NotificationItem, OutfitCombination, UserProfile } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() =>
    api.getStoredUser()
  );
  const [currentTab, setCurrentTab] = useState<TabKey>('home');
  const [isAdminView, setIsAdminView] = useState(false);

  // Modals & Popups
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Data state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [savedOutfitIds, setSavedOutfitIds] = useState<Set<string>>(new Set());
  const [matchInitialDate, setMatchInitialDate] = useState<string | undefined>(undefined);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial App Mount
  useEffect(() => {
    // 1. Check user token
    const token = api.getToken();
    if (token) {
      api
        .getCurrentUser()
        .then((u) => setCurrentUser(u))
        .catch(() => {
          // invalid token
          api.logout();
          setCurrentUser(null);
        });
    }

    // 2. Check welcome modal flag
    const hasSeenWelcome = localStorage.getItem('daily_color_seen_welcome');
    if (!hasSeenWelcome) {
      setIsWelcomeModalOpen(true);
      localStorage.setItem('daily_color_seen_welcome', 'true');
    }

    // 3. Load notifications & saved outfit IDs
    loadNotifications();
    loadSavedOutfits();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
    } catch (e) {
      // fallback
    }
  };

  const loadSavedOutfits = async () => {
    try {
      const res = await api.getSavedOutfits(currentUser?.id);
      const ids = new Set(res.savedOutfits.map((s) => s.combination.id));
      setSavedOutfitIds(ids);
    } catch (e) {
      // fallback
    }
  };

  const handleSaveOutfit = async (combination: OutfitCombination) => {
    try {
      await api.saveOutfit({
        userId: currentUser?.id,
        title: `ชุดสีมงคล ${combination.harmonyType}`,
        targetDate: new Date().toISOString().split('T')[0],
        occasion: 'วันสบาย ๆ',
        style: currentUser?.preferredStyle || 'Minimal',
        combination,
      });
      setSavedOutfitIds((prev) => new Set([...prev, combination.id]));
      showToast('บันทึกชุดลงในรายการเรียบร้อยแล้ว ✓', 'success');
    } catch (err: any) {
      showToast(err.message || 'ไม่สามารถบันทึกได้', 'error');
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    if (isAdminView) setIsAdminView(false);
    showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      // ignore
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await api.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      // ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const navigateToMatch = (targetDate?: string) => {
    setMatchInitialDate(targetDate);
    setCurrentTab('match');
  };

  return (
    <div className="min-h-screen bg-stone-50/70 text-stone-900 flex flex-col font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Toast Overlay */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Main Header */}
      <Header
        currentUser={currentUser}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => {
          setIsAdminView(false);
          setCurrentTab('profile');
        }}
        isAdminView={isAdminView}
        onToggleAdminView={() => setIsAdminView(!isAdminView)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-6 pb-24 sm:pb-16">
        {isAdminView ? (
          <AdminView
            onShowToast={showToast}
            onExitAdmin={() => setIsAdminView(false)}
          />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {currentTab === 'home' && (
                <HomeView
                  currentUser={currentUser}
                  onNavigateToMatch={navigateToMatch}
                  onOpenAuth={() => setIsAuthModalOpen(true)}
                  onSaveOutfit={handleSaveOutfit}
                  savedOutfitIds={savedOutfitIds}
                  onShowToast={showToast}
                />
              )}
              {currentTab === 'match' && (
                <MatchView
                  currentUser={currentUser}
                  initialTargetDate={matchInitialDate}
                  onSaveOutfit={handleSaveOutfit}
                  savedOutfitIds={savedOutfitIds}
                  onShowToast={showToast}
                />
              )}
              {currentTab === 'saved' && (
                <SavedView
                  currentUser={currentUser}
                  onNavigateToMatch={() => setCurrentTab('match')}
                  onShowToast={showToast}
                />
              )}
              {currentTab === 'history' && (
                <HistoryView
                  currentUser={currentUser}
                  onNavigateToMatch={navigateToMatch}
                />
              )}
              {currentTab === 'profile' && (
                <ProfileView
                  currentUser={currentUser}
                  onUpdateUser={(u) => {
                    setCurrentUser(u);
                    api.setStoredUser(u);
                  }}
                  onLogout={handleLogout}
                  onOpenAuth={() => setIsAuthModalOpen(true)}
                  onShowToast={showToast}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Bottom Navigation for Mobile */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(t) => setCurrentTab(t)}
        isAdminView={isAdminView}
        onToggleAdminView={() => setIsAdminView(!isAdminView)}
      />

      {/* Modals */}
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
        onStartMatching={() => {
          setIsWelcomeModalOpen(false);
          setCurrentTab('match');
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(u) => {
          setCurrentUser(u);
          showToast(`ยินดีต้อนรับคุณ ${u.name} ✨`, 'success');
          loadSavedOutfits();
        }}
      />

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onDelete={handleDeleteNotification}
      />
    </div>
  );
}
