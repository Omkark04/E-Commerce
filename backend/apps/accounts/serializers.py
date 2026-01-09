from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Profile, Wishlist

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user model."""
    
    class Meta:
        model = User
        fields = ('id', 'email', 'full_name', 'date_joined')
        read_only_fields = ('id', 'email', 'date_joined')


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile."""
    
    user = UserSerializer(read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = Profile
        fields = (
            'id', 'user', 'email', 'full_name', 'phone', 'role', 'language_preference', 
            'avatar_url', 'loyalty_points', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'role', 'loyalty_points', 'created_at', 'updated_at')


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""
    
    full_name = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Profile
        fields = ('full_name', 'phone', 'language_preference', 'avatar_url')
    
    def update(self, instance, validated_data):
        full_name = validated_data.pop('full_name', None)
        if full_name:
            instance.user.full_name = full_name
            instance.user.save()
        return super().update(instance, validated_data)


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ('email', 'full_name', 'password', 'password2', 'phone')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        phone = validated_data.pop('phone', None)
        validated_data.pop('password2')
        
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data.get('full_name', '')
        )
        
        # Update profile with phone if provided
        if phone:
            user.profile.phone = phone
            user.profile.save()
        
        return user


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change."""
    
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request."""
    
    email = serializers.EmailField(required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation."""
    
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])


class WishlistSerializer(serializers.ModelSerializer):
    """Serializer for wishlist items."""
    
    from apps.products.serializers import ProductListSerializer
    product = ProductListSerializer(read_only=True)
    product_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = Wishlist
        fields = ('id', 'product', 'product_id', 'created_at')
        read_only_fields = ('id', 'created_at')
    
    def create(self, validated_data):
        from apps.products.models import Product
        
        user = self.context['request'].user
        product_id = validated_data.pop('product_id')
        product = Product.objects.get(id=product_id)
        
        wishlist_item, created = Wishlist.objects.get_or_create(
            user=user,
            product=product
        )
        return wishlist_item
