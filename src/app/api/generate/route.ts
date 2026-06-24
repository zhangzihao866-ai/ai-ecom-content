import { NextResponse } from 'next/server'

const DEEPSEEK_BASE = 'https://api.deepseek.com/v1/chat/completions'

const SYSTEM_PROMPT = `You are an expert e-commerce copywriter specializing in Shopify product descriptions. 

When given a product name and key features, generate a complete product page copy in the following JSON format:

{
  "title": "Compelling product title optimized for SEO (50-70 chars)",
  "subtitle": "One-line hook that grabs attention (under 120 chars)",
  "description": "Full product description in HTML format with bullet points, optimized for conversion. Use <p> and <ul><li> tags. 2-3 paragraphs + bullet list.",
  "bulletPoints": ["key feature 1", "key feature 2", "key feature 3", "key feature 4", "key feature 5"],
  "metaDescription": "SEO meta description (150-160 chars)",
  "seoKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "tone": "The tone used (e.g., luxury, playful, technical, minimalist)"
}

Rules:
- Write in native, persuasive English
- Focus on BENEFITS not just features
- Include emotional triggers and sensory language
- Optimize for both conversion AND SEO
- Match the tone to the product category
- Return ONLY valid JSON, no markdown wrapping`

export async function POST(request: Request) {
  try {
    const { product, features, platform, tone } = await request.json()

    if (!product) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 })
    }

    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const userMessage = `Product: ${product}
${features ? `Key Features: ${features}` : ''}
${platform ? `Target Platform: ${platform}` : 'Target Platform: Shopify'}
${tone ? `Desired Tone: ${tone}` : ''}

Generate an optimized product page copy for this product.`

    const response = await fetch(DEEPSEEK_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.8,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('DeepSeek API error:', err)
      return NextResponse.json({ error: 'AI service error, please try again' }, { status: 502 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    const parsed = JSON.parse(content)
    return NextResponse.json({ success: true, data: parsed })

  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
