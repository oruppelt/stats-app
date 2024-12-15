import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schedule_strength`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching schedule strength data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedule strength data' },
      { status: 500 }
    )
  }
} 