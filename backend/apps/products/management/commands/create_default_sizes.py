from django.core.management.base import BaseCommand
from apps.products.models import Category, DefaultSize, DefaultColor


class Command(BaseCommand):
    help = 'Create default sizes and colors for product categories'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating default sizes and colors...')
        
        # Create default colors
        colors = [
            {'name': 'Black', 'color_code': '#000000', 'display_order': 1},
            {'name': 'White', 'color_code': '#FFFFFF', 'display_order': 2},
            {'name': 'Red', 'color_code': '#FF0000', 'display_order': 3},
            {'name': 'Blue', 'color_code': '#0000FF', 'display_order': 4},
            {'name': 'Green', 'color_code': '#008000', 'display_order': 5},
            {'name': 'Yellow', 'color_code': '#FFFF00', 'display_order': 6},
            {'name': 'Pink', 'color_code': '#FFC0CB', 'display_order': 7},
            {'name': 'Purple', 'color_code': '#800080', 'display_order': 8},
            {'name': 'Orange', 'color_code': '#FFA500', 'display_order': 9},
            {'name': 'Brown', 'color_code': '#A52A2A', 'display_order': 10},
            {'name': 'Gray', 'color_code': '#808080', 'display_order': 11},
            {'name': 'Navy', 'color_code': '#000080', 'display_order': 12},
            {'name': 'Maroon', 'color_code': '#800000', 'display_order': 13},
            {'name': 'Beige', 'color_code': '#F5F5DC', 'display_order': 14},
            {'name': 'Gold', 'color_code': '#FFD700', 'display_order': 15},
        ]
        
        for color_data in colors:
            color, created = DefaultColor.objects.get_or_create(
                name=color_data['name'],
                defaults={
                    'color_code': color_data['color_code'],
                    'display_order': color_data['display_order']
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created color: {color.name}'))
        
        # Create default sizes for different categories
        size_mappings = {
            'Shirts': [
                ('XS', 'Extra Small', 1),
                ('S', 'Small', 2),
                ('M', 'Medium', 3),
                ('L', 'Large', 4),
                ('XL', 'Extra Large', 5),
                ('XXL', '2XL', 6),
                ('XXXL', '3XL', 7),
            ],
            'Paithani': [
                ('One Size', 'One Size', 1),
            ],
            'Sarees': [
                ('One Size', 'One Size', 1),
            ],
            'Pants': [
                ('28', '28', 1),
                ('30', '30', 2),
                ('32', '32', 3),
                ('34', '34', 4),
                ('36', '36', 5),
                ('38', '38', 6),
                ('40', '40', 7),
                ('42', '42', 8),
            ],
            'Kids': [
                ('2-3Y', '2-3 Years', 1),
                ('4-5Y', '4-5 Years', 2),
                ('6-7Y', '6-7 Years', 3),
                ('8-9Y', '8-9 Years', 4),
                ('10-11Y', '10-11 Years', 5),
                ('12-13Y', '12-13 Years', 6),
            ],
        }
        
        for category_name, sizes in size_mappings.items():
            try:
                # Try to find category by name_en
                category = Category.objects.filter(name_en__icontains=category_name).first()
                
                if not category:
                    self.stdout.write(self.style.WARNING(f'Category "{category_name}" not found, skipping sizes'))
                    continue
                
                for size_code, size_label, display_order in sizes:
                    size, created = DefaultSize.objects.get_or_create(
                        category=category,
                        size_code=size_code,
                        defaults={
                            'size_label': size_label,
                            'display_order': display_order
                        }
                    )
                    if created:
                        self.stdout.write(self.style.SUCCESS(
                            f'Created size: {category.name_en} - {size_label} ({size_code})'
                        ))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error creating sizes for {category_name}: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS('Successfully created default sizes and colors!'))
