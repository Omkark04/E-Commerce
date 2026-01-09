from rest_framework import generics, status, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.conf import settings
from .models import MainCategory, Category, Company, Product, ProductVariant, ProductImage, SizeChart, Banner, DefaultSize, DefaultColor
from .serializers import (
    MainCategorySerializer, CategorySerializer, CategoryListSerializer, CompanySerializer,
    ProductListSerializer, ProductDetailSerializer, ProductCreateUpdateSerializer,
    ProductVariantSerializer, ProductImageSerializer, AdminProductListSerializer,
    SizeChartSerializer, BannerSerializer, DefaultSizeSerializer, DefaultColorSerializer
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

class MainCategoryListView(generics.ListAPIView):
    """List all main categories."""
    
    permission_classes = (permissions.AllowAny,)
    serializer_class = MainCategorySerializer
    
    def get_queryset(self):
        return MainCategory.objects.filter(is_active=True).order_by('display_order')


class MainCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Get, update, or delete main category."""
    
    permission_classes = (IsAdminOrShopOwner,)
    serializer_class = MainCategorySerializer
    queryset = MainCategory.objects.all()
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return super().get_permissions()


class CategoryListView(generics.ListAPIView):
    """List all active categories."""
    
    permission_classes = (permissions.AllowAny,)
    serializer_class = CategoryListSerializer
    
    def get_queryset(self):
        queryset = Category.objects.filter(is_active=True).select_related('main_category').order_by('display_order')
        
        # Filter by main category
        main_category_id = self.request.query_params.get('main_category_id')
        if main_category_id:
            queryset = queryset.filter(main_category_id=main_category_id)
        
        return queryset


class CategoryDetailView(generics.RetrieveAPIView):
    """Get single category details."""
    
    permission_classes = (permissions.AllowAny,)
    serializer_class = CategorySerializer
    queryset = Category.objects.filter(is_active=True)


class ProductListView(generics.ListAPIView):
    """List products with filters."""
    
    permission_classes = (permissions.AllowAny,)
    serializer_class = ProductListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name_en', 'name_hi', 'name_mr', 'description_en', 'product_code']
    ordering_fields = ['base_price', 'created_at', 'total_sales']
    
    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True).select_related(
            'main_category', 'category', 'company'
        ).prefetch_related('images', 'variants')
        
        # Main category filter
        main_category_id = self.request.query_params.get('main_category_id')
        if main_category_id:
            queryset = queryset.filter(main_category_id=main_category_id)
        
        # Category filter
        category_id = self.request.query_params.get('category_id')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # Company filter
        company_id = self.request.query_params.get('company_id')
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        
        # Price filters
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(base_price__gte=min_price)
        if max_price:
            queryset = queryset.filter(base_price__lte=max_price)
        
        # Sort options
        sort_by = self.request.query_params.get('sort_by')
        if sort_by == 'price_asc':
            queryset = queryset.order_by('base_price')
        elif sort_by == 'price_desc':
            queryset = queryset.order_by('-base_price')
        elif sort_by == 'newest':
            queryset = queryset.order_by('-created_at')
        elif sort_by == 'popular':
            queryset = queryset.order_by('-total_sales')
        else:
            queryset = queryset.order_by('-created_at')
        
        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    """Get single product details."""
    
    permission_classes = (permissions.AllowAny,)
    serializer_class = ProductDetailSerializer
    
    def get_queryset(self):
        return Product.objects.filter(is_active=True).select_related(
            'main_category', 'category', 'company'
        ).prefetch_related('images', 'variants')
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.total_views += 1
        instance.save(update_fields=['total_views'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class FeaturedProductsView(generics.ListAPIView):
    """List featured products."""
    
    permission_classes = (permissions.AllowAny,)
    serializer_class = ProductListSerializer
    
    def get_queryset(self):
        return Product.objects.filter(
            is_active=True, 
            is_featured=True
        ).select_related('main_category', 'category', 'company').prefetch_related('images', 'variants').order_by('-created_at')[:8]


class ProductsByCategoryView(generics.ListAPIView):
    """List products by category."""
    
    permission_classes = (permissions.AllowAny,)
    serializer_class = ProductListSerializer
    
    def get_queryset(self):
        category_id = self.kwargs.get('category_id')
        return Product.objects.filter(
            is_active=True,
            category_id=category_id
        ).select_related('main_category', 'category', 'company').prefetch_related('images', 'variants').order_by('-created_at')


class ActiveBannersView(generics.ListAPIView):
    """List active banners for display."""
    
    permission_classes = (permissions.AllowAny,)
    serializer_class = BannerSerializer
    
    def get_queryset(self):
        from django.utils import timezone
        now = timezone.now()
        return Banner.objects.filter(
            is_active=True
        ).filter(
            models.Q(start_date__isnull=True) | models.Q(start_date__lte=now),
            models.Q(end_date__isnull=True) | models.Q(end_date__gte=now)
        ).order_by('position', 'display_order')


# Admin endpoints

class CompanyListCreateView(generics.ListCreateAPIView):
    """Admin: List and create companies."""
    
    permission_classes = (IsAdminOrShopOwner,)
    serializer_class = CompanySerializer
    queryset = Company.objects.all().order_by('name')


class CompanyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Get, update, or delete a company."""
    
    permission_classes = (IsAdminOrShopOwner,)
    serializer_class = CompanySerializer
    queryset = Company.objects.all()


class AdminProductListView(generics.ListCreateAPIView):
    """Admin: List all products and create new ones."""
    
    permission_classes = (IsAdminOrShopOwner,)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name_en', 'name_hi', 'name_mr', 'product_code']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateUpdateSerializer
        return AdminProductListSerializer
    
    def get_queryset(self):
        queryset = Product.objects.all().select_related(
            'main_category', 'category', 'company'
        ).prefetch_related('images', 'variants')
        
        # Status filter
        status_filter = self.request.query_params.get('status')
        if status_filter == 'active':
            queryset = queryset.filter(is_active=True)
        elif status_filter == 'inactive':
            queryset = queryset.filter(is_active=False)
        
        # Main category filter
        main_category = self.request.query_params.get('main_category')
        if main_category:
            queryset = queryset.filter(main_category_id=main_category)
        
        # Category filter
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category_id=category)
        
        # Company filter
        company = self.request.query_params.get('company')
        if company:
            queryset = queryset.filter(company_id=company)
        
        # Price range filter
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(base_price__gte=min_price)
        if max_price:
            queryset = queryset.filter(base_price__lte=max_price)
        
        return queryset.order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return Response(
            ProductDetailSerializer(product).data,
            status=status.HTTP_201_CREATED
        )


class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Get, update, or delete a product."""
    
    permission_classes = (IsAdminOrShopOwner,)
    queryset = Product.objects.all()
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ProductCreateUpdateSerializer
        return ProductDetailSerializer


class AdminProductToggleStatusView(APIView):
    """Admin: Toggle product active status."""
    
    permission_classes = (IsAdminOrShopOwner,)
    
    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
            product.is_active = not product.is_active
            product.save()
            return Response({
                'id': str(product.id),
                'is_active': product.is_active
            })
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class AdminCategoryListCreateView(generics.ListCreateAPIView):
    """Admin: List and create categories."""
    
    permission_classes = (IsAdminOrShopOwner,)
    serializer_class = CategorySerializer
    
    def get_queryset(self):
        queryset = Category.objects.all().select_related('main_category').order_by('display_order')
        main_category_id = self.request.query_params.get('main_category_id')
        if main_category_id:
            queryset = queryset.filter(main_category_id=main_category_id)
        return queryset


class AdminCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Get, update, or delete a category."""
    
    permission_classes = (IsAdminOrShopOwner,)
    serializer_class = CategorySerializer
    queryset = Category.objects.all()


class AdminProductVariantListCreateView(generics.ListCreateAPIView):
    """Admin: List and create product variants."""
    
    permission_classes = (IsAdminOrShopOwner,)
    serializer_class = ProductVariantSerializer
    
    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        return ProductVariant.objects.filter(product_id=product_id)
    
    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_id')
        product = Product.objects.get(id=product_id)
        serializer.save(product=product)


class AdminProductVariantDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Get, update, or delete a product variant."""
    
    permission_classes = (IsAdminOrShopOwner,)
    serializer_class = ProductVariantSerializer
    queryset = ProductVariant.objects.all()


class AdminProductImageListCreateView(generics.ListCreateAPIView):
    """Admin: List and create product images."""
    
    permission_classes = (IsAdminOrShopOwner,)
    serializer_class = ProductImageSerializer
    
    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        return ProductImage.objects.filter(product_id=product_id)
    
    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_id')
        product = Product.objects.get(id=product_id)
        serializer.save(product=product)


class AdminProductImageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Get, update, or delete a product image."""
    
    permission_classes = (IsAdminOrShopOwner,)
    serializer_class = ProductImageSerializer
    queryset = ProductImage.objects.all()


class SizeChartListCreateView(generics.ListCreateAPIView):
    """Admin: List and create size charts."""
    
    permission_classes = (IsAdminOrShopOwner,)
    serializer_class = SizeChartSerializer
    
    def get_queryset(self):
        queryset = SizeChart.objects.all().select_related('main_category', 'category')
        main_category_id = self.request.query_params.get('main_category_id')
        category_id = self.request.query_params.get('category_id')
        
        if main_category_id:
            queryset = queryset.filter(main_category_id=main_category_id)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        return queryset.order_by('title')


class SizeChartDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Get, update, or delete a size chart."""
    
    permission_classes = (IsAdminOrShopOwner,)
    serializer_class = SizeChartSerializer
    queryset = SizeChart.objects.all()


class BannerListCreateView(generics.ListCreateAPIView):
    """Admin: List and create banners."""
    
    permission_classes = (IsAdminOrShopOwner,)
    serializer_class = BannerSerializer
    queryset = Banner.objects.all().order_by('position', 'display_order')


class BannerDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Get, update, or delete a banner."""
    
    permission_classes = (IsAdminOrShopOwner,)
    serializer_class = BannerSerializer
    queryset = Banner.objects.all()


class LowStockProductsView(APIView):
    """Admin: Get products with low stock."""
    
    permission_classes = (IsAdminOrShopOwner,)
    
    def get(self, request):
        threshold = getattr(settings, 'LOW_STOCK_THRESHOLD', 10)
        
        low_stock_variants = ProductVariant.objects.filter(
            stock_quantity__lte=threshold
        ).select_related('product').order_by('stock_quantity')
        
        data = [{
            'id': str(v.id),
            'product_id': str(v.product.id),
            'product_code': v.product.product_code,
            'product_name': v.product.name_en,
            'size': v.size,
            'color': v.color,
            'sku': v.sku,
            'stock_quantity': v.stock_quantity,
        } for v in low_stock_variants]
        
        return Response({
            'threshold': threshold,
            'count': len(data),
            'items': data
        })


class DefaultSizeListCreateView(generics.ListCreateAPIView):
    """Admin: List and create default sizes."""
    
    permission_classes = (IsAdminOrShopOwner,)
    serializer_class = DefaultSizeSerializer
    
    def get_queryset(self):
        queryset = DefaultSize.objects.all().select_related('category')
        
        # Filter by category if provided
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        return queryset.order_by('category', 'display_order')


class DefaultSizeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Get, update, or delete a default size."""
    
    permission_classes = (IsAdminOrShopOwner,)
    serializer_class = DefaultSizeSerializer
    queryset = DefaultSize.objects.all()


class DefaultColorListCreateView(generics.ListCreateAPIView):
    """Admin: List and create default colors."""
    
    permission_classes = (IsAdminOrShopOwner,)
    serializer_class = DefaultColorSerializer
    queryset = DefaultColor.objects.all().order_by('display_order')


class DefaultColorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Get, update, or delete a default color."""
    
    permission_classes = (IsAdminOrShopOwner,)
    serializer_class = DefaultColorSerializer
    queryset = DefaultColor.objects.all()
