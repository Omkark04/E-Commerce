import uuid
from django.db import models
from django.utils.text import slugify


def generate_product_code():
    """Generate a unique product code."""
    return f"PROD-{uuid.uuid4().hex[:8].upper()}"


class MainCategory(models.Model):
    """Main category (Men, Women, Boys, Girls, Children)."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name_en = models.CharField(max_length=100)
    name_hi = models.CharField(max_length=100, blank=True)
    name_mr = models.CharField(max_length=100, blank=True)
    slug = models.SlugField(unique=True, max_length=120)
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'Main Categories'
        ordering = ['display_order', 'name_en']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name_en)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name_en


class Category(models.Model):
    """Product category with multilingual support."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    main_category = models.ForeignKey(
        MainCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='categories'
    )
    name_en = models.CharField(max_length=200)
    name_hi = models.CharField(max_length=200, blank=True)
    name_mr = models.CharField(max_length=200, blank=True)
    slug = models.SlugField(unique=True, max_length=250)
    image_url = models.URLField(blank=True, null=True)
    cloudinary_public_id = models.CharField(max_length=255, blank=True, null=True)
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['display_order', 'name_en']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name_en)
        super().save(*args, **kwargs)
    
    def __str__(self):
        if self.main_category:
            return f"{self.main_category.name_en} > {self.name_en}"
        return self.name_en


class Company(models.Model):
    """Product company/brand."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True)
    logo_url = models.URLField(blank=True, null=True)
    cloudinary_public_id = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'Companies'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Product(models.Model):
    """Product with multilingual support."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product_code = models.CharField(max_length=50, unique=True, default=generate_product_code)
    name_en = models.CharField(max_length=500)
    name_hi = models.CharField(max_length=500, blank=True)
    name_mr = models.CharField(max_length=500, blank=True)
    description_en = models.TextField(blank=True)
    description_hi = models.TextField(blank=True)
    description_mr = models.TextField(blank=True)
    main_category = models.ForeignKey(
        MainCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products'
    )
    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='products'
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products'
    )
    base_price = models.IntegerField()  # Changed from DecimalField to IntegerField for whole numbers
    discount_percentage = models.IntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_new_arrival = models.BooleanField(default=False)
    brand = models.CharField(max_length=100, blank=True, default='')
    total_views = models.IntegerField(default=0)
    total_sales = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.product_code} - {self.name_en}"
    
    @property
    def discounted_price(self):
        if self.discount_percentage > 0:
            discount = (self.base_price * self.discount_percentage) / 100
            return self.base_price - discount
        return self.base_price
    
    @property
    def total_stock(self):
        return sum(v.stock_quantity for v in self.variants.all())
    
    @property
    def is_low_stock(self):
        from django.conf import settings
        return self.total_stock <= getattr(settings, 'LOW_STOCK_THRESHOLD', 10)


class ProductVariant(models.Model):
    """Product variant (size, color combinations)."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE, 
        related_name='variants'
    )
    size = models.CharField(max_length=50)
    color = models.CharField(max_length=50)
    color_code = models.CharField(max_length=10, blank=True, null=True)
    sku = models.CharField(max_length=100, unique=True)
    stock_quantity = models.IntegerField(default=0)
    additional_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    image_urls = models.JSONField(default=list, blank=True)
    cloudinary_public_ids = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['size', 'color']
    
    def __str__(self):
        return f"{self.product.name_en} - {self.size}/{self.color}"
    
    @property
    def total_price(self):
        return self.product.base_price + self.additional_price
    
    @property
    def is_low_stock(self):
        from django.conf import settings
        return self.stock_quantity <= getattr(settings, 'LOW_STOCK_THRESHOLD', 10)


class ProductImage(models.Model):
    """Product images."""
    
    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE, 
        related_name='images'
    )
    variant = models.ForeignKey(
        ProductVariant, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='images'
    )
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES, default='image')
    image_url = models.URLField()
    cloudinary_public_id = models.CharField(max_length=255, blank=True, null=True)
    display_order = models.IntegerField(default=0)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['display_order']
    
    def __str__(self):
        return f"{self.media_type.title()} for {self.product.name_en}"


class SizeChart(models.Model):
    """Size chart for a category."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    main_category = models.ForeignKey(
        MainCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='size_charts'
    )
    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='size_charts'
    )
    # JSON structure: {"sizes": ["S", "M", "L"], "metrics": [{"name": "Chest", "values": {"S": 36, "M": 38, "L": 40}}]}
    measurements = models.JSONField()
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['title']
    
    def __str__(self):
        return self.title


class Banner(models.Model):
    """Homepage/promotional banners."""
    
    POSITION_CHOICES = [
        ('hero', 'Hero Slider'),
        ('sidebar', 'Sidebar'),
        ('popup', 'Popup'),
        ('category', 'Category Page'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    image_url = models.URLField()
    cloudinary_public_id = models.CharField(max_length=255, blank=True, null=True)
    link_url = models.URLField(blank=True, null=True)
    position = models.CharField(max_length=20, choices=POSITION_CHOICES, default='hero')
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['position', 'display_order']
    
    def __str__(self):
        return f"{self.title} ({self.position})"
    
    def is_live(self):
        from django.utils import timezone
        now = timezone.now()
        if self.start_date and now < self.start_date:
            return False
        if self.end_date and now > self.end_date:
            return False
        return self.is_active


class DefaultSize(models.Model):
    """Predefined sizes for different product categories."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='default_sizes',
        help_text='Category this size applies to (e.g., Shirts, Sarees)'
    )
    size_code = models.CharField(
        max_length=20,
        help_text='Size code (e.g., S, M, L, XL, 32, 34, One Size)'
    )
    size_label = models.CharField(
        max_length=100,
        help_text='Display label (e.g., Small, Medium, Large)'
    )
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['category', 'display_order', 'size_code']
        unique_together = ['category', 'size_code']
    
    def __str__(self):
        return f"{self.category.name_en} - {self.size_label} ({self.size_code})"


class DefaultColor(models.Model):
    """Predefined colors for product variants."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)
    color_code = models.CharField(
        max_length=7,
        help_text='Hex color code (e.g., #FF0000)'
    )
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['display_order', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.color_code})"
