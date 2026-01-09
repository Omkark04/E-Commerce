import { useState } from 'react'
import { useProductReviews } from '@/hooks/useReviews'
import ReviewCard from './ReviewCard'
import { FiChevronDown } from 'react-icons/fi'

interface ReviewsListProps {
  productId: string
  initialLimit?: number
}

export default function ReviewsList({ productId, initialLimit = 5 }: ReviewsListProps) {
  const [limit, setLimit] = useState(initialLimit)
  const { data: reviews, isLoading } = useProductReviews(productId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse border-b border-gray-200 py-6">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
            <div className="h-20 bg-gray-200 rounded mb-2" />
          </div>
        ))}
      </div>
    )
  }

  if (!reviews || (Array.isArray(reviews) && reviews.length === 0)) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No reviews yet</p>
        <p className="text-sm text-gray-400 mt-1">Be the first to review this product!</p>
      </div>
    )
  }

  // Handle both array and paginated response
  const reviewsArray = Array.isArray(reviews) ? reviews : ((reviews as any)?.results || [])
  const displayedReviews = reviewsArray.slice(0, limit)
  const hasMore = reviewsArray.length > limit

  return (
    <div>
      <div className="space-y-0">
        {displayedReviews.map((review: any) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setLimit(limit + 5)}
          className="mt-6 w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-semibold text-gray-700"
        >
          <span>Load More Reviews</span>
          <FiChevronDown size={20} />
        </button>
      )}
    </div>
  )
}
