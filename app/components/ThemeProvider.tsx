'use client';

import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setTheme } from '@/store/slices/themeSlice';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const theme = useAppSelector((state) => state.theme);
    const dispatch = useAppDispatch();

    // Load theme from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('hotel-theme-settings');
        if (savedTheme) {
            try {
                const parsedTheme = JSON.parse(savedTheme);
                dispatch(setTheme(parsedTheme));
            } catch (e) {
                console.error('Failed to parse saved theme', e);
            }
        }
    }, [dispatch]);

    // Apply theme to CSS variables and save to localStorage
    useEffect(() => {
        const root = document.documentElement;

        root.style.setProperty('--brand-red', theme.primaryColor);
        root.style.setProperty('--brand-gold', theme.secondaryColor);
        root.style.setProperty('--brand-cream', theme.backgroundColor);
        root.style.setProperty('--brand-charcoal', theme.surfaceColor);
        root.style.setProperty('--brand-text', theme.fontColor);
        root.style.setProperty('--brand-radius', theme.borderRadius);
        root.style.setProperty('--brand-shadow', theme.shadowIntensity);
        root.style.setProperty('--brand-font-serif', theme.headerFont);
        root.style.setProperty('--brand-font-sans', theme.bodyFont);

        localStorage.setItem('hotel-theme-settings', JSON.stringify(theme));

    }, [theme]);

    return <>{children}</>;
};
