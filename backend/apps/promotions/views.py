from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import Coupon, CouponUsage, FlashSale, Notification, DeliveryAssignment, Referral
from .serializers import (
    CouponSerializer, CouponValidateSerializer, FlashSaleSerializer,
    NotificationSerializer, NotificationCreateSerializer,
    DeliveryAssignmentSerializer, ReferralSerializer,
    DeliveryPartnerSerializer, BulkDiscountSerializer
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

class CouponValidateView(APIView):
    """Validate a coupon code."""
    
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request):
        serializer = CouponValidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        code = serializer.validated_data['code']
        order_total = request.data.get('order_total', 0)
        
        try:
            coupon = Coupon.objects.get(code=code.upper())
            
            if not coupon.is_valid():
                return Response(
                    {'valid': False, 'error': 'Coupon is not valid'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if float(order_total) < float(coupon.min_order_value):
                return Response(
                    {'valid': False, 'error': f'Minimum order value is ₹{coupon.min_order_value}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if user has already used this coupon
            if CouponUsage.objects.filter(coupon=coupon, user=request.user).exists():
                return Response(
                    {'valid': False, 'error': 'You have already used this coupon'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Calculate discount
            if coupon.discount_type == 'percentage':
                discount = (float(order_total) * float(coupon.discount_value)) / 100
                if coupon.max_discount:
                    discount = min(discount, float(coupon.max_discount))
            else:
                discount = float(coupon.discount_value)
            
            return Response({
                'valid': True,
                'coupon': CouponSerializer(coupon).data,
                'discount': round(discount, 2)
            })
        except Coupon.DoesNotExist:
            return Response(
                {'valid': False, 'error': 'Invalid coupon code'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ActiveFlashSalesView(generics.ListAPIView):
    """List active flash sales."""
    
    permission_classes = (permissions.AllowAny,)
    serializer_class = FlashSaleSerializer
    
    def get_queryset(self):
        now = timezone.now()
        return FlashSale.objects.filter(
            is_active=True,
            start_time__lte=now,
            end_time__gte=now
        )


class NotificationListView(generics.ListAPIView):
    """List user notifications."""
    
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class NotificationMarkReadView(APIView):
    """Mark a notification as read."""
    
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({'message': 'Notification marked as read'})
        except Notification.DoesNotExist:
            return Response(
                {'error': 'Notification not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class NotificationMarkAllReadView(APIView):
    """Mark all notifications as read."""
    
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'message': 'All notifications marked as read'})


# Admin endpoints

class AdminCouponListCreateView(generics.ListCreateAPIView):
    """Admin: List and create coupons."""
    
    permission_classes = (IsAdminOrShopOwner,)
    serializer_class = CouponSerializer
    queryset = Coupon.objects.all().order_by('-created_at')


class AdminCouponDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Get, update, or delete a coupon."""
    
    permission_classes = (IsAdminOrShopOwner,)
    serializer_class = CouponSerializer
    queryset = Coupon.objects.all()


class AdminFlashSaleListCreateView(generics.ListCreateAPIView):
    """Admin: List and create flash sales."""
    
    permission_classes = (IsAdminOrShopOwner,)
    serializer_class = FlashSaleSerializer
    queryset = FlashSale.objects.all().order_by('-created_at')


class AdminFlashSaleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Get, update, or delete a flash sale."""
    
    permission_classes = (IsAdminOrShopOwner,)
    serializer_class = FlashSaleSerializer
    queryset = FlashSale.objects.all()


class AdminBulkDiscountView(APIView):
    """Admin: Apply bulk discount to products."""
    
    permission_classes = (IsAdminOrShopOwner,)
    
    def post(self, request):
        serializer = BulkDiscountSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        return Response({
            'message': f'Discount applied to {result["updated_count"]} products',
            'updated_count': result['updated_count']
        })


class AdminNotificationCreateView(generics.CreateAPIView):
    """Admin: Create notification for a user."""
    
    permission_classes = (IsAdminOrShopOwner,)
    serializer_class = NotificationCreateSerializer


class AdminPaymentsListView(APIView):
    """Admin: List payments (orders with payment info)."""
    
    permission_classes = (IsAdminOrShopOwner,)
    
    def get(self, request):
        from apps.orders.models import Order
        from apps.orders.serializers import OrderListSerializer
        
        orders = Order.objects.filter(
            payment_status__in=['completed', 'pending', 'failed', 'refunded']
        ).order_by('-created_at')
        
        # Status filter
        status_filter = request.query_params.get('payment_status')
        if status_filter and status_filter != 'all':
            orders = orders.filter(payment_status=status_filter)
        
        # Payment method filter
        method = request.query_params.get('payment_method')
        if method and method != 'all':
            orders = orders.filter(payment_method=method)
        
        data = [{
            'id': str(o.id),
            'order_number': o.order_number,
            'user_email': o.user.email if o.user else 'N/A',
            'payment_method': o.payment_method,
            'payment_status': o.payment_status,
            'payment_id': o.payment_id,
            'final_amount': float(o.final_amount),
            'created_at': o.created_at.isoformat()
        } for o in orders[:100]]  # Limit to 100
        
        return Response(data)


class AdminPaymentStatusUpdateView(APIView):
    """Admin: Update payment status."""
    
    permission_classes = (IsAdminOrShopOwner,)
    
    def put(self, request, pk):
        from apps.orders.models import Order
        
        try:
            order = Order.objects.get(pk=pk)
            new_status = request.data.get('payment_status')
            
            if new_status not in ['pending', 'completed', 'failed', 'refunded']:
                return Response(
                    {'error': 'Invalid payment status'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            order.payment_status = new_status
            order.save()
            
            return Response({
                'id': str(order.id),
                'payment_status': order.payment_status
            })
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
