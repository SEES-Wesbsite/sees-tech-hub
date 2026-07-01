import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const SERPAPI_KEY = process.env.SERPAPI_KEY;
  const q = 'site:boards.greenhouse.io "software engineer" internship OR intern';
  
  try {
    const res = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(q)}&api_key=${SERPAPI_KEY}`, {
      cache: 'no-store'
    });
    const data = await res.json();
    return NextResponse.json({
      status: res.status,
      ok: res.ok,
      hasOrganicResults: !!data.organic_results,
      organicResultsCount: data.organic_results?.length || 0,
      error: data.error || null,
      rawKeys: Object.keys(data)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
