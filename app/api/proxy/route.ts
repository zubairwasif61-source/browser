import type { NextRequest, NextResponse } from 'next/server'

export const config = {
  api: {
    responseLimit: '50mb',
  },
}

const PROXY_ORIGIN = process.env.NEXT_PUBLIC_PROXY_ORIGIN || 'http://localhost:3000'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = request.nextUrl.searchParams.get('url')

    if (!url) {
      return new NextResponse('Missing URL parameter', { status: 400 })
    }

    // Decode and validate URL
    let targetUrl = decodeURIComponent(url)
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl
    }

    // Fetch the target website
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
      },
      redirect: 'follow',
    })

    let content = await response.text()
    const contentType = response.headers.get('content-type') || 'text/html'

    // Rewrite URLs in HTML content
    if (contentType.includes('text/html')) {
      content = rewriteUrls(content, targetUrl)
    }

    return new NextResponse(content, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'X-Frame-Options': 'ALLOWALL',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new NextResponse(
      `<h1>Error Loading Page</h1><p>${errorMessage}</p><p><a href="/">← Go Back</a></p>`,
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      }
    )
  }
}

function rewriteUrls(html: string, baseUrl: string): string {
  const base = new URL(baseUrl)
  const baseOrigin = base.origin

  // Rewrite href attributes
  html = html.replace(/href=["']([^"']+)["']/g, (match, url) => {
    return `href="${rewriteUrl(url, baseOrigin, base)}"`
  })

  // Rewrite src attributes
  html = html.replace(/src=["']([^"']+)["']/g, (match, url) => {
    return `src="${rewriteUrl(url, baseOrigin, base)}"`
  })

  // Rewrite data attributes
  html = html.replace(/data-src=["']([^"']+)["']/g, (match, url) => {
    return `data-src="${rewriteUrl(url, baseOrigin, base)}"`
  })

  // Rewrite form actions
  html = html.replace(/action=["']([^"']+)["']/g, (match, url) => {
    return `action="${rewriteUrl(url, baseOrigin, base)}"`
  })

  return html
}

function rewriteUrl(url: string, baseOrigin: string, baseUrl: URL): string {
  if (!url || url.startsWith('javascript:') || url.startsWith('data:')) {
    return url
  }

  try {
    let absoluteUrl: string

    if (url.startsWith('http://') || url.startsWith('https://')) {
      absoluteUrl = url
    } else if (url.startsWith('//')) {
      absoluteUrl = baseUrl.protocol + url
    } else if (url.startsWith('/')) {
      absoluteUrl = baseOrigin + url
    } else {
      absoluteUrl = new URL(url, baseUrl).href
    }

    return `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`
  } catch {
    return url
  }
}
