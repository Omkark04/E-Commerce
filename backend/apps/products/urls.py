from django.urls import path
from .views import (
    CategoryListView, CategoryDetailView,
    ProductListView, ProductDetailView, FeaturedProductsView, ProductsByCategoryView,
    AdminProductListView, AdminProductDetailView, AdminProductToggleStatusView,
    AdminCategoryListCreateView, AdminCategoryDetailView,
    AdminProductVariantListCreateView, AdminProductVariantDetailView,
    AdminProductImageListCreateView, AdminProductImageDetailView,
    MainCategoryListView, MainCategoryDetailView,
    CompanyListCreateView, CompanyDetailView,
    SizeChartListCreateView, SizeChartDetailView,
    BannerListCreateView, BannerDetailView, ActiveBannersView,
    LowStockProductsView,
    DefaultSizeListCreateView, DefaultSizeDetailView,
    DefaultColorListCreateView, DefaultColorDetailView
)
from .cloudinary_utils import CloudinaryUploadView, CloudinaryDeleteView

urlpatterns = [
    # Public endpoints
    path('categories/', CategoryListView.as_view(), name='category_list'),
    path('categories/<uuid:pk>/', CategoryDetailView.as_view(), name='category_detail'),
    path('main-categories/', MainCategoryListView.as_view(), name='main_category_list'),
    path('products/', ProductListView.as_view(), name='product_list'),
    path('products/<uuid:pk>/', ProductDetailView.as_view(), name='product_detail'),
    path('products/featured/', FeaturedProductsView.as_view(), name='featured_products'),
    path('products/category/<uuid:category_id>/', ProductsByCategoryView.as_view(), name='products_by_category'),
    path('banners/', ActiveBannersView.as_view(), name='active_banners'),
    
    # Admin Main Categories
    path('admin/main-categories/', MainCategoryListView.as_view(), name='admin_main_category_list'),
    path('admin/main-categories/<uuid:pk>/', MainCategoryDetailView.as_view(), name='admin_main_category_detail'),
    
    # Admin Categories
    path('admin/categories/', AdminCategoryListCreateView.as_view(), name='admin_category_list'),
    path('admin/categories/<uuid:pk>/', AdminCategoryDetailView.as_view(), name='admin_category_detail'),
    
    # Admin Companies
    path('admin/companies/', CompanyListCreateView.as_view(), name='admin_company_list'),
    path('admin/companies/<uuid:pk>/', CompanyDetailView.as_view(), name='admin_company_detail'),
    
    # Admin Products
    path('admin/products/', AdminProductListView.as_view(), name='admin_product_list'),
    path('admin/products/<uuid:pk>/', AdminProductDetailView.as_view(), name='admin_product_detail'),
    path('admin/products/<uuid:pk>/toggle-status/', AdminProductToggleStatusView.as_view(), name='admin_product_toggle_status'),
    path('admin/products/<uuid:product_id>/variants/', AdminProductVariantListCreateView.as_view(), name='admin_product_variant_list'),
    path('admin/products/variants/<uuid:pk>/', AdminProductVariantDetailView.as_view(), name='admin_product_variant_detail'),
    path('admin/products/<uuid:product_id>/images/', AdminProductImageListCreateView.as_view(), name='admin_product_image_list'),
    path('admin/products/images/<uuid:pk>/', AdminProductImageDetailView.as_view(), name='admin_product_image_detail'),
    path('admin/products/low-stock/', LowStockProductsView.as_view(), name='admin_low_stock'),
    
    # Admin Size Charts
    path('admin/size-charts/', SizeChartListCreateView.as_view(), name='admin_size_chart_list'),
    path('admin/size-charts/<uuid:pk>/', SizeChartDetailView.as_view(), name='admin_size_chart_detail'),
    
    # Admin Banners
    path('admin/banners/', BannerListCreateView.as_view(), name='admin_banner_list'),
    path('admin/banners/<uuid:pk>/', BannerDetailView.as_view(), name='admin_banner_detail'),
    
    # Cloudinary Upload
    path('admin/upload/', CloudinaryUploadView.as_view(), name='cloudinary_upload'),
    path('admin/upload/delete/', CloudinaryDeleteView.as_view(), name='cloudinary_delete'),
    
    # Admin Default Sizes
    path('admin/default-sizes/', DefaultSizeListCreateView.as_view(), name='admin_default_size_list'),
    path('admin/default-sizes/<uuid:pk>/', DefaultSizeDetailView.as_view(), name='admin_default_size_detail'),
    
    # Admin Default Colors
    path('admin/default-colors/', DefaultColorListCreateView.as_view(), name='admin_default_color_list'),
    path('admin/default-colors/<uuid:pk>/', DefaultColorDetailView.as_view(), name='admin_default_color_detail'),
]
