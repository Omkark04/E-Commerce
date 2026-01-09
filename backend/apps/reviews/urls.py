from django.urls import path
from .views import (
    ProductReviewListView, ProductReviewCreateView, ProductReviewSummaryView,
    ReviewUpdateDeleteView, ReviewVoteView, UserProductReviewView,
    AdminReviewListView, AdminReviewStatusUpdateView, AdminReviewDeleteView,
    ReviewShowcaseView
)

urlpatterns = [
    # Public/User endpoints
    path('products/<uuid:product_id>/reviews/', ProductReviewListView.as_view(), name='product_review_list'),
    path('products/<uuid:product_id>/reviews/create/', ProductReviewCreateView.as_view(), name='product_review_create'),
    path('products/<uuid:product_id>/reviews/summary/', ProductReviewSummaryView.as_view(), name='product_review_summary'),
    path('products/<uuid:product_id>/reviews/mine/', UserProductReviewView.as_view(), name='user_product_review'),
    path('reviews/<uuid:pk>/', ReviewUpdateDeleteView.as_view(), name='review_detail'),
    path('reviews/<uuid:pk>/vote/', ReviewVoteView.as_view(), name='review_vote'),
    path('reviews/showcase/', ReviewShowcaseView.as_view(), name='review_showcase'),
    
    # Admin endpoints
    path('admin/reviews/', AdminReviewListView.as_view(), name='admin_review_list'),
    path('admin/reviews/<uuid:pk>/status/', AdminReviewStatusUpdateView.as_view(), name='admin_review_status'),
    path('admin/reviews/<uuid:pk>/', AdminReviewDeleteView.as_view(), name='admin_review_delete'),
]
