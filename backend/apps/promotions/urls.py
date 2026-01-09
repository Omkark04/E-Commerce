from django.urls import path
from .views import (
    CouponValidateView, ActiveFlashSalesView,
    NotificationListView, NotificationMarkReadView, NotificationMarkAllReadView,
    AdminCouponListCreateView, AdminCouponDetailView,
    AdminFlashSaleListCreateView, AdminFlashSaleDetailView,
    AdminBulkDiscountView, AdminNotificationCreateView,
    AdminPaymentsListView, AdminPaymentStatusUpdateView
)

urlpatterns = [
    # Public/User endpoints
    path('coupons/validate/', CouponValidateView.as_view(), name='coupon_validate'),
    path('flash-sales/', ActiveFlashSalesView.as_view(), name='active_flash_sales'),
    path('notifications/', NotificationListView.as_view(), name='notification_list'),
    path('notifications/<uuid:pk>/read/', NotificationMarkReadView.as_view(), name='notification_mark_read'),
    path('notifications/read-all/', NotificationMarkAllReadView.as_view(), name='notification_mark_all_read'),
    
    # Admin endpoints
    path('admin/coupons/', AdminCouponListCreateView.as_view(), name='admin_coupon_list'),
    path('admin/coupons/<uuid:pk>/', AdminCouponDetailView.as_view(), name='admin_coupon_detail'),
    path('admin/flash-sales/', AdminFlashSaleListCreateView.as_view(), name='admin_flash_sale_list'),
    path('admin/flash-sales/<uuid:pk>/', AdminFlashSaleDetailView.as_view(), name='admin_flash_sale_detail'),
    path('admin/products/bulk-discount/', AdminBulkDiscountView.as_view(), name='admin_bulk_discount'),
    path('admin/notifications/', AdminNotificationCreateView.as_view(), name='admin_notification_create'),
    path('admin/payments/', AdminPaymentsListView.as_view(), name='admin_payments_list'),
    path('admin/payments/<uuid:pk>/status/', AdminPaymentStatusUpdateView.as_view(), name='admin_payment_status'),
]
