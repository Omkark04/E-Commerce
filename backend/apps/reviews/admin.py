from django.contrib import admin
from .models import Review, ReviewVote


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'status', 'is_verified_purchase', 'helpful_count', 'created_at')
    list_filter = ('status', 'rating', 'is_verified_purchase', 'created_at')
    search_fields = ('product__name_en', 'user__email', 'title', 'comment')
    readonly_fields = ('helpful_count', 'created_at', 'updated_at')


@admin.register(ReviewVote)
class ReviewVoteAdmin(admin.ModelAdmin):
    list_display = ('review', 'user', 'is_helpful', 'created_at')
    list_filter = ('is_helpful', 'created_at')
    search_fields = ('review__product__name_en', 'user__email')
