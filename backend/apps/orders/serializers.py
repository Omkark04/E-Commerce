from rest_framework import serializers
from .models import CartItem, Address, Order, OrderItem, OrderTracking, RecentlyViewed
from apps.products.serializers import ProductListSerializer, ProductVariantSerializer


class CartItemSerializer(serializers.ModelSerializer):
    """Serializer for cart items."""
    
    product = ProductListSerializer(read_only=True)
    variant = ProductVariantSerializer(read_only=True)
    product_id = serializers.UUIDField(write_only=True)
    variant_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = CartItem
        fields = (
            'id', 'product', 'variant', 'product_id', 'variant_id',
            'quantity', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        from apps.products.models import Product, ProductVariant
        
        user = self.context['request'].user
        product_id = validated_data.pop('product_id')
        variant_id = validated_data.pop('variant_id')
        
        product = Product.objects.get(id=product_id)
        variant = ProductVariant.objects.get(id=variant_id)
        
        # Use update_or_create to handle upsert
        cart_item, created = CartItem.objects.update_or_create(
            user=user,
            product=product,
            variant=variant,
            defaults={'quantity': validated_data.get('quantity', 1)}
        )
        return cart_item


class CartItemUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating cart item quantity."""
    
    class Meta:
        model = CartItem
        fields = ('quantity',)


class AddressSerializer(serializers.ModelSerializer):
    """Serializer for addresses."""
    
    class Meta:
        model = Address
        fields = (
            'id', 'full_name', 'phone', 'address_line1', 'address_line2',
            'city', 'state', 'pincode', 'is_default', 'address_type', 'created_at'
        )
        read_only_fields = ('id', 'created_at')
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items."""
    
    product = ProductListSerializer(read_only=True)
    variant = ProductVariantSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = (
            'id', 'product', 'variant', 'quantity',
            'price_at_purchase', 'discount_applied', 'created_at'
        )


class OrderTrackingSerializer(serializers.ModelSerializer):
    """Serializer for order tracking history."""
    
    class Meta:
        model = OrderTracking
        fields = ('id', 'status', 'location', 'notes', 'created_at')


class OrderListSerializer(serializers.ModelSerializer):
    """Serializer for order list view."""
    
    items_count = serializers.SerializerMethodField()
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = (
            'id', 'order_number', 'status', 'payment_method', 'payment_status',
            'final_amount', 'items_count', 'items', 'created_at'
        )
    
    def get_items_count(self, obj):
        return obj.items.count()


class OrderDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for order view."""
    
    items = OrderItemSerializer(many=True, read_only=True)
    shipping_address = AddressSerializer(read_only=True)
    tracking_history = OrderTrackingSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = (
            'id', 'order_number', 'user_id',
            'total_amount', 'discount_amount', 'subtotal',
            'delivery_charges', 'tax', 'final_amount',
            'status', 'payment_method', 'payment_status', 'payment_id',
            'shipping_address', 'tracking_number', 'estimated_delivery', 'delivered_at',
            'items', 'tracking_history', 'created_at', 'updated_at'
        )


class OrderCreateSerializer(serializers.Serializer):
    """Serializer for creating orders."""
    
    shipping_address_id = serializers.UUIDField()
    payment_method = serializers.ChoiceField(choices=['cod', 'online'])
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2)
    delivery_charges = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    final_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    def create(self, validated_data):
        import time
        import random
        import string
        from apps.products.models import Product, ProductVariant
        
        user = self.context['request'].user
        shipping_address_id = validated_data['shipping_address_id']
        
        # Get shipping address
        address = Address.objects.get(id=shipping_address_id, user=user)
        
        # Generate order number
        order_number = f"ORD-{int(time.time())}-{''.join(random.choices(string.ascii_uppercase + string.digits, k=9))}"
        
        # Create order
        order = Order.objects.create(
            user=user,
            order_number=order_number,
            shipping_address=address,
            payment_method=validated_data['payment_method'],
            total_amount=validated_data['subtotal'],
            subtotal=validated_data['subtotal'],
            delivery_charges=validated_data['delivery_charges'],
            tax=validated_data['tax'],
            final_amount=validated_data['final_amount'],
            status='pending',
            payment_status='pending'
        )
        
        # Create order items from cart
        cart_items = CartItem.objects.filter(user=user).select_related('product', 'variant')
        
        for cart_item in cart_items:
            base_price = float(cart_item.product.base_price) + float(cart_item.variant.additional_price)
            discount_percentage = float(cart_item.product.discount_percentage)
            discount_amount = base_price * (discount_percentage / 100)
            
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                variant=cart_item.variant,
                quantity=cart_item.quantity,
                price_at_purchase=base_price,
                discount_applied=discount_amount
            )
        
        # Clear cart
        cart_items.delete()
        
        return order


# Admin serializers

class AdminOrderListSerializer(serializers.ModelSerializer):
    """Admin serializer for order list."""
    
    items = OrderItemSerializer(many=True, read_only=True)
    shipping_address = AddressSerializer(read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = Order
        fields = (
            'id', 'order_number', 'user_id', 'user_email', 'user_name',
            'status', 'payment_method', 'payment_status', 'final_amount',
            'shipping_address', 'items', 'delivery_partner_id',
            'tracking_number', 'estimated_delivery', 'created_at'
        )


class OrderStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating order status."""
    
    status = serializers.ChoiceField(choices=[
        'pending', 'confirmed', 'packed', 'shipped', 
        'out_for_delivery', 'delivered', 'cancelled', 'returned'
    ])
    estimated_delivery = serializers.DateTimeField(required=False, allow_null=True)


class OrderDeliveryPartnerSerializer(serializers.Serializer):
    """Serializer for assigning delivery partner."""
    
    delivery_partner_id = serializers.IntegerField(allow_null=True)


class OrderTrackingUpdateSerializer(serializers.Serializer):
    """Serializer for updating tracking number."""
    
    tracking_number = serializers.CharField(max_length=100)


class RecentlyViewedSerializer(serializers.ModelSerializer):
    """Serializer for recently viewed products."""
    
    product = ProductListSerializer(read_only=True)
    
    class Meta:
        model = RecentlyViewed
        fields = ('id', 'product', 'viewed_at')
