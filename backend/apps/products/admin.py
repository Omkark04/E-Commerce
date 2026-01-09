from django.contrib import admin
from .models import Category, Product, ProductVariant, ProductImage, SizeChart


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name_en', 'slug', 'display_order', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name_en', 'name_hi', 'name_mr')
    prepopulated_fields = {'slug': ('name_en',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name_en', 'category', 'base_price', 'discount_percentage', 'is_featured', 'is_active', 'total_sales')
    list_filter = ('category', 'is_featured', 'is_active')
    search_fields = ('name_en', 'name_hi', 'name_mr', 'description_en')
    inlines = [ProductVariantInline, ProductImageInline]


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ('product', 'size', 'color', 'sku', 'stock_quantity', 'additional_price')
    list_filter = ('size', 'color')
    search_fields = ('product__name_en', 'sku')


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'display_order', 'is_primary')
    list_filter = ('is_primary',)


@admin.register(SizeChart)
class SizeChartAdmin(admin.ModelAdmin):
    list_display = ('category', 'created_at')
