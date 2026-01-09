import type { Product, Category } from '@/types'
import { useLanguageStore } from '@/store/languageStore'

export const getTranslatedProductName = (product: Product): string => {
  const { language } = useLanguageStore.getState()
  
  switch (language) {
    case 'hi':
      return product.name_hi
    case 'mr':
      return product.name_mr
    default:
      return product.name_en
  }
}

export const getTranslatedProductDescription = (product: Product): string => {
  const { language } = useLanguageStore.getState()
  
  switch (language) {
    case 'hi':
      return product.description_hi
    case 'mr':
      return product.description_mr
    default:
      return product.description_en
  }
}

export const getTranslatedCategoryName = (category: Category): string => {
  const { language } = useLanguageStore.getState()
  
  switch (language) {
    case 'hi':
      return category.name_hi
    case 'mr':
      return category.name_mr
    default:
      return category.name_en
  }
}
