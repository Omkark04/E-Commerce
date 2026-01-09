import { useState, useEffect } from 'react'
import { useLanguageStore } from '@/store/languageStore'
import { reviewsAPI } from '@/lib/api'
import RatingStars from '@/components/reviews/RatingStars'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const translations = {
  en: {
    title: 'What Our Customers Say',
    subtitle: 'Real reviews from real customers',
    verifiedPurchase: 'Verified Purchase',
    noReviews: 'No reviews yet',
    loading: 'Loading reviews...'
  },
  hi: {
    title: 'हमारे ग्राहक क्या कहते हैं',
    subtitle: 'वास्तविक ग्राहकों की वास्तविक समीक्षाएं',
    verifiedPurchase: 'सत्यापित खरीद',
    noReviews: 'अभी तक कोई समीक्षा नहीं',
    loading: 'समीक्षाएं लोड हो रही हैं...'
  },
  mr: {
    title: 'आमचे ग्राहक काय म्हणतात',
    subtitle: 'वास्तविक ग्राहकांकडून वास्तविक पुनरावलोकने',
    verifiedPurchase: 'सत्यापित खरेदी',
    noReviews: 'अद्याप कोणतीही पुनरावलोकने नाहीत',
    loading: 'पुनरावलोकने लोड होत आहेत...'
  }
}

interface Review {
  id: string
  rating: number
  title: string
  comment: string
  verified_purchase: boolean
  created_at: string
  user: {
    full_name: string
  }
  product: {
    name_en: string
    name_hi: string
    name_mr: string
  }
}

export default function ReviewsShowcase() {
  const { language } = useLanguageStore()
  const t = translations[language]
  const [reviews, setReviews] = useState<Review[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const { data } = await reviewsAPI.getShowcase()
      // Handle both paginated { results: [...] } and direct array responses
      const reviewsData = Array.isArray(data) ? data : (data?.results || [])
      setReviews(reviewsData)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setReviews([])
    } finally {
      setIsLoading(false)
    }
  }

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length)
  }

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
  }

  const getProductName = (product: Review['product']) => {
    if (!product) return ''
    if (language === 'hi') return product.name_hi || product.name_en
    if (language === 'mr') return product.name_mr || product.name_en
    return product.name_en
  }

  if (isLoading) {
    return (
      <section className="my-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 md:p-12">
        <div className="text-center">
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </section>
    )
  }

  if (reviews.length === 0) {
    return (
      <section className="my-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 md:p-12">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{t.title}</h2>
          <p className="text-gray-600">{t.noReviews}</p>
        </div>
      </section>
    )
  }

  const currentReview = reviews[currentIndex]
  
  // Additional safety check
  if (!currentReview) {
    return null
  }

  return (
    <section className="my-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 md:p-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          {t.title}
        </h2>
        <p className="text-gray-600 text-lg">{t.subtitle}</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl relative">
          {/* Navigation Buttons */}
          {reviews.length > 1 && (
            <>
              <button
                onClick={prevReview}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label="Previous review"
              >
                <FiChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={nextReview}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label="Next review"
              >
                <FiChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </>
          )}

          {/* Review Content */}
          <div className="text-center mb-6">
            <RatingStars rating={currentReview.rating} size={24} />
          </div>

          {currentReview.title && (
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              {currentReview.title}
            </h3>
          )}

          <p className="text-gray-700 text-lg leading-relaxed mb-6 text-center italic">
            "{currentReview.comment}"
          </p>

          <div className="flex flex-col items-center gap-2">
            <p className="font-semibold text-gray-900">
              {currentReview.user.full_name}
            </p>
            <p className="text-sm text-gray-600">
              {getProductName(currentReview.product)}
            </p>
            {currentReview.verified_purchase && (
              <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                {t.verifiedPurchase}
              </span>
            )}
          </div>

          {/* Pagination Dots */}
          {reviews.length > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-purple-600 w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to review ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
