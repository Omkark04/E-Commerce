from rest_framework import generics, status, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Avg, Count
from .models import Review, ReviewVote
from .serializers import (
    ReviewSerializer, ReviewCreateSerializer, ReviewUpdateSerializer,
    ReviewVoteSerializer, ReviewSummarySerializer,
    AdminReviewSerializer, ReviewStatusUpdateSerializer
)


class IsAdminOrShopOwner(permissions.BasePermission):
    """Permission for admin and shop owner access."""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if hasattr(request.user, 'profile'):
            return request.user.profile.role in ['admin', 'shop_owner', 'co_shop_owner']
        return request.user.is_superuser


# Public endpoints

class ProductReviewListView(generics.ListAPIView):
    """List approved reviews for a product."""
    
    permission_classes = (permissions.AllowAny,)
    serializer_class = ReviewSerializer
    
    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        return Review.objects.filter(
            product_id=product_id,
            status='approved'
        ).select_related('user').order_by('-created_at')


class ProductReviewCreateView(generics.CreateAPIView):
    """Create a review for a product."""
    
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ReviewCreateSerializer


class ProductReviewSummaryView(APIView):
    """Get review summary for a product."""
    
    permission_classes = (permissions.AllowAny,)
    
    def get(self, request, product_id):
        reviews = Review.objects.filter(
            product_id=product_id,
            status='approved'
        )
        
        total_reviews = reviews.count()
        
        if total_reviews == 0:
            return Response({
                'average_rating': 0,
                'total_reviews': 0,
                'rating_distribution': {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
            })
        
        # Calculate average rating
        avg_rating = reviews.aggregate(avg=Avg('rating'))['avg'] or 0
        
        # Calculate rating distribution
        distribution = reviews.values('rating').annotate(count=Count('rating'))
        rating_dist = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
        for item in distribution:
            rating_dist[item['rating']] = item['count']
        
        return Response({
            'average_rating': round(avg_rating, 1),
            'total_reviews': total_reviews,
            'rating_distribution': rating_dist
        })


class ReviewUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    """Update or delete own review."""
    
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ReviewUpdateSerializer
        return ReviewSerializer
    
    def get_queryset(self):
        return Review.objects.filter(user=self.request.user)


class ReviewVoteView(APIView):
    """Vote on a review (helpful/not helpful)."""
    
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request, pk):
        try:
            review = Review.objects.get(pk=pk)
            
            if review.user == request.user:
                return Response(
                    {'error': 'You cannot vote on your own review'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer = ReviewVoteSerializer(
                data=request.data,
                context={'request': request, 'review': review}
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            
            return Response({'message': 'Vote recorded'})
        except Review.DoesNotExist:
            return Response(
                {'error': 'Review not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class UserProductReviewView(APIView):
    """Get user's review for a specific product."""
    
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request, product_id):
        try:
            review = Review.objects.get(
                product_id=product_id,
                user=request.user
            )
            return Response(ReviewSerializer(review).data)
        except Review.DoesNotExist:
            return Response(None)


class ReviewShowcaseView(generics.ListAPIView):
    """Get top approved reviews for homepage showcase."""
    
    permission_classes = (permissions.AllowAny,)
    serializer_class = ReviewSerializer
    
    def get_queryset(self):
        # Return top approved reviews with high ratings for showcase
        return Review.objects.filter(
            status='approved',
            rating__gte=4  # Only 4+ star reviews
        ).select_related('user', 'product').order_by('-rating', '-created_at')[:10]


# Admin endpoints

class AdminReviewListView(generics.ListAPIView):
    """Admin: List all reviews."""
    
    permission_classes = (IsAdminOrShopOwner,)
    serializer_class = AdminReviewSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['product__name_en', 'user__email', 'title', 'comment']
    ordering_fields = ['created_at', 'rating']
    
    def get_queryset(self):
        queryset = Review.objects.all().select_related('user', 'product')
        
        # Status filter
        status_filter = self.request.query_params.get('status')
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)
        
        # Rating filter
        rating = self.request.query_params.get('rating')
        if rating:
            queryset = queryset.filter(rating=rating)
        
        return queryset.order_by('-created_at')


class AdminReviewStatusUpdateView(APIView):
    """Admin: Update review status."""
    
    permission_classes = (IsAdminOrShopOwner,)
    
    def put(self, request, pk):
        try:
            review = Review.objects.get(pk=pk)
            serializer = ReviewStatusUpdateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            review.status = serializer.validated_data['status']
            review.save()
            
            return Response(AdminReviewSerializer(review).data)
        except Review.DoesNotExist:
            return Response(
                {'error': 'Review not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class AdminReviewDeleteView(generics.DestroyAPIView):
    """Admin: Delete a review."""
    
    permission_classes = (IsAdminOrShopOwner,)
    queryset = Review.objects.all()
