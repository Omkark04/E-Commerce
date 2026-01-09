from django.contrib import admin
from .models import Coupon, CouponUsage, FlashSale, Notification, DeliveryAssignment, Referral


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_type', 'discount_value', 'valid_from', 'valid_until', 'is_active', 'used_count', 'usage_limit')
    list_filter = ('discount_type', 'is_active', 'valid_from', 'valid_until')
    search_fields = ('code',)


@admin.register(CouponUsage)
class CouponUsageAdmin(admin.ModelAdmin):
    list_display = ('coupon', 'user', 'order', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('coupon__code', 'user__email', 'order__order_number')


@admin.register(FlashSale)
class FlashSaleAdmin(admin.ModelAdmin):
    list_display = ('name_en', 'discount_percentage', 'start_time', 'end_time', 'is_active')
    list_filter = ('is_active', 'start_time', 'end_time')
    search_fields = ('name_en', 'name_hi', 'name_mr')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'type', 'is_read', 'created_at')
    list_filter = ('type', 'is_read', 'created_at')
    search_fields = ('title', 'user__email', 'message')


@admin.register(DeliveryAssignment)
class DeliveryAssignmentAdmin(admin.ModelAdmin):
    list_display = ('order', 'delivery_partner', 'status', 'assigned_at', 'delivered_at', 'earnings')
    list_filter = ('status', 'assigned_at')
    search_fields = ('order__order_number', 'delivery_partner__email')


@admin.register(Referral)
class ReferralAdmin(admin.ModelAdmin):
    list_display = ('referrer', 'referred', 'referral_code', 'status', 'reward_points', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('referrer__email', 'referred__email', 'referral_code')
