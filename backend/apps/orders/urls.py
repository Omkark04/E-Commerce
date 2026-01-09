from django.urls import path
from .views import (
    CartListCreateView, CartItemUpdateDeleteView, CartClearView,
    AddressListCreateView, AddressDetailView, AddressSetDefaultView,
    OrderListCreateView, OrderDetailView, OrderCancelView, OrderReorderView,
    AdminOrderListView, AdminOrderDetailView, AdminOrderStatusUpdateView,
    AdminOrderDeliveryPartnerView, AdminOrderTrackingView,
    AdminOrderStatsView, AdminDeliveryPartnersView,
    AdminRefundListView, AdminRefundDetailView, AdminRefundUpdateView,
    AdminOrderCreateView,
    AdminPaymentListView, AdminPaymentStatsView, AdminPaymentStatusUpdateView
)
from .csv_export import (
    OrdersCSVExportView, RefundRequestsCSVExportView, ProductsCSVExportView,
    ProductsCSVImportView, CustomerListView, CustomerDetailView, DashboardStatsView
)

urlpatterns = [
    # Cart
    path('cart/', CartListCreateView.as_view(), name='cart_list_create'),
    path('cart/<uuid:pk>/', CartItemUpdateDeleteView.as_view(), name='cart_item_detail'),
    path('cart/clear/', CartClearView.as_view(), name='cart_clear'),
    
    # Addresses
    path('addresses/', AddressListCreateView.as_view(), name='address_list_create'),
    path('addresses/<uuid:pk>/', AddressDetailView.as_view(), name='address_detail'),
    path('addresses/<uuid:pk>/set-default/', AddressSetDefaultView.as_view(), name='address_set_default'),
    
    # Orders
    path('orders/', OrderListCreateView.as_view(), name='order_list_create'),
    path('orders/<uuid:pk>/', OrderDetailView.as_view(), name='order_detail'),
    path('orders/<uuid:pk>/cancel/', OrderCancelView.as_view(), name='order_cancel'),
    path('orders/<uuid:pk>/reorder/', OrderReorderView.as_view(), name='order_reorder'),
    
    # Admin Orders
    path('admin/orders/', AdminOrderListView.as_view(), name='admin_order_list'),
    path('admin/orders/create/', AdminOrderCreateView.as_view(), name='admin_order_create'),
    path('admin/orders/<uuid:pk>/', AdminOrderDetailView.as_view(), name='admin_order_detail'),
    path('admin/orders/<uuid:pk>/status/', AdminOrderStatusUpdateView.as_view(), name='admin_order_status'),
    path('admin/orders/<uuid:pk>/assign-delivery/', AdminOrderDeliveryPartnerView.as_view(), name='admin_order_delivery'),
    path('admin/orders/<uuid:pk>/tracking/', AdminOrderTrackingView.as_view(), name='admin_order_tracking'),
    path('admin/orders/stats/', AdminOrderStatsView.as_view(), name='admin_order_stats'),
    path('admin/orders/export/', OrdersCSVExportView.as_view(), name='admin_orders_export'),
    path('admin/delivery-partners/', AdminDeliveryPartnersView.as_view(), name='admin_delivery_partners'),
    
    # Admin Refunds
    path('admin/refunds/', AdminRefundListView.as_view(), name='admin_refund_list'),
    path('admin/refunds/<uuid:pk>/', AdminRefundDetailView.as_view(), name='admin_refund_detail'),
    path('admin/refunds/<uuid:pk>/update/', AdminRefundUpdateView.as_view(), name='admin_refund_update'),
    path('admin/refunds/export/', RefundRequestsCSVExportView.as_view(), name='admin_refunds_export'),
    
    # Admin Payments
    path('admin/payments/', AdminPaymentListView.as_view(), name='admin_payment_list'),
    path('admin/payments/stats/', AdminPaymentStatsView.as_view(), name='admin_payment_stats'),
    path('admin/orders/<uuid:pk>/payment-status/', AdminPaymentStatusUpdateView.as_view(), name='admin_order_payment_status'),
    
    # Admin Products CSV
    path('admin/products/export/', ProductsCSVExportView.as_view(), name='admin_products_export'),
    path('admin/products/import/', ProductsCSVImportView.as_view(), name='admin_products_import'),
    
    # Admin Customers
    path('admin/customers/', CustomerListView.as_view(), name='admin_customer_list'),
    path('admin/customers/<int:pk>/', CustomerDetailView.as_view(), name='admin_customer_detail'),
    
    # Admin Dashboard
    path('admin/dashboard/', DashboardStatsView.as_view(), name='admin_dashboard'),
]
