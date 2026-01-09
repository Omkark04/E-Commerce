from django.contrib import admin
from .models import CartItem, Address, Order, OrderItem, OrderTracking, RecentlyViewed


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'variant', 'quantity', 'price_at_purchase', 'discount_applied')


class OrderTrackingInline(admin.TabularInline):
    model = OrderTracking
    extra = 0
    readonly_fields = ('status', 'location', 'notes', 'updated_by', 'created_at')


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'variant', 'quantity', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'product__name_en')


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'city', 'state', 'pincode', 'is_default', 'address_type')
    list_filter = ('address_type', 'is_default', 'state')
    search_fields = ('user__email', 'full_name', 'city', 'pincode')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'user', 'status', 'payment_method', 'payment_status', 'final_amount', 'created_at')
    list_filter = ('status', 'payment_method', 'payment_status', 'created_at')
    search_fields = ('order_number', 'user__email')
    readonly_fields = ('order_number', 'created_at', 'updated_at')
    inlines = [OrderItemInline, OrderTrackingInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'variant', 'quantity', 'price_at_purchase')
    list_filter = ('created_at',)
    search_fields = ('order__order_number', 'product__name_en')


@admin.register(OrderTracking)
class OrderTrackingAdmin(admin.ModelAdmin):
    list_display = ('order', 'status', 'location', 'updated_by', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('order__order_number',)


@admin.register(RecentlyViewed)
class RecentlyViewedAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'viewed_at')
    list_filter = ('viewed_at',)
    search_fields = ('user__email', 'product__name_en')
