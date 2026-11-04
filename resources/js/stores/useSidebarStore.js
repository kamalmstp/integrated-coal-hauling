import { create } from 'zustand';

export const useSidebarStore = create((set) => ({
    isCollapsed: false,
    isMobileOpen: false,

    toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    setCollapsed: (val) => set({ isCollapsed: val }),
    toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
    closeMobile: () => set({ isMobileOpen: false }),
}));
