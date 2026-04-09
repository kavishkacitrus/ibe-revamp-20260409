import { useAppSelector } from '@/store/hooks';
import { selectSelectedLanguage } from '@/store/slices/languageSlice';
import { useTranslation as useTranslationLib } from '@/lib/translations';

export const useTranslation = () => {
  const selectedLanguage = useAppSelector(selectSelectedLanguage);
  const { t, language, availableLanguages } = useTranslationLib(selectedLanguage);
  
  return {
    t,
    language,
    availableLanguages,
    currentLanguage: selectedLanguage
  };
};
