import uuid
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Coupon(models.Model):
    """Discount coupon."""
    
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=15, choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    min_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_discount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    usage_limit = models.PositiveIntegerField(blank=True, null=True)
    used_count = models.PositiveIntegerField(default=0)
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.code
    
    def is_valid(self):
        from django.utils import timezone
        now = timezone.now()
        if not self.is_active:
            return False
        if now < self.valid_from or now > self.valid_until:
            return False
        if self.usage_limit and self.used_count >= self.usage_limit:
            return False
        return True


class CouponUsage(models.Model):
    """Track coupon usage per user."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    coupon = models.ForeignKey(
        Coupon, 
        on_delete=models.CASCADE, 
        related_name='usages'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='coupon_usages'
    )
    order = models.ForeignKey(
        'orders.Order', 
        on_delete=models.CASCADE, 
        related_name='coupon_usages'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.email} used {self.coupon.code}"


class FlashSale(models.Model):
    """Flash sale with time-limited discounts."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name_en = models.CharField(max_length=200)
    name_hi = models.CharField(max_length=200, blank=True)
    name_mr = models.CharField(max_length=200, blank=True)
    product_ids = models.JSONField(default=list, blank=True)
    discount_percentage = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name_en
    
    def is_live(self):
        from django.utils import timezone
        now = timezone.now()
        return self.is_active and self.start_time <= now <= self.end_time


class Notification(models.Model):
    """User notification."""
    
    TYPE_CHOICES = [
        ('order', 'Order'),
        ('offer', 'Offer'),
        ('system', 'System'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='notifications'
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    is_read = models.BooleanField(default=False)
    action_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.email}"


class DeliveryAssignment(models.Model):
    """Delivery partner assignment for orders."""
    
    STATUS_CHOICES = [
        ('assigned', 'Assigned'),
        ('picked_up', 'Picked Up'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        'orders.Order', 
        on_delete=models.CASCADE, 
        related_name='delivery_assignments'
    )
    delivery_partner = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='assignments'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    picked_up_at = models.DateTimeField(blank=True, null=True)
    delivered_at = models.DateTimeField(blank=True, null=True)
    proof_of_delivery_url = models.URLField(blank=True, null=True)
    earnings = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='assigned')
    
    def __str__(self):
        return f"Delivery for {self.order.order_number}"


class Referral(models.Model):
    """User referral program."""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    referrer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='referrals_made'
    )
    referred = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='referrals_received'
    )
    referral_code = models.CharField(max_length=50)
    reward_points = models.IntegerField(default=0)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.referrer.email} referred {self.referred.email}"
