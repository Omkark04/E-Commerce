from rest_framework import serializers
from django.utils import timezone
from .models import Coupon, CouponUsage, FlashSale, Notification, DeliveryAssignment, Referral


class CouponSerializer(serializers.ModelSerializer):
    """Serializer for coupons."""
    
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = Coupon
        fields = (
            'id', 'code', 'discount_type', 'discount_value',
            'min_order_value', 'max_discount', 'usage_limit', 'used_count',
            'valid_from', 'valid_until', 'is_active', 'is_valid', 'created_at'
        )
        read_only_fields = ('id', 'used_count', 'created_at')
    
    def get_is_valid(self, obj):
        return obj.is_valid()


class CouponValidateSerializer(serializers.Serializer):
    """Serializer for validating a coupon code."""
    
    code = serializers.CharField()
    order_total = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    
    def validate_code(self, value):
        try:
            coupon = Coupon.objects.get(code=value.upper())
        except Coupon.DoesNotExist:
            raise serializers.ValidationError("Invalid coupon code.")
        
        if not coupon.is_valid():
            raise serializers.ValidationError("This coupon is no longer valid.")
        
        return value


class FlashSaleSerializer(serializers.ModelSerializer):
    """Serializer for flash sales."""
    
    is_live = serializers.SerializerMethodField()
    
    class Meta:
        model = FlashSale
        fields = (
            'id', 'name_en', 'name_hi', 'name_mr', 'product_ids',
            'discount_percentage', 'start_time', 'end_time', 
            'is_active', 'is_live', 'created_at'
        )
        read_only_fields = ('id', 'created_at')
    
    def get_is_live(self, obj):
        return obj.is_live()


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications."""
    
    class Meta:
        model = Notification
        fields = (
            'id', 'title', 'message', 'type', 'is_read', 
            'action_url', 'created_at'
        )
        read_only_fields = ('id', 'title', 'message', 'type', 'action_url', 'created_at')


class NotificationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating notifications (admin)."""
    
    user_id = serializers.IntegerField()
    
    class Meta:
        model = Notification
        fields = ('user_id', 'title', 'message', 'type', 'action_url')
    
    def create(self, validated_data):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        user_id = validated_data.pop('user_id')
        user = User.objects.get(id=user_id)
        
        return Notification.objects.create(user=user, **validated_data)


class DeliveryAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for delivery assignments."""
    
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    delivery_partner_name = serializers.CharField(source='delivery_partner.full_name', read_only=True)
    
    class Meta:
        model = DeliveryAssignment
        fields = (
            'id', 'order', 'order_number', 'delivery_partner', 'delivery_partner_name',
            'status', 'assigned_at', 'picked_up_at', 'delivered_at',
            'proof_of_delivery_url', 'earnings'
        )
        read_only_fields = ('id', 'assigned_at')


class ReferralSerializer(serializers.ModelSerializer):
    """Serializer for referrals."""
    
    referrer_email = serializers.EmailField(source='referrer.email', read_only=True)
    referred_email = serializers.EmailField(source='referred.email', read_only=True)
    
    class Meta:
        model = Referral
        fields = (
            'id', 'referrer', 'referrer_email', 'referred', 'referred_email',
            'referral_code', 'reward_points', 'status', 'created_at'
        )
        read_only_fields = ('id', 'created_at')


class DeliveryPartnerSerializer(serializers.Serializer):
    """Serializer for delivery partner list."""
    
    id = serializers.IntegerField()
    full_name = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.SerializerMethodField()
    
    def get_phone(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.phone
        return None


class BulkDiscountSerializer(serializers.Serializer):
    """Serializer for applying bulk discounts."""
    
    discount_percentage = serializers.IntegerField(min_value=0, max_value=100)
    category_id = serializers.UUIDField(required=False, allow_null=True)
    min_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    max_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    search_text = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    
    def create(self, validated_data):
        from apps.products.models import Product
        
        discount = validated_data['discount_percentage']
        queryset = Product.objects.all()
        
        if validated_data.get('category_id'):
            queryset = queryset.filter(category_id=validated_data['category_id'])
        
        if validated_data.get('min_price'):
            queryset = queryset.filter(base_price__gte=validated_data['min_price'])
        
        if validated_data.get('max_price'):
            queryset = queryset.filter(base_price__lte=validated_data['max_price'])
        
        if validated_data.get('search_text'):
            queryset = queryset.filter(name_en__icontains=validated_data['search_text'])
        
        updated_count = queryset.update(discount_percentage=discount)
        return {'updated_count': updated_count}
