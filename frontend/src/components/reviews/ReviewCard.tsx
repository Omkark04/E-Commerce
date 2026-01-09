import { useState } from 'react'
import type { Review } from '@/hooks/useReviews'
import RatingStars from './RatingStars'
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { useVoteReview } from '@/hooks/useReviews'
import { useAuthStore } from '@/store/authStore'

interface ReviewCardProps {
  review: Review
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const { user } = useAuthStore()
  const voteReview = useVoteReview()
  const [hasVoted, setHasVoted] = useState(false)

  const handleVote = (isHelpful: boolean) => {
    if (!user || hasVoted) return
    
    voteReview.mutate({ reviewId: review.id, isHelpful })
    setHasVoted(true)
  }

  return (
    <div className="border-b border-gray-200 py-6 last:border-0">
      {/* Rating and Date */}
      <div className="flex items-center gap-3 mb-2">
        <RatingStars rating={review.rating} size={16} />
        <span className="text-sm text-gray-500">
          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
        </span>
        {review.verified_purchase && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
            Verified Purchase
          </span>
        )}
      </div>

      {/* User Info */}
      <div className="flex items-center gap-2 mb-3">
        {review.user?.avatar_url ? (
          <img
            src={review.user.avatar_url}
            alt={review.user.full_name}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-600">
              {review.user?.full_name?.charAt(0) || 'U'}
            </span>
          </div>
        )}
        <span className="font-semibold text-gray-900">
          {review.user?.full_name || 'Anonymous'}
        </span>
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
      )}

      {/* Comment */}
      {review.comment && (
        <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
      )}

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-3">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review image ${index + 1}`}
              className="w-20 h-20 object-cover rounded border border-gray-200"
            />
          ))}
        </div>
      )}

      {/* Helpful Votes */}
      <div className="flex items-center gap-4 mt-4">
        <span className="text-sm text-gray-600">Was this review helpful?</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVote(true)}
            disabled={!user || hasVoted}
            className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiThumbsUp size={14} />
            <span className="text-sm">Yes</span>
          </button>
          <button
            onClick={() => handleVote(false)}
            disabled={!user || hasVoted}
            className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiThumbsDown size={14} />
            <span className="text-sm">No</span>
          </button>
        </div>
        {review.helpful_count > 0 && (
          <span className="text-sm text-gray-500">
            {review.helpful_count} {review.helpful_count === 1 ? 'person' : 'people'} found this helpful
          </span>
        )}
      </div>
    </div>
  )
}
