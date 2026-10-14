'use client';

import Link from 'next/link';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { ApplicationWindow, useApplicationWindow } from '@/app/volunteer/application-window';
import { DEADLINE_ISO, DEADLINE_LABEL, recruitmentState } from '@/app/volunteer/recruitment';

function VolunteerFeatureContent() {
  const { now } = useApplicationWindow();
  const { closed } = recruitmentState(now);

  return (
    <article className="relative isolate overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground sm:p-9">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 -z-10 size-80 rounded-full border border-primary-foreground/10" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-14 -z-10 size-60 rounded-full border border-primary-foreground/10" />
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="font-medium uppercase tracking-widest text-primary-foreground/70">Volunteer intake · 2026</span>
        <span role="status" className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 px-3 py-1.5">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
          {closed ? 'Applications closed' : 'Applications open'}
        </span>
      </div>

      <h2 className="mt-8 max-w-md font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
        {closed ? <>Meet the people<br />behind the <em>possibilities.</em></> : <>Help shape<br />what happens <em>next.</em></>}
      </h2>
      <p className="mt-5 max-w-md text-base leading-relaxed text-primary-foreground/80">
        {closed
          ? 'This volunteer intake has closed. Explore the seven teams that bring the hub’s ideas, activities and community to life.'
          : 'Seven teams. Plenty of ways to contribute. Bring your skills to the people making things happen at SEES Tech Hub.'}
      </p>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-7 border-t border-primary-foreground/20 pt-7">
        <div className="space-y-5">
          <p className="flex items-start gap-2.5 text-sm leading-relaxed text-primary-foreground/80">
            <CalendarDays size={17} aria-hidden="true" className="mt-0.5 shrink-0" />
            <span>{closed ? 'Applications closed' : 'Apply before'}<br /><time dateTime={DEADLINE_ISO}>Sunday, 18 October · 11:59 PM WAT</time></span>
          </p>
          <Link href="/volunteer" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-background px-5 py-3 text-sm font-semibold text-brand transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-foreground">
            {closed ? 'Meet the teams' : 'Explore the teams'}<ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div aria-hidden="true" className="pr-1 text-right text-primary-foreground/80">
          <span className="block font-instrument-serif text-7xl leading-none sm:text-8xl">18</span>
          <span className="mt-2 block text-xs uppercase tracking-widest">October</span>
        </div>
      </div>
      <span className="sr-only">Application deadline: {DEADLINE_LABEL}.</span>
    </article>
  );
}

export function VolunteerFeature({ initialNow }: { initialNow: number }) {
  return <ApplicationWindow initialNow={initialNow}><VolunteerFeatureContent /></ApplicationWindow>;
}
