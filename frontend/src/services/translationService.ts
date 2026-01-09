/**
 * Translation Service
 * Uses MyMemory Translation API for free translation
 * Free tier: 1000 requests/day without API key
 * https://mymemory.translated.net/
 */

export type SupportedLanguage = 'hi' | 'mr';

interface TranslationResponse {
  responseData: {
    translatedText: string;
    match: number;
  };
  responseStatus: number;
  responseDetails?: string;
}

/**
 * Translate text from English to a target language
 * @param text - The English text to translate
 * @param targetLang - Target language code ('hi' for Hindi, 'mr' for Marathi)
 * @returns The translated text
 */
export async function translateText(
  text: string,
  targetLang: SupportedLanguage
): Promise<string> {
  if (!text.trim()) {
    return '';
  }

  const langPair = `en|${targetLang}`;
  const encodedText = encodeURIComponent(text);
  const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${langPair}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data: TranslationResponse = await response.json();

    if (data.responseStatus !== 200) {
      throw new Error(data.responseDetails || 'Translation failed');
    }

    return data.responseData.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

/**
 * Translate text to both Hindi and Marathi
 * @param text - The English text to translate
 * @returns Object with Hindi and Marathi translations
 */
export async function translateToHindiAndMarathi(
  text: string
): Promise<{ hi: string; mr: string }> {
  if (!text.trim()) {
    return { hi: '', mr: '' };
  }

  const [hi, mr] = await Promise.all([
    translateText(text, 'hi'),
    translateText(text, 'mr'),
  ]);

  return { hi, mr };
}

/**
 * Batch translate product name and description
 * @param nameEn - English product name
 * @param descriptionEn - English product description
 * @returns Translated names and descriptions in Hindi and Marathi
 */
export async function translateProductContent(
  nameEn: string,
  descriptionEn: string
): Promise<{
  name_hi: string;
  name_mr: string;
  description_hi: string;
  description_mr: string;
}> {
  const [nameTranslations, descriptionTranslations] = await Promise.all([
    translateToHindiAndMarathi(nameEn),
    translateToHindiAndMarathi(descriptionEn),
  ]);

  return {
    name_hi: nameTranslations.hi,
    name_mr: nameTranslations.mr,
    description_hi: descriptionTranslations.hi,
    description_mr: descriptionTranslations.mr,
  };
}
