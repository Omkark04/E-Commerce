from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .models import Profile, Wishlist
from .serializers import (
    UserSerializer, ProfileSerializer, ProfileUpdateSerializer,
    UserRegistrationSerializer, PasswordChangeSerializer,
    PasswordResetRequestSerializer, WishlistSerializer
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""
    
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'profile': ProfileSerializer(user.profile).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LogoutView(APIView):
    """User logout endpoint (blacklist refresh token)."""
    
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get and update current user profile."""
    
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ProfileUpdateSerializer
        return ProfileSerializer
    
    def get_object(self):
        return self.request.user.profile


class PasswordChangeView(APIView):
    """Change user password."""
    
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    """Request password reset email."""
    
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        # Check if user exists
        try:
            user = User.objects.get(email=email)
            # TODO: Send password reset email with token
            # For now, just return success (implement email sending later)
        except User.DoesNotExist:
            pass  # Don't reveal if email exists
        
        return Response({
            'message': 'If the email exists, a password reset link has been sent.'
        }, status=status.HTTP_200_OK)


class WishlistListCreateView(generics.ListCreateAPIView):
    """List and add wishlist items."""
    
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = WishlistSerializer
    
    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related('product')


class WishlistDeleteView(generics.DestroyAPIView):
    """Remove item from wishlist."""
    
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = WishlistSerializer
    lookup_field = 'product_id'
    
    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        product_id = self.kwargs.get('product_id')
        try:
            wishlist_item = Wishlist.objects.get(user=request.user, product_id=product_id)
            wishlist_item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Wishlist.DoesNotExist:
            return Response(
                {'error': 'Item not found in wishlist'},
                status=status.HTTP_404_NOT_FOUND
            )


class CurrentUserView(APIView):
    """Get current authenticated user info."""
    
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request):
        user = request.user
        return Response({
            'user': UserSerializer(user).data,
            'profile': ProfileSerializer(user.profile).data if hasattr(user, 'profile') else None
        })
