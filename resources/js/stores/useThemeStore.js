import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
    persist(
        (set, get) => ({
            theme: 'light', // 'light' | 'dark'

            setTheme: (newTheme) => {
                set({ theme: newTheme });
                get().applyThemeToDom(newTheme);
            },

            toggleTheme: () => {
                const current = get().theme;
                const nextTheme = current === 'dark' ? 'light' : 'dark';
                set({ theme: nextTheme });
                get().applyThemeToDom(nextTheme);
            },

            applyThemeToDom: (targetTheme) => {
                if (typeof window === 'undefined') return;
                const root = document.documentElement;
                if (targetTheme === 'dark') {
                    root.classList.add('dark');
                } else {
                    root.classList.remove('dark');
                }
            },

            initTheme: () => {
                if (typeof window === 'undefined') return;
                const currentTheme = get().theme;
                get().applyThemeToDom(currentTheme);
            },
        }),
        {
            name: 'theme-storage',
        }
    )
);
