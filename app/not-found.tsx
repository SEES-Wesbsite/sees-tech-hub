'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-[120px] font-black text-brand leading-none tracking-tighter mb-4">
        404
      </h1>
      
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Oops! That page doesn't exist.
      </h2>
      
      <p className="text-muted-foreground max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
          className="w-full sm:w-auto px-8"
        >
          Go Back
        </Button>
        <Link href="/dashboard" className="w-full sm:w-auto">
          <Button className="w-full bg-brand text-brand-foreground hover:bg-brand-light px-8">
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
