import { scrapeAndInsertOpportunities } from './lib/opportunities/scraper'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function run() {
  try {
    const res = await scrapeAndInsertOpportunities(1)
    console.log(res)
  } catch (e) {
    console.error(e)
  }
}

run()
