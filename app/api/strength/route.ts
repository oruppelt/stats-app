import { NextResponse } from 'next/server'

// Revalidate every 5 minutes (300 seconds)
export const revalidate = 300

export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}strength`, {
      next: { revalidate: 300 }
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()

    // Pass through cache headers from backend
    const headers = new Headers()
    const cacheStatus = response.headers.get('X-Cache-Status')
    if (cacheStatus) {
      headers.set('X-Cache-Status', cacheStatus)
    }
    headers.set('Cache-Control', 'public, max-age=300')

    return NextResponse.json(data, { headers })
  } catch (error) {
    console.error('Error fetching strength data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch strength data' },
      { status: 500 }
    )
  }
} 