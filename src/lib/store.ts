import { create } from 'zustand';
import type { Alert } from '@/types/database';

interface AppState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  markAlertRead: (id: string) => void;

  unreadAlertCount: number;
}

export const useAppStore = create<AppState>((set, get) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  alerts: [],
  setAlerts: (alerts) =>
    set({ alerts, unreadAlertCount: alerts.filter((a) => !a.is_read).length }),
  addAlert: (alert) =>
    set((s) => ({
      alerts: [alert, ...s.alerts],
      unreadAlertCount: s.unreadAlertCount + (alert.is_read ? 0 : 1),
    })),
  markAlertRead: (id) =>
    set((s) => ({
      alerts: s.alerts.map((a) => (a.id === id ? { ...a, is_read: true } : a)),
      unreadAlertCount: Math.max(0, s.unreadAlertCount - 1),
    })),

  unreadAlertCount: 0,
}));
