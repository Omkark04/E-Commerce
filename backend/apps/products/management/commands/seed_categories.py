from django.core.management.base import BaseCommand
from apps.products.models import MainCategory


class Command(BaseCommand):
    help = 'Seeds default main categories'

    def handle(self, *args, **options):
        default_categories = [
            {
                'name_en': 'Men',
                'name_hi': 'पुरुष',
                'name_mr': 'पुरुष',
                'slug': 'men',
                'display_order': 1,
            },
            {
                'name_en': 'Women',
                'name_hi': 'महिला',
                'name_mr': 'महिला',
                'slug': 'women',
                'display_order': 2,
            },
            {
                'name_en': 'Boys',
                'name_hi': 'लड़के',
                'name_mr': 'मुलगे',
                'slug': 'boys',
                'display_order': 3,
            },
            {
                'name_en': 'Girls',
                'name_hi': 'लड़कियाँ',
                'name_mr': 'मुली',
                'slug': 'girls',
                'display_order': 4,
            },
            {
                'name_en': 'Children',
                'name_hi': 'बच्चे',
                'name_mr': 'मुले',
                'slug': 'children',
                'display_order': 5,
            },
        ]

        created_count = 0
        for category_data in default_categories:
            category, created = MainCategory.objects.get_or_create(
                slug=category_data['slug'],
                defaults=category_data
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created: {category.name_en}'))
            else:
                self.stdout.write(f'Already exists: {category.name_en}')

        self.stdout.write(self.style.SUCCESS(f'\nSeeding complete! Created {created_count} new categories.'))
