from rest_framework import serializers
from .models import MainCategory, Category, Company, Product, ProductVariant, ProductImage, SizeChart, Banner, DefaultSize, DefaultColor


class MainCategorySerializer(serializers.ModelSerializer):
    """Serializer for main categories."""
    
    class Meta:
        model = MainCategory
        fields = ('id', 'name_en', 'name_hi', 'name_mr', 'slug', 'display_order', 'is_active', 'created_at')
        read_only_fields = ('id', 'created_at')


class CompanySerializer(serializers.ModelSerializer):
    """Serializer for companies/brands."""
    
    class Meta:
        model = Company
        fields = ('id', 'name', 'logo_url', 'cloudinary_public_id', 'is_active', 'created_at')
        read_only_fields = ('id', 'created_at')


class CategorySerializer(serializers.ModelSerializer):
    """Full category serializer."""
    
    main_category = MainCategorySerializer(read_only=True)
    main_category_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Category
        fields = (
            'id', 'main_category', 'main_category_id', 'name_en', 'name_hi', 'name_mr', 'slug', 
            'image_url', 'cloudinary_public_id', 'display_order', 'is_active', 'created_at'
        )
        read_only_fields = ('id', 'slug', 'created_at')
    
    def create(self, validated_data):
        main_category_id = validated_data.pop('main_category_id', None)
        if main_category_id:
            validated_data['main_category'] = MainCategory.objects.get(id=main_category_id)
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        main_category_id = validated_data.pop('main_category_id', None)
        if main_category_id:
            validated_data['main_category'] = MainCategory.objects.get(id=main_category_id)
        return super().update(instance, validated_data)


class CategoryListSerializer(serializers.ModelSerializer):
    """Minimal category serializer for nested use."""
    
    main_category_name = serializers.CharField(source='main_category.name_en', read_only=True)
    
    class Meta:
        model = Category
        fields = ('id', 'name_en', 'name_hi', 'name_mr', 'slug', 'image_url', 'main_category_name')


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for product images."""
    
    class Meta:
        model = ProductImage
        fields = ('id', 'media_type', 'image_url', 'cloudinary_public_id', 'display_order', 'is_primary', 'variant_id')
        read_only_fields = ('id',)


class ProductVariantSerializer(serializers.ModelSerializer):
    """Serializer for product variants."""
    
    is_low_stock = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = ProductVariant
        fields = (
            'id', 'size', 'color', 'color_code', 'sku', 
            'stock_quantity', 'additional_price', 'image_urls', 
            'cloudinary_public_ids', 'is_low_stock', 'created_at'
        )
        read_only_fields = ('id', 'created_at')


class ProductListSerializer(serializers.ModelSerializer):
    """Serializer for product list view."""
    
    main_category = MainCategorySerializer(read_only=True)
    category = CategoryListSerializer(read_only=True)
    company = CompanySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    discounted_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_stock = serializers.IntegerField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Product
        fields = (
            'id', 'product_code', 'name_en', 'name_hi', 'name_mr', 
            'base_price', 'discount_percentage', 'discounted_price',
            'is_featured', 'is_active', 'main_category', 'category', 'company',
            'images', 'variants', 'total_stock', 'is_low_stock',
            'total_views', 'total_sales', 'created_at'
        )


class ProductDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single product view."""
    
    main_category = MainCategorySerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    company = CompanySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    discounted_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_stock = serializers.IntegerField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Product
        fields = (
            'id', 'product_code', 'name_en', 'name_hi', 'name_mr',
            'description_en', 'description_hi', 'description_mr',
            'base_price', 'discount_percentage', 'discounted_price',
            'is_featured', 'is_active', 'main_category', 'category', 'company',
            'images', 'variants', 'total_stock', 'is_low_stock',
            'total_views', 'total_sales', 'created_at', 'updated_at'
        )


class AdminProductListSerializer(serializers.ModelSerializer):
    """Serializer for admin product list view with stock calculation."""
    
    main_category = MainCategorySerializer(read_only=True)
    category = CategoryListSerializer(read_only=True)
    company = CompanySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    discounted_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_stock = serializers.SerializerMethodField()
    is_low_stock = serializers.BooleanField(read_only=True)
    
    def get_total_stock(self, obj):
        """Calculate total stock from all variants."""
        return sum(v.stock_quantity for v in obj.variants.all())
    
    class Meta:
        model = Product
        fields = (
            'id', 'product_code', 'name_en', 'name_hi', 'name_mr',
            'base_price', 'discount_percentage', 'discounted_price', 'brand',
            'is_featured', 'is_active', 'is_new_arrival',
            'main_category', 'main_category_id', 'category', 'category_id', 'company',
            'images', 'variants', 'total_stock', 'is_low_stock', 'total_sales', 'created_at'
        )



class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating products."""
    
    main_category_id = serializers.UUIDField(required=False, allow_null=True)
    category_id = serializers.UUIDField(required=False, allow_null=True)
    company_id = serializers.UUIDField(required=False, allow_null=True)
    stock_quantity = serializers.IntegerField(required=False, write_only=True, default=0)
    images = serializers.ListField(child=serializers.URLField(), required=False, write_only=True)
    videos = serializers.ListField(child=serializers.URLField(), required=False, write_only=True)
    variants = serializers.ListField(required=False, write_only=True)
    
    class Meta:
        model = Product
        fields = (
            'product_code', 'name_en', 'name_hi', 'name_mr',
            'description_en', 'description_hi', 'description_mr',
            'main_category_id', 'category_id', 'company_id',
            'base_price', 'discount_percentage', 'stock_quantity', 'brand', 'images', 'videos', 'variants',
            'is_featured', 'is_active', 'is_new_arrival'
        )
        read_only_fields = ('product_code',)
    
    def create(self, validated_data):
        main_category_id = validated_data.pop('main_category_id', None)
        category_id = validated_data.pop('category_id', None)
        company_id = validated_data.pop('company_id', None)
        stock_quantity = validated_data.pop('stock_quantity', 0)
        images = validated_data.pop('images', [])
        videos = validated_data.pop('videos', [])
        variants_data = validated_data.pop('variants', [])
        
        if main_category_id:
            validated_data['main_category'] = MainCategory.objects.get(id=main_category_id)
        if category_id:
            validated_data['category'] = Category.objects.get(id=category_id)
        if company_id:
            validated_data['company'] = Company.objects.get(id=company_id)
        
        product = super().create(validated_data)
        
        # Create product images
        from .models import ProductImage, ProductVariant
        for index, image_url in enumerate(images):
            ProductImage.objects.create(
                product=product,
                image_url=image_url,
                display_order=index,
                is_primary=(index == 0)
            )
        
        # Create product videos as images (with video URL)
        for index, video_url in enumerate(videos):
            ProductImage.objects.create(
                product=product,
                image_url=video_url,
                display_order=len(images) + index,
                is_primary=False
            )
        
        # Create variants if provided
        if variants_data:
            for variant_data in variants_data:
                # Handle image_url - convert to list for image_urls field
                image_url = variant_data.get('image_url', '')
                image_urls = [image_url] if image_url else []
                
                ProductVariant.objects.create(
                    product=product,
                    sku=variant_data.get('sku', ''),
                    color=variant_data.get('color', ''),
                    size=variant_data.get('size', ''),
                    stock_quantity=variant_data.get('stock_quantity', 0),
                    additional_price=variant_data.get('additional_price', 0),
                    image_urls=image_urls
                )
        # Create default variant if stock_quantity is provided and no variants
        elif stock_quantity > 0:
            ProductVariant.objects.create(
                product=product,
                sku=f"{product.product_code}-DEFAULT",
                color="Default",
                size="Default",
                stock_quantity=stock_quantity,
                additional_price=0
            )
        
        return product
    
    def update(self, instance, validated_data):
        main_category_id = validated_data.pop('main_category_id', None)
        category_id = validated_data.pop('category_id', None)
        company_id = validated_data.pop('company_id', None)
        images = validated_data.pop('images', None)
        videos = validated_data.pop('videos', None)
        variants_data = validated_data.pop('variants', None)
        
        if main_category_id:
            validated_data['main_category'] = MainCategory.objects.get(id=main_category_id)
        if category_id:
            validated_data['category'] = Category.objects.get(id=category_id)
        if company_id:
            validated_data['company'] = Company.objects.get(id=company_id)
        
        # Update basic fields
        instance = super().update(instance, validated_data)
        
        # Update images if provided
        if images is not None:
            from .models import ProductImage, ProductVariant
            # Delete existing images
            instance.images.all().delete()
            # Create new images
            for index, image_url in enumerate(images):
                ProductImage.objects.create(
                    product=instance,
                    image_url=image_url,
                    display_order=index,
                    is_primary=(index == 0)
                )
        
        # Update videos if provided
        if videos is not None:
            from .models import ProductImage
            # Get current image count for proper ordering
            current_image_count = instance.images.filter(image_url__icontains='.jpg').count() + \
                                instance.images.filter(image_url__icontains='.png').count() + \
                                instance.images.filter(image_url__icontains='.webp').count()
            
            # Delete existing videos (images with video extensions)
            instance.images.filter(image_url__icontains='video').delete()
            instance.images.filter(image_url__icontains='.mp4').delete()
            instance.images.filter(image_url__icontains='.webm').delete()
            
            # Create new videos
            for index, video_url in enumerate(videos):
                ProductImage.objects.create(
                    product=instance,
                    image_url=video_url,
                    display_order=current_image_count + index,
                    is_primary=False
                )
        
        # Update variants if provided
        if variants_data is not None:
            # Delete all existing variants
            instance.variants.all().delete()
            # Create new variants
            for variant_data in variants_data:
                # Handle image_url - convert to list for image_urls field
                image_url = variant_data.get('image_url', '')
                image_urls = [image_url] if image_url else []
                
                ProductVariant.objects.create(
                    product=instance,
                    sku=variant_data.get('sku', ''),
                    color=variant_data.get('color', ''),
                    size=variant_data.get('size', ''),
                    stock_quantity=variant_data.get('stock_quantity', 0),
                    additional_price=variant_data.get('additional_price', 0),
                    image_urls=image_urls
                )
        
        return instance


class SizeChartSerializer(serializers.ModelSerializer):
    """Serializer for size charts."""
    
    category = CategoryListSerializer(read_only=True)
    category_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = SizeChart
        fields = (
            'id', 'title', 'category', 'category_id', 'measurements', 
            'is_default', 'is_active', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        category_id = validated_data.pop('category_id', None)
        
        if category_id:
            validated_data['category'] = Category.objects.get(id=category_id)
        
        return super().create(validated_data)


class BannerSerializer(serializers.ModelSerializer):
    """Serializer for banners."""
    
    is_live = serializers.SerializerMethodField()
    
    class Meta:
        model = Banner
        fields = (
            'id', 'title', 'image_url', 'cloudinary_public_id', 
            'link_url', 'position', 'display_order', 'is_active',
            'start_date', 'end_date', 'is_live', 'created_at'
        )
        read_only_fields = ('id', 'created_at')
    
    def get_is_live(self, obj):
        return obj.is_live()


# Admin serializers with additional fields

class AdminProductListSerializer(serializers.ModelSerializer):
    """Admin serializer for product list with stock info."""
    
    main_category = MainCategorySerializer(read_only=True)
    category = CategoryListSerializer(read_only=True)
    company = CompanySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    total_stock = serializers.IntegerField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    category_id = serializers.UUIDField(source='category.id', read_only=True, allow_null=True)
    main_category_id = serializers.UUIDField(source='main_category.id', read_only=True, allow_null=True)
    
    class Meta:
        model = Product
        fields = (
            'id', 'product_code', 'name_en', 'name_hi', 'name_mr',
            'base_price', 'discount_percentage', 'is_featured', 'is_active',
            'main_category', 'main_category_id', 'category', 'category_id', 'company', 'images', 
            'total_stock', 'is_low_stock', 'total_sales', 'created_at'
        )


class DefaultSizeSerializer(serializers.ModelSerializer):
    """Serializer for default sizes."""
    
    category_name = serializers.CharField(source='category.name_en', read_only=True)
    
    class Meta:
        model = DefaultSize
        fields = ('id', 'category', 'category_name', 'size_code', 'size_label', 'display_order', 'is_active', 'created_at')
        read_only_fields = ('id', 'created_at')


class DefaultColorSerializer(serializers.ModelSerializer):
    """Serializer for default colors."""
    
    class Meta:
        model = DefaultColor
        fields = ('id', 'name', 'color_code', 'display_order', 'is_active', 'created_at')
        read_only_fields = ('id', 'created_at')
