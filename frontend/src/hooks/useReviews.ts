import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewsAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

export interface Review {
  id: string
  product_id: string
  user_id: string
  order_id?: string
  rating: number
  title?: string
  comment?: string
  images?: string[]
  verified_purchase: boolean
  helpful_count: number
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  user?: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

export interface CreateReviewData {
  product_id: string
  rating: number
  title?: string
  comment?: string
  images?: string[]
}

// Fetch reviews for a product
export function useProductReviews(productId: string, status: 'approved' | 'all' = 'approved') {
  return useQuery({
    queryKey: ['reviews', productId, status],
    queryFn: async () => {
      // NOTE: status filter is not yet supported in basic API, assuming approved by default or handled by backend
      const { data } = await reviewsAPI.getForProduct(productId)
      return data as Review[]
    },
    enabled: !!productId
  })
}

// Fetch user's review for a product
export function useUserProductReview(productId: string, userId?: string) {
  return useQuery({
    queryKey: ['user-review', productId, userId],
    queryFn: async () => {
      // NOTE: No direct API for this yet, might need to filter from all reviews or add endpoint
      // For now returning null to avoid error
      return null 
    },
    enabled: !!productId && !!userId
  })
}

// Create a review
export function useCreateReview() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (reviewData: CreateReviewData) => {
      if (!user) throw new Error('User not authenticated')
      const { data } = await reviewsAPI.create(reviewData.product_id, reviewData)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.product_id] })
      queryClient.invalidateQueries({ queryKey: ['products', variables.product_id] })
    }
  })
}

// Update a review
export function useUpdateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Review> & { id: string }) => {
      const { data } = await reviewsAPI.updateOwn(id, updates)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    }
  })
}

// Delete a review
export function useDeleteReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reviewId: string) => {
      await reviewsAPI.deleteOwn(reviewId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    }
  })
}

// Vote on a review (helpful/not helpful)
export function useVoteReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ reviewId, isHelpful }: { reviewId: string; isHelpful: boolean }) => {
      const { data } = await reviewsAPI.vote(reviewId, { is_helpful: isHelpful })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    }
  })
}

// Get review summary for a product
export function useReviewSummary(productId: string) {
  return useQuery({
    queryKey: ['review-summary', productId],
    queryFn: async () => {
      const { data } = await reviewsAPI.getSummary(productId)
      return data
    },
    enabled: !!productId
  })
}

