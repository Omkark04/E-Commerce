import { useState } from 'react'
import { Mail, Send } from 'lucide-react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsSuccess(true)
    setEmail('')
    setIsSubmitting(false)

    // Reset success message after 3 seconds
    setTimeout(() => setIsSuccess(false), 3000)
  }

  return (
    <section className="my-16">
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-3xl p-8 md:p-12">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stay Updated with Latest Collections
          </h2>
          <p className="text-lg text-purple-100 mb-8">
            Subscribe to our newsletter and get <span className="font-bold text-yellow-300">10% off</span> on your first order
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white/60 transition"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    Subscribe
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Success Message */}
            {isSuccess && (
              <div className="mt-4 p-3 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg text-white text-sm">
                ✓ Successfully subscribed! Check your email for the discount code.
              </div>
            )}
          </form>

          {/* Privacy Note */}
          <p className="mt-6 text-sm text-purple-100">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  )
}
