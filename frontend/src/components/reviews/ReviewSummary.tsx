import { useReviewSummary } from '@/hooks/useReviews'
import RatingStars from './RatingStars'
import { FaStar } from 'react-icons/fa'

interface ReviewSummaryProps {
  productId: string
}

export default function ReviewSummary({ productId }: ReviewSummaryProps) {
  const { data: summary, isLoading } = useReviewSummary(productId)

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-24" />
      </div>
    )
  }

  if (!summary || summary.totalReviews === 0) {
    return (
      <div className="text-gray-500 text-sm">
        No reviews yet. Be the first to review!
      </div>
    )
  }

  const { averageRating, totalReviews, ratingDistribution } = summary

  return (
    <div className="space-y-4">
      {/* Overall Rating */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900">{averageRating}</div>
          <RatingStars rating={averageRating} size={20} />
          <div className="text-sm text-gray-600 mt-1">
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution?.[rating as keyof typeof ratingDistribution] || 0
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0

            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-8">{rating}</span>
                <FaStar className="text-yellow-400" size={12} />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
