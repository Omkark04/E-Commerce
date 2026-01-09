import { useState } from 'react'
import { useCreateReview, type CreateReviewData } from '@/hooks/useReviews'
import RatingStars from './RatingStars'
import { FiX } from 'react-icons/fi'

interface ReviewFormProps {
  productId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ReviewForm({ productId, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createReview = useCreateReview()

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (rating === 0) {
      newErrors.rating = 'Please select a rating'
    }
    if (comment.trim().length < 10) {
      newErrors.comment = 'Review must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const reviewData: CreateReviewData = {
      product_id: productId,
      rating,
      title: title.trim() || undefined,
      comment: comment.trim()
    }

    try {
      await createReview.mutateAsync(reviewData)
      
      // Reset form
      setRating(0)
      setTitle('')
      setComment('')
      setErrors({})

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Failed to submit review:', error)
      setErrors({ submit: 'Failed to submit review. Please try again.' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={24} />
          </button>
        )}
      </div>

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Your Rating *
        </label>
        <RatingStars
          rating={rating}
          size={32}
          interactive
          onRatingChange={setRating}
        />
        {errors.rating && (
          <p className="text-sm text-red-600 mt-1">{errors.rating}</p>
        )}
      </div>

      {/* Title */}
      <div className="mb-6">
        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
          Review Title (Optional)
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sum up your experience"
          maxLength={200}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label htmlFor="comment" className="block text-sm font-semibold text-gray-700 mb-2">
          Your Review *
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
        />
        <div className="flex items-center justify-between mt-1">
          {errors.comment && (
            <p className="text-sm text-red-600">{errors.comment}</p>
          )}
          <p className="text-sm text-gray-500 ml-auto">{comment.length} characters</p>
        </div>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={createReview.isPending}
          className="flex-1 bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {createReview.isPending ? 'Submitting...' : 'Submit Review'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
