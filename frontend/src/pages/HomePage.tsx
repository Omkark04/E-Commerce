import HeroSection from '@/components/home/HeroSection'
import PromoBanner from '@/components/home/PromoBanner'
import CategoryGrid from '@/components/home/CategoryGrid'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import ContactSection from '@/components/home/ContactSection'
import ReviewsShowcase from '@/components/home/ReviewsShowcase'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Full Width */}
      <HeroSection />

      {/* Promotional Banner */}
      <div className="container mx-auto px-4">
        <PromoBanner />
      </div>

      {/* Category Grid */}
      <div className="container mx-auto px-4">
        <CategoryGrid />
      </div>

      {/* Featured Products */}
      <div className="container mx-auto px-4">
        <FeaturedProducts />
      </div>

      {/* Contact Section */}
      <div className="container mx-auto px-4">
        <ContactSection />
      </div>

      {/* Customer Reviews */}
      <div className="container mx-auto px-4 pb-16">
        <ReviewsShowcase />
      </div>
    </div>
  )
}
