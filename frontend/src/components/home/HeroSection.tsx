import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function HeroSection() {
  const { t } = useTranslation()

  return (
    <section className="relative w-full bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900">
      {/* Decorative Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white mb-6 border border-white/20">
            <span className="text-sm font-medium">{t('home.hero.badge')}</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {t('home.hero.titlePart1')}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">
              {t('home.hero.titlePart2')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-purple-100 mb-8 leading-relaxed">
            {t('home.hero.subtitlePart1')} <span className="font-semibold text-yellow-200">{t('home.hero.subtitleHighlight1')}</span> {t('home.hero.subtitlePart2')} <span className="font-semibold text-pink-200">{t('home.hero.subtitleHighlight2')}</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/products?category=paithani-sarees"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-xl font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 text-black"
            >
              {t('home.hero.shopSarees')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/products?category=ladies-kurtis"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-all border-2 border-white/30 hover:border-white/50"
            >
              {t('home.hero.exploreKurtis')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap gap-8 text-purple-100">
            <div>
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-sm">{t('home.hero.stats.authentic')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-sm">{t('home.hero.stats.happyCustomers')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-sm">{t('home.hero.stats.support')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" className="text-white" />
        </svg>
      </div>
    </section>
  )
}
