import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi'
import { useLanguageStore } from '@/store/languageStore'

const translations = {
  en: {
    title: 'Visit Our Store',
    subtitle: 'Experience the elegance in person',
    storeName: 'Tenz - The Fashion World',
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
    hours: 'Store Hours',
    weekdays: 'Mon - Sat: 10:00 AM - 8:00 PM',
    sunday: 'Sunday: 11:00 AM - 6:00 PM',
    heritageTitle: 'Our Heritage',
    heritageText: 'Specializing in authentic Paithani sarees and designer kurtis, we bring you the finest traditional wear with a modern touch. Each piece is carefully curated to celebrate Indian craftsmanship.'
  },
  hi: {
    title: 'हमारे स्टोर पर आएं',
    subtitle: 'व्यक्तिगत रूप से सुंदरता का अनुभव करें',
    storeName: 'टेंज - द फैशन वर्ल्ड',
    address: 'पता',
    phone: 'फ़ोन',
    email: 'ईमेल',
    hours: 'स्टोर समय',
    weekdays: 'सोम - शनि: सुबह 10:00 - रात 8:00',
    sunday: 'रविवार: सुबह 11:00 - शाम 6:00',
    heritageTitle: 'हमारी विरासत',
    heritageText: 'प्रामाणिक पैठणी साड़ियों और डिजाइनर कुर्तियों में विशेषज्ञता के साथ, हम आधुनिक स्पर्श के साथ बेहतरीन पारंपरिक पहनावा लाते हैं। प्रत्येक टुकड़ा भारतीय शिल्प कौशल का जश्न मनाने के लिए सावधानीपूर्वक तैयार किया गया है।'
  },
  mr: {
    title: 'आमच्या स्टोअरला भेट द्या',
    subtitle: 'वैयक्तिकरित्या सुंदरतेचा अनुभव घ्या',
    storeName: 'टेंझ - द फॅशन वर्ल्ड',
    address: 'पत्ता',
    phone: 'फोन',
    email: 'ईमेल',
    hours: 'स्टोअर वेळ',
    weekdays: 'सोम - शनि: सकाळी 10:00 - रात्री 8:00',
    sunday: 'रविवार: सकाळी 11:00 - संध्याकाळी 6:00',
    heritageTitle: 'आमचा वारसा',
    heritageText: 'अस्सल पैठणी साड्या आणि डिझायनर कुर्त्यांमध्ये तज्ञ, आम्ही आधुनिक स्पर्शासह उत्कृष्ट पारंपारिक पोशाख आणतो. प्रत्येक तुकडा भारतीय कारागिरीचा उत्सव साजरा करण्यासाठी काळजीपूर्वक तयार केला आहे।'
  }
}

export default function ContactSection() {
  const { language } = useLanguageStore()
  const t = translations[language]
  
  const address = "D-702, FREEDOM TOWERS, Akashwani, Chowk, Jalna Rd, Bhanudas Nagar, Nyay Nagar, Chhatrapati Sambhajinagar, Maharashtra 431005"
  const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3752.1671086143633!2d75.34533950000001!3d19.8751644!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdba3002790f8bf%3A0xa01b126b8b454ce8!2sTENZ%20The%20Fashion%20World!5e0!3m2!1sen!2sin!4v1767640247344!5m2!1sen!2sin"

  return (
    <section className="my-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 md:p-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          {t.title}
        </h2>
        <p className="text-gray-600 text-lg">{t.subtitle}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact Information */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {t.storeName}
            </h3>

            {/* Address */}
            <div className="flex gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <FiMapPin className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{t.address}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{address}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <FiPhone className="w-6 h-6 text-pink-600" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{t.phone}</h4>
                <a href="tel:+919876543210" className="text-purple-600 hover:underline">
                  +91 98765 43210
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <FiMail className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{t.email}</h4>
                <a href="mailto:info@tenzfashion.com" className="text-purple-600 hover:underline">
                  info@tenzfashion.com
                </a>
              </div>
            </div>

            {/* Hours */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <FiClock className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{t.hours}</h4>
                <p className="text-gray-600 text-sm">{t.weekdays}</p>
                <p className="text-gray-600 text-sm">{t.sunday}</p>
              </div>
            </div>
          </div>

          {/* Heritage Message */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
            <h4 className="text-xl font-bold mb-3">{t.heritageTitle}</h4>
            <p className="text-purple-100 leading-relaxed">
              {t.heritageText}
            </p>
          </div>
        </div>

        {/* Google Map */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg h-[500px]">
          <iframe
            src={mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Tenz - The Fashion World Location"
          />
        </div>
      </div>
    </section>
  )
}
