import { NextResponse } from 'next/server'
import { scrapeAndInsertOpportunities } from '@/lib/opportunities/scraper'

// Force dynamic route
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  
  // Protect the route using a CRON_SECRET
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await scrapeAndInsertOpportunities()
    return NextResponse.json({ success: true, processed: result.processed, items: result.items })
  } catch (error: any) {
    console.error('Scraper Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
