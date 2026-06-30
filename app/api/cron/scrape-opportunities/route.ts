import { NextResponse } from 'next/server'
import { scrapeAndInsertOpportunities } from '@/lib/opportunities/scraper'

// Force dynamic route
export const dynamic = 'force-dynamic'

export async function POST() {
  // In production, verify an authorization header (e.g. Bearer CRON_SECRET)
  try {
    const result = await scrapeAndInsertOpportunities()
    return NextResponse.json({ success: true, processed: result.processed, items: result.items })
  } catch (error: any) {
    console.error('Scraper Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
