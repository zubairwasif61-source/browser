import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    )
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 10000,
      maxRedirects: 5,
    })

    const contentType = response.headers['content-type'] || 'text/html'

    return new NextResponse(response.data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': "default-src *; style-src * 'unsafe-inline'; script-src * 'unsafe-inline'; img-src * data: blob:; font-src * data:;",
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch the URL',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
