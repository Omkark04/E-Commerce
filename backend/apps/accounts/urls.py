from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, LogoutView, ProfileView, 
    PasswordChangeView, PasswordResetRequestView,
    WishlistListCreateView, WishlistDeleteView, CurrentUserView
)

urlpatterns = [
    # Authentication
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/password-change/', PasswordChangeView.as_view(), name='password_change'),
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    
    # Profile
    path('profile/', ProfileView.as_view(), name='profile'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    
    # Wishlist
    path('wishlist/', WishlistListCreateView.as_view(), name='wishlist_list_create'),
    path('wishlist/<uuid:product_id>/', WishlistDeleteView.as_view(), name='wishlist_delete'),
]
