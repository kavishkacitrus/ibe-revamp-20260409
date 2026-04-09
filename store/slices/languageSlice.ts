import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Language {
    code: string;
    name: string;
    nativeName: string;
    flag: string;
}

interface LanguageState {
    selectedLanguage: string;
    languages: Language[];
}

const initialState: LanguageState = {
    selectedLanguage: 'en',
    languages: [
        { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
        { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
        { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
        { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
        { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
        { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
        { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
        { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
        { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
        { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
        { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
        { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
        { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
        { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
        { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
        { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
        { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
        { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
        { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
        { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' }
    ]
};

const languageSlice = createSlice({
    name: 'language',
    initialState,
    reducers: {
        setSelectedLanguage: (state, action: PayloadAction<string>) => {
            state.selectedLanguage = action.payload;
        },
    },
});

export const { setSelectedLanguage } = languageSlice.actions;

// Selectors
export const selectSelectedLanguage = (state: { language: LanguageState }) => 
    state.language.selectedLanguage;

export const selectLanguages = (state: { language: LanguageState }) => 
    state.language.languages;

export const selectCurrentLanguage = (state: { language: LanguageState }) => 
    state.language.languages.find(lang => lang.code === state.language.selectedLanguage);

export default languageSlice.reducer;
