import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ThemeState {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    surfaceColor: string;
    fontColor: string;
    borderRadius: string;
    shadowIntensity: string;
    headerFont: string;
    bodyFont: string;
}

const initialState: ThemeState = {
    primaryColor: '#A21C2F', // W15 Red
    secondaryColor: '#C5A059', // W15 Gold
    backgroundColor: '#FAF9F6', // W15 Cream
    surfaceColor: '#1A1A1A', // W15 Charcoal
    fontColor: '#1A1A1A', // Default to Charcoal
    borderRadius: '24px',
    shadowIntensity: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // shadow-md
    headerFont: 'var(--font-playfair)',
    bodyFont: 'var(--font-geist-sans)',
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<Partial<ThemeState>>) => {
            return { ...state, ...action.payload };
        },
        resetTheme: () => initialState,
    },
});

export const { setTheme, resetTheme } = themeSlice.actions;
export default themeSlice.reducer;
