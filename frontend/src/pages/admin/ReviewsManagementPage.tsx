import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewsAPI } from '@/lib/api'
import type { Review } from '@/hooks/useReviews'
import RatingStars from '@/components/reviews/RatingStars'
import { FiCheck, FiX, FiTrash2, FiSearch } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'

export default function ReviewsManagementPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch all reviews (admin)
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin-reviews', statusFilter],
    queryFn: async () => {
      const { data } = await reviewsAPI.adminGetAll({ status: statusFilter !== 'all' ? statusFilter : undefined })
      // Handle both paginated { results: [...] } and direct array responses
      const reviewsArray = Array.isArray(data) ? data : (data?.results || [])
      return reviewsArray as (Review & { product: { id: string; name_en: string } })[]
    }
  })

  // Update review status
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      await reviewsAPI.adminUpdateStatus(id, status)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
    }
  })

  // Delete review
  const deleteReview = useMutation({
    mutationFn: async (id: string) => {
      await reviewsAPI.adminDelete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
    }
  })

  const reviewsArray = Array.isArray(reviews) ? reviews : []
  const filteredReviews = reviewsArray.filter(review => {
    if (!searchQuery) return true
    const search = searchQuery.toLowerCase()
    return (
      review.product?.name_en?.toLowerCase().includes(search) ||
      review.user?.full_name?.toLowerCase().includes(search) ||
      review.comment?.toLowerCase().includes(search)
    )
  })

  return (
    <div className="p-6 text-white animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Reviews Management</h1>
          <p className="text-gray-400">Approve, reject, or delete customer reviews</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl font-semibold capitalize transition-all ${
                  statusFilter === status
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/25'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviews..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto" />
        </div>
      ) : filteredReviews && filteredReviews.length > 0 ? (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:border-pink-500/30 transition-all">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <RatingStars rating={review.rating} size={16} />
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      review.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      review.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {review.status}
                    </span>
                    {review.verified_purchase && (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-400">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    <span className="font-semibold text-white">{review.user?.full_name}</span>
                    {' • '}
                    <span>{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Product: <span className="font-semibold text-gray-300">{review.product?.name_en || 'Unknown Product'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {review.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus.mutate({ id: review.id, status: 'approved' })}
                        disabled={updateStatus.isPending}
                        className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <FiCheck size={20} />
                      </button>
                      <button
                        onClick={() => updateStatus.mutate({ id: review.id, status: 'rejected' })}
                        disabled={updateStatus.isPending}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <FiX size={20} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this review?')) {
                        deleteReview.mutate(review.id)
                      }
                    }}
                    disabled={deleteReview.isPending}
                    className="p-2 text-gray-400 hover:bg-white/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 size={20} />
                  </button>
                </div>
              </div>

              {/* Review Content */}
              {review.title && (
                <h4 className="font-semibold text-white mb-2">{review.title}</h4>
              )}
              {review.comment && (
                <p className="text-gray-300 mb-3">{review.comment}</p>
              )}

              {/* Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2">
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Review image ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border border-white/10"
                    />
                  ))}
                </div>
              )}

              {/* Helpful Count */}
              {review.helpful_count > 0 && (
                <div className="mt-3 text-sm text-gray-500">
                  {review.helpful_count} {review.helpful_count === 1 ? 'person' : 'people'} found this helpful
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
          <p className="text-gray-400">No reviews found</p>
        </div>
      )}
    </div>
  )
}
