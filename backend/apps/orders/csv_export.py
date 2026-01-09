"""
CSV export utilities for admin functions.
"""
import csv
from io import StringIO
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework import permissions


class IsAdminOrShopOwner(permissions.BasePermission):
    """Permission for admin and shop owner access."""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if hasattr(request.user, 'profile'):
            return request.user.profile.role in ['admin', 'shop_owner', 'co_shop_owner']
        return request.user.is_superuser


class OrdersCSVExportView(APIView):
    """Export orders to CSV with date range and filters."""
    
    permission_classes = (IsAdminOrShopOwner,)
    
    def get(self, request):
        from apps.orders.models import Order
        
        # Get filter parameters
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        status_filter = request.query_params.get('status')
        payment_method = request.query_params.get('payment_method')
        main_category = request.query_params.get('main_category')
        category = request.query_params.get('category')
        
        # Build queryset
        queryset = Order.objects.all().select_related('user', 'shipping_address').prefetch_related('items__product')
        
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)
        if payment_method and payment_method != 'all':
            queryset = queryset.filter(payment_method=payment_method)
        if main_category:
            queryset = queryset.filter(items__product__main_category_id=main_category).distinct()
        if category:
            queryset = queryset.filter(items__product__category_id=category).distinct()
        
        queryset = queryset.order_by('-created_at')
        
        # Create CSV response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="orders_export.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Order Number', 'Date', 'Customer Email', 'Customer Name', 'Recipient Name', 'Recipient Phone',
            'Status', 'Payment Method', 'Payment Status', 'Subtotal', 'Discount',
            'Delivery Charges', 'Tax', 'Final Amount', 'Address', 'City', 'State', 'Pincode'
        ])
        
        for order in queryset:
            writer.writerow([
                order.order_number,
                order.created_at.strftime('%Y-%m-%d %H:%M'),
                order.user.email if order.user else 'N/A',
                order.user.full_name if order.user else 'N/A',
                order.shipping_address.full_name if order.shipping_address else 'N/A',
                order.shipping_address.phone if order.shipping_address else 'N/A',
                order.status,
                order.payment_method,
                order.payment_status,
                float(order.subtotal),
                float(order.discount_amount),
                float(order.delivery_charges),
                float(order.tax),
                float(order.final_amount),
                order.shipping_address.address_line1 if order.shipping_address else 'N/A',
                order.shipping_address.city if order.shipping_address else 'N/A',
                order.shipping_address.state if order.shipping_address else 'N/A',
                order.shipping_address.pincode if order.shipping_address else 'N/A',
            ])
        
        return response


class RefundRequestsCSVExportView(APIView):
    """Export refund requests to CSV."""
    
    permission_classes = (IsAdminOrShopOwner,)
    
    def get(self, request):
        from apps.orders.models import RefundRequest
        
        # Get filter parameters
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        status_filter = request.query_params.get('status')
        
        # Build queryset
        queryset = RefundRequest.objects.all().select_related('order', 'user', 'order_item__product')
        
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)
        
        queryset = queryset.order_by('-created_at')
        
        # Create CSV response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="refund_requests_export.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Refund ID', 'Order Number', 'Date', 'Customer Email', 
            'Product', 'Reason', 'Description', 'Refund Amount', 
            'Status', 'Admin Notes', 'Processed At'
        ])
        
        for refund in queryset:
            writer.writerow([
                str(refund.id)[:8],
                refund.order.order_number,
                refund.created_at.strftime('%Y-%m-%d %H:%M'),
                refund.user.email,
                refund.order_item.product.name_en if refund.order_item and refund.order_item.product else 'Full Order',
                refund.get_reason_display(),
                refund.description or '',
                float(refund.refund_amount),
                refund.status,
                refund.admin_notes or '',
                refund.processed_at.strftime('%Y-%m-%d %H:%M') if refund.processed_at else '',
            ])
        
        return response


class ProductsCSVExportView(APIView):
    """Export products to CSV."""
    
    permission_classes = (IsAdminOrShopOwner,)
    
    def get(self, request):
        from apps.products.models import Product
        
        queryset = Product.objects.all().select_related(
            'main_category', 'category', 'company'
        ).prefetch_related('variants')
        
        # Create CSV response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="products_export.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Product Code', 'Name (EN)', 'Name (HI)', 'Name (MR)',
            'Main Category', 'Category', 'Company', 'Base Price',
            'Discount %', 'Total Stock', 'Is Featured', 'Is Active', 'Total Sales'
        ])
        
        for product in queryset:
            writer.writerow([
                product.product_code,
                product.name_en,
                product.name_hi,
                product.name_mr,
                product.main_category.name_en if product.main_category else '',
                product.category.name_en if product.category else '',
                product.company.name if product.company else '',
                float(product.base_price),
                product.discount_percentage,
                product.total_stock,
                'Yes' if product.is_featured else 'No',
                'Yes' if product.is_active else 'No',
                product.total_sales,
            ])
        
        return response


class ProductsCSVImportView(APIView):
    """Import products from CSV."""
    
    permission_classes = (IsAdminOrShopOwner,)
    
    def post(self, request):
        from apps.products.models import Product, MainCategory, Category, Company
        from rest_framework.response import Response
        from rest_framework import status
        
        csv_file = request.FILES.get('file')
        if not csv_file:
            return Response({'error': 'No CSV file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not csv_file.name.endswith('.csv'):
            return Response({'error': 'File must be a CSV'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            decoded_file = csv_file.read().decode('utf-8')
            reader = csv.DictReader(StringIO(decoded_file))
            
            created_count = 0
            updated_count = 0
            errors = []
            
            for row_num, row in enumerate(reader, start=2):
                try:
                    # Get or create related objects
                    main_category = None
                    category = None
                    company = None
                    
                    if row.get('Main Category'):
                        main_category, _ = MainCategory.objects.get_or_create(
                            name_en=row['Main Category'],
                            defaults={'slug': row['Main Category'].lower().replace(' ', '-')}
                        )
                    
                    if row.get('Category') and main_category:
                        category, _ = Category.objects.get_or_create(
                            name_en=row['Category'],
                            main_category=main_category,
                            defaults={'slug': row['Category'].lower().replace(' ', '-')}
                        )
                    
                    if row.get('Company'):
                        company, _ = Company.objects.get_or_create(name=row['Company'])
                    
                    # Create or update product
                    product, created = Product.objects.update_or_create(
                        product_code=row.get('Product Code'),
                        defaults={
                            'name_en': row.get('Name (EN)', ''),
                            'name_hi': row.get('Name (HI)', ''),
                            'name_mr': row.get('Name (MR)', ''),
                            'main_category': main_category,
                            'category': category,
                            'company': company,
                            'base_price': float(row.get('Base Price', 0)),
                            'discount_percentage': int(row.get('Discount %', 0)),
                            'is_featured': row.get('Is Featured', '').lower() == 'yes',
                            'is_active': row.get('Is Active', 'yes').lower() == 'yes',
                        }
                    )
                    
                    if created:
                        created_count += 1
                    else:
                        updated_count += 1
                        
                except Exception as e:
                    errors.append(f"Row {row_num}: {str(e)}")
            
            return Response({
                'message': f'Import completed. Created: {created_count}, Updated: {updated_count}',
                'created': created_count,
                'updated': updated_count,
                'errors': errors
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CustomerListView(APIView):
    """Admin: List all customers."""
    
    permission_classes = (IsAdminOrShopOwner,)
    
    def get(self, request):
        from django.contrib.auth import get_user_model
        from django.db.models import Sum, Count
        from apps.orders.models import Order
        from rest_framework.response import Response
        
        User = get_user_model()
        
        customers = User.objects.filter(
            profile__role='customer'
        ).select_related('profile').annotate(
            order_count=Count('orders'),
            total_spent=Sum('orders__final_amount')
        ).order_by('-date_joined')
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        per_page = int(request.query_params.get('per_page', 20))
        start = (page - 1) * per_page
        end = start + per_page
        
        data = [{
            'id': c.id,
            'email': c.email,
            'full_name': c.full_name,
            'phone': c.profile.phone if hasattr(c, 'profile') else None,
            'order_count': c.order_count or 0,
            'total_spent': float(c.total_spent or 0),
            'loyalty_points': c.profile.loyalty_points if hasattr(c, 'profile') else 0,
            'date_joined': c.date_joined.isoformat(),
        } for c in customers[start:end]]
        
        return Response({
            'results': data,
            'total': customers.count(),
            'page': page,
            'per_page': per_page
        })


class CustomerDetailView(APIView):
    """Admin: Customer detail with order behavior."""
    
    permission_classes = (IsAdminOrShopOwner,)
    
    def get(self, request, pk):
        from django.contrib.auth import get_user_model
        from django.db.models import Sum, Count
        from apps.orders.models import Order
        from rest_framework.response import Response
        from rest_framework import status
        
        User = get_user_model()
        
        try:
            customer = User.objects.select_related('profile').get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get order statistics
        orders = Order.objects.filter(user=customer)
        order_stats = orders.aggregate(
            total_orders=Count('id'),
            total_spent=Sum('final_amount'),
            completed_orders=Count('id', filter=models.Q(status='delivered')),
            cancelled_orders=Count('id', filter=models.Q(status='cancelled')),
        )
        
        # Recent orders
        recent_orders = orders.order_by('-created_at')[:5].values(
            'id', 'order_number', 'status', 'final_amount', 'created_at'
        )
        
        return Response({
            'id': customer.id,
            'email': customer.email,
            'full_name': customer.full_name,
            'phone': customer.profile.phone if hasattr(customer, 'profile') else None,
            'loyalty_points': customer.profile.loyalty_points if hasattr(customer, 'profile') else 0,
            'date_joined': customer.date_joined.isoformat(),
            'order_stats': order_stats,
            'recent_orders': list(recent_orders),
        })


class DashboardStatsView(APIView):
    """Admin: Enhanced dashboard statistics."""
    
    permission_classes = (IsAdminOrShopOwner,)
    
    def get(self, request):
        from django.utils import timezone
        from django.db.models import Sum, Count, F
        from apps.orders.models import Order
        from apps.products.models import Product, ProductVariant
        from django.contrib.auth import get_user_model
        from rest_framework.response import Response
        from datetime import timedelta
        
        User = get_user_model()
        
        now = timezone.now()
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Order statistics
        all_orders = Order.objects.all()
        
        order_stats = {
            'total_orders': all_orders.count(),
            'today_orders': all_orders.filter(created_at__gte=today).count(),
            'week_orders': all_orders.filter(created_at__gte=week_ago).count(),
            'month_orders': all_orders.filter(created_at__gte=month_ago).count(),
            'pending_orders': all_orders.filter(status='pending').count(),
            'processing_orders': all_orders.filter(status__in=['confirmed', 'packed', 'shipped']).count(),
        }
        
        # Revenue statistics
        revenue_stats = {
            'total_revenue': float(all_orders.exclude(status='cancelled').aggregate(
                total=Sum('final_amount'))['total'] or 0),
            'today_revenue': float(all_orders.filter(created_at__gte=today).exclude(
                status='cancelled').aggregate(total=Sum('final_amount'))['total'] or 0),
            'week_revenue': float(all_orders.filter(created_at__gte=week_ago).exclude(
                status='cancelled').aggregate(total=Sum('final_amount'))['total'] or 0),
            'month_revenue': float(all_orders.filter(created_at__gte=month_ago).exclude(
                status='cancelled').aggregate(total=Sum('final_amount'))['total'] or 0),
        }
        
        # Revenue graph data (last 7 days)
        revenue_graph = []
        for i in range(7):
            day = today - timedelta(days=6-i)
            next_day = day + timedelta(days=1)
            day_revenue = all_orders.filter(
                created_at__gte=day,
                created_at__lt=next_day
            ).exclude(status='cancelled').aggregate(total=Sum('final_amount'))['total'] or 0
            revenue_graph.append({
                'date': day.strftime('%Y-%m-%d'),
                'revenue': float(day_revenue)
            })
        
        # Best selling products
        from apps.orders.models import OrderItem
        best_sellers = OrderItem.objects.filter(
            order__created_at__gte=month_ago
        ).values(
            'product__id', 'product__product_code', 'product__name_en'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum(F('quantity') * F('price_at_purchase'))
        ).order_by('-total_quantity')[:5]
        
        # Low stock alerts
        low_stock_variants = ProductVariant.objects.filter(
            stock_quantity__lte=10
        ).select_related('product').order_by('stock_quantity')[:10]
        
        low_stock = [{
            'product_code': v.product.product_code,
            'product_name': v.product.name_en,
            'variant': f"{v.size} / {v.color}",
            'stock': v.stock_quantity,
            'sku': v.sku
        } for v in low_stock_variants]
        
        # Customer statistics
        customer_stats = {
            'total_customers': User.objects.filter(profile__role='customer').count(),
            'new_today': User.objects.filter(
                profile__role='customer', date_joined__gte=today).count(),
            'new_this_week': User.objects.filter(
                profile__role='customer', date_joined__gte=week_ago).count(),
        }
        
        return Response({
            'orders': order_stats,
            'revenue': revenue_stats,
            'revenue_graph': revenue_graph,
            'best_sellers': list(best_sellers),
            'low_stock_alerts': low_stock,
            'customers': customer_stats,
        })
