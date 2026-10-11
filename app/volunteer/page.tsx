import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { connection } from 'next/server';
import { Code2, PenLine, Palette, Settings2, Megaphone, Users, Handshake, ArrowDown } from 'lucide-react';
import { ApplicationWindow, ApplicationStatus, ApplyButton, Countdown, ClosingCopy } from './application-window';
import { DEADLINE_ISO, DEADLINE_LABEL, recruitmentState } from './recruitment';
import styles from './volunteer.module.css';
import { Footer } from '@/components/landing/footer';
import { Reveal } from './reveal';

// A fresh server timestamp ensures an already-closed intake never serves active CTAs.
export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  const closed = recruitmentState(Date.now()).closed;
  const title = closed ? 'Volunteer Applications Closed' : 'Volunteer Applications Open';
  const description = closed
    ? 'The October 2026 SEES Tech Hub volunteer intake is closed. Explore the seven teams behind our community.'
    : 'Join one of seven SEES Tech Hub volunteer teams. Contribute your skills, build practical experience, and apply by October 18, 2026 at 11:59 PM WAT.';
  return {
    title, description, alternates: { canonical: '/volunteer' },
    openGraph: { title: title + ' | SEES Tech Hub', description, url: '/volunteer', siteName: 'SEES Tech Hub', locale: 'en_NG', type: 'website' },
    twitter: { card: 'summary', title: title + ' | SEES Tech Hub', description },
  };
}

const teams = [
  { name: 'Content', icon: PenLine, note: 'Give our work a voice', description: 'Write, film, and create content that tells our stories, explains our initiatives, and keeps the community in the loop.' },
  { name: 'Design', icon: Palette, note: 'Make the details matter', description: 'Shape how the hub looks and feels through graphics, branding, UI/UX, and creative assets for our initiatives.' },
  { name: 'Development', icon: Code2, note: 'Build what comes next', description: 'Build and maintain the websites, platforms, and technical tools that help the hub turn ideas into working projects.' },
  { name: 'Operations', icon: Settings2, note: 'Keep good work moving', description: 'Coordinate the processes, workflows, and behind-the-scenes details that keep our teams and initiatives running smoothly.' },
  { name: 'Growth & Outreach', icon: Megaphone, note: 'Take the hub further', description: 'Reach new audiences, build strategic relationships, and connect the hub with people and opportunities that support our work.' },
  { name: 'Community & Events', icon: Users, note: 'Bring people together', description: 'Keep our community active and connected, and help plan and deliver workshops, meetups, and events worth showing up for.' },
  { name: 'Finance & Sponsorship', icon: Handshake, note: 'Give ideas the resources', description: 'Support budgets, manage resources, and help secure the sponsorships and funding that make our initiatives possible.' },
];

const reasons = [
  { title: 'Work you can point to.', text: 'Put your skills into practice on real projects, with something tangible to show for your time.' },
  { title: 'People to build with.', text: 'Collaborate with talented peers, exchange ideas, and make connections across disciplines.' },
  { title: 'Room to take the lead.', text: 'Take ownership of a piece of the work, learn to coordinate with others, and develop your judgment.' },
];

function HubLogo() {
  return <Link href="/" className={styles.logo} aria-label="SEES Tech Hub home">
    <span className={styles.logoMark}><Image src="/logo/logomark.svg" alt="" width={100} height={100} priority /></span>
    <span>SEES<small>TECH HUB</small></span>
  </Link>;
}

export default async function VolunteerPage() {
  await connection();
  // Fresh request time is intentional in this dynamic Server Component, never a client render.
  // eslint-disable-next-line react-hooks/purity
  const initialNow = Date.now();
  return <div className={styles.page}>
    <ApplicationWindow initialNow={initialNow}>
      <a className={styles.skip} href="#volunteer-main">Skip to content</a>
      <header className={styles.container + ' ' + styles.header}>
        <HubLogo />
        <nav aria-label="Volunteer navigation"><a href="#teams">The teams</a><a href="#why-volunteer">Why join us</a></nav>
      </header>
      <main id="volunteer-main">
        <noscript><style>{'.volunteer-reveal { opacity: 1 !important; transform: none !important; }'}</style></noscript>
        <section className={styles.container + ' ' + styles.hero} aria-labelledby="volunteer-heading">
          <Reveal className={styles.heroCopy}>
            <ApplicationStatus />
            <h1 id="volunteer-heading">Good things<br />take <em>good people.</em></h1>
            <p className={styles.lead}>Help build what comes next at SEES Tech Hub. We’re inviting students and passionate people to share their skills, collaborate, and bring our community’s ideas to life.</p>
            <div className={styles.heroActions}><ApplyButton /><a className={styles.explore} href="#teams">Find your team <ArrowDown size={16} aria-hidden="true" /></a></div>
            <p className={styles.heroNote}>Seven teams. Different skills. A shared purpose.</p>
          </Reveal>
          <Reveal><Countdown /></Reveal>
        </section>

        <section id="teams" className={styles.container + ' ' + styles.teamsSection} aria-labelledby="teams-heading">
          <Reveal className={styles.sectionHeading}><div><p className={styles.eyebrow}>01 / Find your place</p><h2 id="teams-heading">Different strengths.<br /><em>One team.</em></h2></div><p>You don’t have to write code to make a difference here. Explore where your skills and interests fit.</p></Reveal>
          <div className={styles.teamGrid}>
            <Reveal className={styles.teamIntro}><span className={styles.bigNumber}>07<span>teams</span></span><p>There’s more than<br />one way to contribute.</p><span className={styles.introRule} /></Reveal>
            {teams.map(({ name, icon: Icon, note, description }, index) => <Reveal as="article" className={styles.teamCard} key={name}>
              <div className={styles.cardTop}><Icon size={23} strokeWidth={1.5} aria-hidden="true" /><span>{String(index + 1).padStart(2, '0')}</span></div>
              <h3>{name}</h3><p className={styles.teamNote}>{note}</p><p>{description}</p>
            </Reveal>)}
          </div>
        </section>

        <section id="why-volunteer" className={styles.whySection} aria-labelledby="why-heading"><div className={styles.container}>
          <Reveal className={styles.sectionHeading}><div><p className={styles.eyebrow}>02 / Why volunteer with us?</p><h2 id="why-heading">Contribute something.<br /><em>Take something with you.</em></h2></div><p>Volunteering is a chance to do useful work with people who care about doing it well.</p></Reveal>
          <div className={styles.reasons}>{reasons.map((reason, index) => <Reveal key={reason.title}><span>0{index + 1}</span><h3>{reason.title}</h3><p>{reason.text}</p></Reveal>)}</div>
        </div></section>

        <section className={styles.container + ' ' + styles.closing} aria-label="Volunteer application">
          <Reveal className={styles.closingCard}><div><p className={styles.eyebrow}>Your place in the hub</p><ClosingCopy /></div>
            <div className={styles.closingAction}><ApplyButton /><p>Application deadline<br /><time dateTime={DEADLINE_ISO}>{DEADLINE_LABEL}.</time></p></div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </ApplicationWindow>
  </div>;
}
