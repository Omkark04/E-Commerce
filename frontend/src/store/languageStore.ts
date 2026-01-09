import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '@/lib/i18n'

type Language = 'en' | 'hi' | 'mr'

interface LanguageState {
  language: Language
  setLanguage: (lang: Language) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => {
        i18n.changeLanguage(language)
        localStorage.setItem('language', language)
        set({ language })
      },
    }),
    {
      name: 'language-storage',
    }
  )
)
