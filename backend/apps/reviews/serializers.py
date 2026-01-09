from rest_framework import serializers
from django.db.models import Avg, Count
from .models import Review, ReviewVote
from apps.accounts.serializers import UserSerializer


class ReviewUserSerializer(serializers.Serializer):
    """Minimal user info for reviews."""
    
    id = serializers.IntegerField()
    full_name = serializers.CharField()
    avatar_url = serializers.SerializerMethodField()
    
    def get_avatar_url(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.avatar_url
        return None


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for reviews."""
    
    user = ReviewUserSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = (
            'id', 'product_id', 'user', 'rating', 'title', 'comment',
            'images', 'is_verified_purchase', 'helpful_count', 'status',
            'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'user', 'is_verified_purchase', 'helpful_count', 
            'status', 'created_at', 'updated_at'
        )


class ReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reviews."""
    
    product_id = serializers.UUIDField()
    
    class Meta:
        model = Review
        fields = ('product_id', 'rating', 'title', 'comment', 'images')
    
    def create(self, validated_data):
        from apps.products.models import Product
        
        user = self.context['request'].user
        product_id = validated_data.pop('product_id')
        product = Product.objects.get(id=product_id)
        
        # Check if user has already reviewed this product
        existing = Review.objects.filter(user=user, product=product).first()
        if existing:
            raise serializers.ValidationError("You have already reviewed this product.")
        
        # Check if user has purchased this product (for verified purchase)
        from apps.orders.models import OrderItem
        is_verified = OrderItem.objects.filter(
            order__user=user,
            product=product,
            order__status='delivered'
        ).exists()
        
        review = Review.objects.create(
            product=product,
            user=user,
            is_verified_purchase=is_verified,
            **validated_data
        )
        return review


class ReviewUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating reviews."""
    
    class Meta:
        model = Review
        fields = ('rating', 'title', 'comment', 'images')


class ReviewVoteSerializer(serializers.Serializer):
    """Serializer for voting on reviews."""
    
    is_helpful = serializers.BooleanField()
    
    def create(self, validated_data):
        user = self.context['request'].user
        review = self.context['review']
        
        vote, created = ReviewVote.objects.update_or_create(
            review=review,
            user=user,
            defaults={'is_helpful': validated_data['is_helpful']}
        )
        
        # Update helpful count on review
        review.helpful_count = ReviewVote.objects.filter(
            review=review, 
            is_helpful=True
        ).count()
        review.save()
        
        return vote


class ReviewSummarySerializer(serializers.Serializer):
    """Serializer for review summary statistics."""
    
    average_rating = serializers.FloatField()
    total_reviews = serializers.IntegerField()
    rating_distribution = serializers.DictField()


# Admin serializers

class AdminReviewSerializer(serializers.ModelSerializer):
    """Admin serializer for reviews."""
    
    user = ReviewUserSerializer(read_only=True)
    product_name = serializers.CharField(source='product.name_en', read_only=True)
    
    class Meta:
        model = Review
        fields = (
            'id', 'product_id', 'product_name', 'user', 'rating', 
            'title', 'comment', 'images', 'is_verified_purchase', 
            'helpful_count', 'status', 'created_at'
        )


class ReviewStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating review status."""
    
    status = serializers.ChoiceField(choices=['pending', 'approved', 'rejected'])
