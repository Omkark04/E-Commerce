from rest_framework import generics, status, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Sum, Count
from .models import CartItem, Address, Order, OrderItem, OrderTracking
from .serializers import (
    CartItemSerializer, CartItemUpdateSerializer, AddressSerializer,
    OrderListSerializer, OrderDetailSerializer, OrderCreateSerializer,
    AdminOrderListSerializer, OrderStatusUpdateSerializer,
    OrderDeliveryPartnerSerializer, OrderTrackingUpdateSerializer
)


class IsAdminOrShopOwner(permissions.BasePermission):
    """Permission for admin and shop owner access."""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if hasattr(request.user, 'profile'):
            return request.user.profile.role in ['admin', 'shop_owner', 'co_shop_owner']
        return request.user.is_superuser


# Cart endpoints

class CartListCreateView(generics.ListCreateAPIView):
    """List and add cart items."""
    
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = CartItemSerializer
    
    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user).select_related('product', 'variant')


class CartItemUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    """Update quantity or remove cart item."""
    
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CartItemUpdateSerializer
        return CartItemSerializer
    
    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user)


class CartClearView(APIView):
    """Clear all items from cart."""
    
    permission_classes = (permissions.IsAuthenticated,)
    
    def delete(self, request):
        CartItem.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Address endpoints

class AddressListCreateView(generics.ListCreateAPIView):
    """List and create addresses."""
    
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = AddressSerializer
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete an address."""
    
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = AddressSerializer
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class AddressSetDefaultView(APIView):
    """Set an address as default."""
    
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request, pk):
        try:
            address = Address.objects.get(pk=pk, user=request.user)
            # Unset all defaults
            Address.objects.filter(user=request.user, is_default=True).update(is_default=False)
            # Set this as default
            address.is_default = True
            address.save()
            return Response(AddressSerializer(address).data)
        except Address.DoesNotExist:
            return Response(
                {'error': 'Address not found'},
                status=status.HTTP_404_NOT_FOUND
            )


# Order endpoints

class OrderListCreateView(generics.ListCreateAPIView):
    """List user orders and create new order."""
    
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['order_number']
    ordering_fields = ['created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OrderCreateSerializer
        return OrderListSerializer
    
    def get_queryset(self):
        queryset = Order.objects.filter(user=self.request.user).prefetch_related('items')
        
        # Status filter
        status_filter = self.request.query_params.get('status')
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)
        
        # Sort
        sort_by = self.request.query_params.get('sort_by', 'newest')
        if sort_by == 'oldest':
            queryset = queryset.order_by('created_at')
        else:
            queryset = queryset.order_by('-created_at')
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(
            OrderDetailSerializer(order).data,
            status=status.HTTP_201_CREATED
        )


class OrderDetailView(generics.RetrieveAPIView):
    """Get order details."""
    
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = OrderDetailSerializer
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related(
            'items__product', 'items__variant', 'tracking_history'
        ).select_related('shipping_address')


class OrderCancelView(APIView):
    """Cancel an order (only if pending)."""
    
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
            
            if order.status != 'pending':
                return Response(
                    {'error': 'Only pending orders can be cancelled'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            order.status = 'cancelled'
            order.save()
            
            # Add tracking entry
            OrderTracking.objects.create(
                order=order,
                status='cancelled',
                notes='Order cancelled by customer',
                updated_by=request.user
            )
            
            return Response(OrderDetailSerializer(order).data)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class OrderReorderView(APIView):
    """Reorder - add items from previous order to cart."""
    
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
            
            # Add order items to cart
            for item in order.items.all():
                if item.product and item.variant:
                    CartItem.objects.update_or_create(
                        user=request.user,
                        product=item.product,
                        variant=item.variant,
                        defaults={'quantity': item.quantity}
                    )
            
            return Response({'message': 'Items added to cart'})
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )


# Admin endpoints

class AdminOrderListView(generics.ListAPIView):
    """Admin: List all orders with filters."""
    
    permission_classes = (IsAdminOrShopOwner,)
    serializer_class = AdminOrderListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['order_number']
    
    def get_queryset(self):
        queryset = Order.objects.all().select_related(
            'user', 'shipping_address'
        ).prefetch_related('items__product', 'items__variant')
        
        # Status filter
        status_filter = self.request.query_params.get('status')
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)
        
        # Payment method filter
        payment_method = self.request.query_params.get('payment_method')
        if payment_method and payment_method != 'all':
            queryset = queryset.filter(payment_method=payment_method)
        
        # Date filters
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        
        return queryset.order_by('-created_at')


class AdminOrderDetailView(generics.RetrieveAPIView):
    """Admin: Get order details."""
    
    permission_classes = (IsAdminOrShopOwner,)
    serializer_class = AdminOrderListSerializer
    queryset = Order.objects.all()


class AdminOrderStatusUpdateView(APIView):
    """Admin: Update order status."""
    
    permission_classes = (IsAdminOrShopOwner,)
    
    def put(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
            serializer = OrderStatusUpdateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            old_status = order.status
            order.status = serializer.validated_data['status']
            
            if serializer.validated_data.get('estimated_delivery'):
                order.estimated_delivery = serializer.validated_data['estimated_delivery']
            
            if order.status == 'delivered':
                order.delivered_at = timezone.now()
            
            order.save()
            
            # Add tracking entry
            OrderTracking.objects.create(
                order=order,
                status=order.status,
                notes=f'Status changed from {old_status} to {order.status}',
                updated_by=request.user
            )
            
            return Response(AdminOrderListSerializer(order).data)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class AdminOrderDeliveryPartnerView(APIView):
    """Admin: Assign delivery partner."""
    
    permission_classes = (IsAdminOrShopOwner,)
    
    def put(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
            serializer = OrderDeliveryPartnerSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            delivery_partner_id = serializer.validated_data['delivery_partner_id']
            
            if delivery_partner_id:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                order.delivery_partner = User.objects.get(id=delivery_partner_id)
            else:
                order.delivery_partner = None
            
            order.save()
            return Response(AdminOrderListSerializer(order).data)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class AdminOrderTrackingView(APIView):
    """Admin: Update tracking number."""
    
    permission_classes = (IsAdminOrShopOwner,)
    
    def put(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
            serializer = OrderTrackingUpdateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            order.tracking_number = serializer.validated_data['tracking_number']
            order.save()
            
            return Response(AdminOrderListSerializer(order).data)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class AdminOrderStatsView(APIView):
    """Admin: Get order statistics."""
    
    permission_classes = (IsAdminOrShopOwner,)
    
    def get(self, request):
        today = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        orders = Order.objects.all()
        
        stats = {
            'total': orders.count(),
            'pending': orders.filter(status='pending').count(),
            'confirmed': orders.filter(status='confirmed').count(),
            'shipped': orders.filter(status='shipped').count(),
            'delivered': orders.filter(status='delivered').count(),
            'cancelled': orders.filter(status='cancelled').count(),
            'today_orders': orders.filter(created_at__gte=today).count(),
            'total_revenue': float(orders.exclude(status='cancelled').aggregate(
                total=Sum('final_amount')
            )['total'] or 0),
            'today_revenue': float(orders.filter(
                created_at__gte=today
            ).exclude(status='cancelled').aggregate(
                total=Sum('final_amount')
            )['total'] or 0),
        }
        
        return Response(stats)


class AdminDeliveryPartnersView(generics.ListAPIView):
    """Admin: List delivery partners."""
    
    permission_classes = (IsAdminOrShopOwner,)
    
    def get(self, request):
        from django.contrib.auth import get_user_model
        from apps.accounts.models import Profile
        
        User = get_user_model()
        
        partners = User.objects.filter(
            profile__role='delivery_partner'
        ).select_related('profile')
        
        data = [{
            'id': p.id,
            'full_name': p.full_name,
            'email': p.email,
            'phone': p.profile.phone if hasattr(p, 'profile') else None
        } for p in partners]
        
        return Response(data)


class AdminRefundListView(generics.ListAPIView):
    """Admin: List all refund requests."""
    
    permission_classes = (IsAdminOrShopOwner,)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['order__order_number']
    
    def get(self, request):
        from .models import RefundRequest
        
        queryset = RefundRequest.objects.all().select_related(
            'order', 'user', 'order_item__product'
        )
        
        # Status filter
        status_filter = request.query_params.get('status')
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)
        
        queryset = queryset.order_by('-created_at')
        
        data = [{
            'id': str(r.id),
            'order_number': r.order.order_number,
            'user_email': r.user.email,
            'user_name': r.user.full_name,
            'product': r.order_item.product.name_en if r.order_item and r.order_item.product else 'Full Order',
            'reason': r.reason,
            'reason_display': r.get_reason_display(),
            'description': r.description,
            'refund_amount': float(r.refund_amount),
            'status': r.status,
            'admin_notes': r.admin_notes,
            'created_at': r.created_at.isoformat(),
            'processed_at': r.processed_at.isoformat() if r.processed_at else None,
        } for r in queryset]
        
        return Response(data)


class AdminRefundDetailView(APIView):
    """Admin: Get refund request details."""
    
    permission_classes = (IsAdminOrShopOwner,)
    
    def get(self, request, pk):
        from .models import RefundRequest
        
        try:
            refund = RefundRequest.objects.select_related(
                'order', 'user', 'order_item__product', 'order_item__variant'
            ).get(pk=pk)
            
            data = {
                'id': str(refund.id),
                'order': {
                    'id': str(refund.order.id),
                    'order_number': refund.order.order_number,
                    'final_amount': float(refund.order.final_amount),
                    'status': refund.order.status,
                    'created_at': refund.order.created_at.isoformat(),
                },
                'user': {
                    'id': refund.user.id,
                    'email': refund.user.email,
                    'full_name': refund.user.full_name,
                },
                'order_item': {
                    'product': refund.order_item.product.name_en if refund.order_item and refund.order_item.product else None,
                    'variant': f"{refund.order_item.variant.size}/{refund.order_item.variant.color}" if refund.order_item and refund.order_item.variant else None,
                    'quantity': refund.order_item.quantity if refund.order_item else None,
                    'price': float(refund.order_item.price_at_purchase) if refund.order_item else None,
                } if refund.order_item else None,
                'reason': refund.reason,
                'reason_display': refund.get_reason_display(),
                'description': refund.description,
                'refund_amount': float(refund.refund_amount),
                'status': refund.status,
                'admin_notes': refund.admin_notes,
                'processed_by': refund.processed_by.email if refund.processed_by else None,
                'created_at': refund.created_at.isoformat(),
                'processed_at': refund.processed_at.isoformat() if refund.processed_at else None,
            }
            
            return Response(data)
        except RefundRequest.DoesNotExist:
            return Response({'error': 'Refund request not found'}, status=status.HTTP_404_NOT_FOUND)


class AdminRefundUpdateView(APIView):
    """Admin: Update refund request status."""
    
    permission_classes = (IsAdminOrShopOwner,)
    
    def put(self, request, pk):
        from .models import RefundRequest
        
        try:
            refund = RefundRequest.objects.get(pk=pk)
            
            new_status = request.data.get('status')
            admin_notes = request.data.get('admin_notes')
            
            if new_status:
                if new_status not in ['pending', 'approved', 'rejected', 'processed']:
                    return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
                refund.status = new_status
                
                if new_status in ['approved', 'rejected', 'processed']:
                    refund.processed_by = request.user
                    refund.processed_at = timezone.now()
                    
                    # If processed, update order payment status
                    if new_status == 'processed':
                        refund.order.payment_status = 'refunded'
                        refund.order.save()
            
            if admin_notes:
                refund.admin_notes = admin_notes
            
            refund.save()
            
            return Response({
                'id': str(refund.id),
                'status': refund.status,
                'admin_notes': refund.admin_notes,
                'processed_at': refund.processed_at.isoformat() if refund.processed_at else None,
            })
        except RefundRequest.DoesNotExist:
            return Response({'error': 'Refund request not found'}, status=status.HTTP_404_NOT_FOUND)


class AdminPaymentListView(APIView):
    """Admin: List all orders with payment info."""
    
    permission_classes = (IsAdminOrShopOwner,)
    
    def get(self, request):
        queryset = Order.objects.all().select_related('user')
        
        # Payment status filter
        payment_status = request.query_params.get('paymentStatus')
        if payment_status and payment_status != 'all':
            queryset = queryset.filter(payment_status=payment_status)
        
        # Payment method filter
        payment_method = request.query_params.get('paymentMethod')
        if payment_method and payment_method != 'all':
            queryset = queryset.filter(payment_method=payment_method)
        
        # Date filters
        date_from = request.query_params.get('dateFrom')
        date_to = request.query_params.get('dateTo')
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        
        # Search
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(order_number__icontains=search)
        
        queryset = queryset.order_by('-created_at')[:100]
        
        data = [{
            'id': str(order.id),
            'order_number': order.order_number,
            'user_email': order.user.email if order.user else 'Guest',
            'user_name': order.user.full_name if order.user else 'Guest',
            'total_amount': float(order.final_amount),
            'payment_method': order.payment_method,
            'payment_status': order.payment_status,
            'payment_id': order.payment_id,
            'order_status': order.status,
            'created_at': order.created_at.isoformat(),
            'paid_at': order.updated_at.isoformat() if order.payment_status == 'completed' else None,
        } for order in queryset]
        
        return Response(data)


class AdminPaymentStatsView(APIView):
    """Admin: Get payment statistics."""
    
    permission_classes = (IsAdminOrShopOwner,)
    
    def get(self, request):
        from datetime import timedelta
        
        today = timezone.now().date()
        start_of_week = today - timedelta(days=today.weekday())
        start_of_month = today.replace(day=1)
        
        # Total revenue
        total_revenue = Order.objects.filter(
            payment_status='completed'
        ).aggregate(total=Sum('final_amount'))['total'] or 0
        
        # Today's revenue
        today_revenue = Order.objects.filter(
            payment_status='completed',
            created_at__date=today
        ).aggregate(total=Sum('final_amount'))['total'] or 0
        
        # This week's revenue
        week_revenue = Order.objects.filter(
            payment_status='completed',
            created_at__date__gte=start_of_week
        ).aggregate(total=Sum('final_amount'))['total'] or 0
        
        # This month's revenue
        month_revenue = Order.objects.filter(
            payment_status='completed',
            created_at__date__gte=start_of_month
        ).aggregate(total=Sum('final_amount'))['total'] or 0
        
        # Payment counts by status
        payment_counts = Order.objects.values('payment_status').annotate(
            count=Count('id')
        )
        
        status_counts = {item['payment_status']: item['count'] for item in payment_counts}
        
        # Payment method breakdown
        method_counts = Order.objects.filter(
            payment_status='completed'
        ).values('payment_method').annotate(
            count=Count('id'),
            total=Sum('final_amount')
        )
        
        methods = {
            item['payment_method']: {
                'count': item['count'],
                'total': float(item['total'] or 0)
            } for item in method_counts
        }
        
        return Response({
            'total_revenue': float(total_revenue),
            'today_revenue': float(today_revenue),
            'week_revenue': float(week_revenue),
            'month_revenue': float(month_revenue),
            'pending_payments': status_counts.get('pending', 0),
            'completed_payments': status_counts.get('completed', 0),
            'failed_payments': status_counts.get('failed', 0),
            'refunded_payments': status_counts.get('refunded', 0),
            'payment_methods': methods,
        })


class AdminPaymentStatusUpdateView(APIView):
    """Admin: Update payment status of an order."""
    
    permission_classes = (IsAdminOrShopOwner,)
    
    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
            
            payment_status = request.data.get('payment_status')
            payment_id = request.data.get('payment_id')
            
            if payment_status:
                if payment_status not in ['pending', 'completed', 'failed', 'refunded']:
                    return Response({'error': 'Invalid payment status'}, status=status.HTTP_400_BAD_REQUEST)
                order.payment_status = payment_status
            
            if payment_id:
                order.payment_id = payment_id
            
            order.save()
            
            return Response({
                'id': str(order.id),
                'payment_status': order.payment_status,
                'payment_id': order.payment_id,
            })
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)


class AdminOrderCreateView(APIView):
    """Admin: Create order manually (for phone/walk-in orders)."""
    
    permission_classes = (IsAdminOrShopOwner,)
    
    def post(self, request):
        import time
        import random
        import string
        from apps.products.models import Product, ProductVariant
        
        # Required fields
        customer_email = request.data.get('customer_email')
        items = request.data.get('items', [])
        payment_method = request.data.get('payment_method', 'cod')
        
        if not customer_email:
            return Response({'error': 'Customer email is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not items:
            return Response({'error': 'At least one item is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create customer
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            customer = User.objects.get(email=customer_email)
        except User.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get address (use default or create temp)
        address = Address.objects.filter(user=customer, is_default=True).first()
        if not address:
            address = Address.objects.filter(user=customer).first()
        
        if not address:
            return Response({'error': 'Customer has no saved address'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate totals
        subtotal = 0
        order_items_data = []
        
        for item in items:
            try:
                product = Product.objects.get(id=item['product_id'])
                variant = ProductVariant.objects.get(id=item['variant_id'])
                quantity = item.get('quantity', 1)
                price = float(product.base_price) + float(variant.additional_price)
                
                subtotal += price * quantity
                order_items_data.append({
                    'product': product,
                    'variant': variant,
                    'quantity': quantity,
                    'price': price,
                })
            except (Product.DoesNotExist, ProductVariant.DoesNotExist):
                return Response({'error': f'Product or variant not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Generate order number
        order_number = f"ORD-{int(time.time())}-{''.join(random.choices(string.ascii_uppercase + string.digits, k=9))}"
        
        # Create order
        order = Order.objects.create(
            user=customer,
            order_number=order_number,
            shipping_address=address,
            payment_method=payment_method,
            total_amount=subtotal,
            subtotal=subtotal,
            delivery_charges=0,
            tax=0,
            final_amount=subtotal,
            status='confirmed',  # Admin orders are auto-confirmed
            payment_status='pending'
        )
        
        # Create order items
        for item_data in order_items_data:
            OrderItem.objects.create(
                order=order,
                product=item_data['product'],
                variant=item_data['variant'],
                quantity=item_data['quantity'],
                price_at_purchase=item_data['price'],
            )
        
        # Add tracking entry
        OrderTracking.objects.create(
            order=order,
            status='confirmed',
            notes='Order created by admin',
            updated_by=request.user
        )
        
        return Response({
            'id': str(order.id),
            'order_number': order.order_number,
            'status': order.status,
            'final_amount': float(order.final_amount),
        }, status=status.HTTP_201_CREATED)

