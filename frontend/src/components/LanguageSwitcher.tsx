import { Globe } from 'lucide-react'
import { useLanguageStore } from '@/store/languageStore'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguageStore()

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'mr', name: 'मराठी' },
  ]

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 hover:text-primary-600 transition">
        <Globe className="w-5 h-5" />
        <span className="hidden md:inline text-sm">
          {languages.find((lang) => lang.code === language)?.name}
        </span>
      </button>

      <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code as 'en' | 'hi' | 'mr')}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg transition ${
              language === lang.code ? 'bg-primary-50 text-primary-600 font-medium' : ''
            }`}
          >
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  )
}
