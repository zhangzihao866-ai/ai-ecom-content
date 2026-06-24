'use client'

import { useState, useRef } from 'react'

interface GeneratedCopy {
  title: string
  subtitle: string
  description: string
  bulletPoints: string[]
  metaDescription: string
  seoKeywords: string[]
  tone: string
}

const PLATFORMS = ['Shopify', 'Etsy', 'Amazon', 'eBay']
const TONES = ['Professional', 'Luxury', 'Playful', 'Minimalist', 'Technical', 'Friendly', 'Urgent']

const DEMO_PRODUCTS = [
  { name: 'Bamboo Standing Desk', features: 'Adjustable height, eco-friendly, 60x30 inch, cable management tray' },
  { name: 'Wireless Earbuds Pro', features: 'Active noise cancellation, 36hr battery, IPX5 waterproof, Bluetooth 5.3' },
  { name: 'Organic Face Serum', features: 'Vitamin C + Hyaluronic Acid, anti-aging, cruelty-free, 30ml' },
]

export default function Home() {
  const [product, setProduct] = useState('')
  const [features, setFeatures] = useState('')
  const [platform, setPlatform] = useState('Shopify')
  const [tone, setTone] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GeneratedCopy | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')
  const resultRef = useRef<HTMLDivElement>(null)

  const handleGenerate = async () => {
    if (!product.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, features, platform, tone: tone || undefined }),
      })

      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Failed')
      const parsed = data.data
      setResult(parsed)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemo = (demo: typeof DEMO_PRODUCTS[number]) => {
    setProduct(demo.name)
    setFeatures(demo.features)
  }

  const copyText = (label: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(''), 2000)
  }

  const copyAll = () => {
    if (!result) return
    const all = `TITLE: ${result.title}

SUBTITLE: ${result.subtitle}

DESCRIPTION:
${result.description.replace(/<[^>]*>/g, '')}

KEY FEATURES:
${result.bulletPoints.map(b => '• ' + b).join('\n')}

META DESCRIPTION:
${result.metaDescription}

SEO KEYWORDS: ${result.seoKeywords.join(', ')}`
    navigator.clipboard.writeText(all)
    setCopied('all')
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <main className="min-h-[100dvh] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#e8e6e1] bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#7c5cfc] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <span className="font-semibold text-sm tracking-tight">EcomAI</span>
            <span className="text-xs text-gray-400 ml-1 hidden sm:inline">MVP</span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Feedback →
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-12 md:py-20 max-w-3xl mx-auto w-full text-center">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter leading-tight mb-4">
          AI Product Descriptions <br className="hidden sm:block" />
          <span className="text-[#7c5cfc]">That Actually Sell</span>
        </h1>
        <p className="text-gray-500 text-base md:text-lg mb-8 max-w-xl mx-auto">
          Generate high-converting, SEO-optimized product copy for Shopify, Etsy &amp; Amazon.
          <br className="hidden sm:block" />
          <span className="text-gray-400 text-sm">Free while in MVP. No sign-up required.</span>
        </p>

        {/* Demo shortcuts */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <span className="text-xs text-gray-400 self-center mr-1">Try an example:</span>
          {DEMO_PRODUCTS.map((demo) => (
            <button
              key={demo.name}
              onClick={() => handleDemo(demo)}
              className="text-xs px-3 py-1.5 rounded-full border border-[#e8e6e1] hover:border-[#7c5cfc] hover:text-[#7c5cfc] transition-colors cursor-pointer"
            >
              {demo.name}
            </button>
          ))}
        </div>

        {/* Input form */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8e6e1] p-6 md:p-8 text-left">
          {/* Product name */}
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Product Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="e.g. Bamboo Standing Desk"
            className="w-full px-4 py-3 rounded-xl border border-[#e8e6e1] focus:border-[#7c5cfc] focus:ring-2 focus:ring-[#7c5cfc]/10 outline-none transition-all text-sm mb-4"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />

          {/* Features */}
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Key Features / Selling Points
          </label>
          <textarea
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            placeholder="e.g. Adjustable height, eco-friendly bamboo, cable management tray, 5-year warranty"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-[#e8e6e1] focus:border-[#7c5cfc] focus:ring-2 focus:ring-[#7c5cfc]/10 outline-none transition-all text-sm resize-none mb-4"
          />

          {/* Platform & Tone row */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Platform</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                      platform === p
                        ? 'border-[#7c5cfc] bg-[#7c5cfc]/5 text-[#7c5cfc] font-medium'
                        : 'border-[#e8e6e1] text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tone (optional)</label>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(tone === t ? '' : t)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                      tone === t
                        ? 'border-[#7c5cfc] bg-[#7c5cfc]/5 text-[#7c5cfc] font-medium'
                        : 'border-[#e8e6e1] text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !product.trim()}
            className="w-full py-3.5 rounded-xl bg-[#7c5cfc] hover:bg-[#6a4de6] disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              'Generate Product Copy'
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm text-left">
            {error}
          </div>
        )}
      </section>

      {/* Loading skeleton */}
      {loading && (
        <section className="px-6 pb-20 max-w-3xl mx-auto w-full">
          <div className="space-y-3">
            <div className="skeleton h-6 w-3/4" />
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-24 w-full mt-4" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
          </div>
        </section>
      )}

      {/* Results */}
      {result && (
        <section ref={resultRef} className="px-6 pb-20 max-w-3xl mx-auto w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-[#e8e6e1] overflow-hidden">
            {/* Result header */}
            <div className="px-6 py-4 border-b border-[#e8e6e1] flex items-center justify-between bg-[#faf9f7]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs font-medium text-gray-500">Generated for {platform}</span>
                {result.tone && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#7c5cfc]/10 text-[#7c5cfc]">
                    {result.tone}
                  </span>
                )}
              </div>
              <button
                onClick={copyAll}
                className="text-xs px-3 py-1.5 rounded-lg border border-[#e8e6e1] hover:bg-white transition-colors cursor-pointer text-gray-600"
              >
                {copied === 'all' ? 'Copied!' : 'Copy All'}
              </button>
            </div>

            {/* Title */}
            <div className="px-6 pt-5 pb-2">
              <div className="flex items-start justify-between group">
                <h2 className="text-xl font-bold tracking-tight pr-2">{result.title}</h2>
                <button
                  onClick={() => copyText('title', result.title)}
                  className="shrink-0 text-xs text-gray-300 hover:text-gray-500 transition-colors cursor-pointer mt-1 opacity-0 group-hover:opacity-100"
                >
                  {copied === 'title' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-gray-500 text-sm mt-1">{result.subtitle}</p>
            </div>

            {/* Description */}
            <div className="px-6 py-3 relative group">
              <button
                onClick={() =>
                  copyText('desc', result.description.replace(/<[^>]*>/g, ''))
                }
                className="absolute top-1 right-6 text-xs text-gray-300 hover:text-gray-500 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
              >
                {copied === 'desc' ? 'Copied' : 'Copy'}
              </button>
              <div
                className="prose prose-sm max-w-none text-gray-700 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1"
                dangerouslySetInnerHTML={{ __html: result.description }}
              />
            </div>

            {/* Bullet Points */}
            <div className="px-6 py-3 border-t border-[#e8e6e1]">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Key Features</h3>
              <ul className="space-y-2">
                {result.bulletPoints.map((bp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-[#7c5cfc] mt-0.5 shrink-0">&#x2022;</span>
                    {bp}
                  </li>
                ))}
              </ul>
            </div>

            {/* SEO section */}
            <div className="px-6 py-4 border-t border-[#e8e6e1] bg-[#faf9f7] space-y-3">
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Meta Description</h3>
                <div className="flex items-start justify-between group">
                  <p className="text-sm text-gray-600">{result.metaDescription}</p>
                  <button
                    onClick={() => copyText('meta', result.metaDescription)}
                    className="shrink-0 text-xs text-gray-300 hover:text-gray-500 transition-colors cursor-pointer ml-2 opacity-0 group-hover:opacity-100"
                  >
                    {copied === 'meta' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">SEO Keywords</h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.seoKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-full bg-white border border-[#e8e6e1] text-gray-600"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feedback CTA */}
          <div className="mt-6 p-4 rounded-xl bg-[#7c5cfc]/5 border border-[#7c5cfc]/10 text-center">
            <p className="text-sm text-gray-600">
              How&apos;s the result?{' '}
              <a href="#" className="text-[#7c5cfc] font-medium hover:underline">
                Send feedback
              </a>
              {' '}or share on{' '}
              <a href="#" className="text-[#7c5cfc] font-medium hover:underline">
                Reddit
              </a>
            </p>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-[#e8e6e1] py-6 px-6">
        <div className="max-w-5xl mx-auto text-center text-xs text-gray-400">
          EcomAI MVP &middot; Free while in testing &middot; Powered by DeepSeek
        </div>
      </footer>
    </main>
  )
}
