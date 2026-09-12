import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Check, MessageCircle } from 'lucide-react';
import { scholarshipLinks } from './links';
import styles from './scholarship.module.css';
import { AmbientMotion, DepthReveal, FadeGrid, PageEntrances, ScholarshipHeadline } from './motion';
import { ScholarshipFaq } from './faq';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: '500 Free DataCamp Scholarships for Students',
  description: 'Apply for one of 500 free DataCamp scholarships from SEES Tech Hub and build practical skills in data, artificial intelligence, programming, and technology.',
  keywords: [
    'DataCamp scholarship',
    'free DataCamp scholarship',
    'data science scholarship for students',
    'AI scholarship for students',
    'SEES Tech Hub',
    'DataCamp Donates',
    'Nigeria tech scholarships',
  ],
  alternates: { canonical: '/datacamp' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    title: '500 DataCamp Scholarships. On Us.',
    description: 'Free DataCamp access for students ready to build practical skills in data, AI, programming, and technology.',
    url: '/datacamp',
    siteName: 'SEES Tech Hub',
    locale: 'en_NG',
    type: 'website',
    images: [{
      url: '/api/og/datacamp',
      width: 1200,
      height: 630,
      alt: '500 DataCamp scholarships from SEES Tech Hub and DataCamp Donates',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '500 DataCamp Scholarships. On Us.',
    description: 'Free DataCamp access for students ready to grow in data, AI, programming, and technology.',
    images: ['/api/og/datacamp'],
  },
};

function ApplicationButton({ showArrow = false }: { showArrow?: boolean }) {
  const content = <>Apply Now {showArrow && <ArrowUpRight size={20} aria-hidden="true" />}</>;
  return <div className={styles.application}>
    <a className={styles.apply} href={scholarshipLinks.application} target="_blank" rel="noopener noreferrer">{content}<span className={styles.srOnly}> (opens in a new tab)</span></a>
  </div>;
}

function Destination({ name, children }: { name: keyof typeof scholarshipLinks; children: React.ReactNode }) {
  const href = scholarshipLinks[name];
  return <a className={styles.inlineLink} href={href} target="_blank" rel="noopener noreferrer">{children}<span className={styles.srOnly}> (opens in a new tab)</span></a>;
}

function XIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
  </svg>;
}

function LinkedInIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V8.98h3.42v1.57h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.29ZM5.32 7.41a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.04H3.54V8.98H7.1v11.47Z" />
  </svg>;
}

function InstagramIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>;
}

const benefits = [
  "Full access to DataCamp's courses and learning tracks",
  'Hands-on projects and certifications you can actually show for it',
  'A real head start in data, AI, and tech skills, no cost to you',
];

const questions = [
  { question: 'Who can apply?', answer: "Any student. You don't have to be a SEES or STH member to apply, though registered members get priority consideration." },
  { question: 'Is this really free?', answer: 'Yes. 500 full scholarships, no payment required at any point.' },
  { question: 'How will I know the outcome of my application?', answer: 'Applications are reviewed on a rolling basis, so applying earlier gives you a better chance of receiving an earlier response. We will email you whether or not you are selected.' },
  { question: "What if I'm not selected this time?", answer: 'Stay in the STH community, more opportunities like this come through regularly.' },
];

function HubLogo() {
  return <Link href="/" className={styles.home} aria-label="SEES Tech Hub home">
    <span className={styles.logoMark}><Image src="/logo/logomark.svg" alt="" width={100} height={100} /></span>
    <span className={styles.wordmark}>SEES<span>TECH HUB</span></span>
  </Link>;
}

export default function DataCampPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': 'https://tech.seesunilag.com/datacamp#webpage',
        url: 'https://tech.seesunilag.com/datacamp',
        name: '500 Free DataCamp Scholarships for Students',
        description: metadata.description,
        isPartOf: { '@id': 'https://tech.seesunilag.com/#website' },
        about: { '@id': 'https://tech.seesunilag.com/datacamp#scholarship' },
        inLanguage: 'en-NG',
      },
      {
        '@type': 'EducationalOccupationalProgram',
        '@id': 'https://tech.seesunilag.com/datacamp#scholarship',
        name: 'SEES Tech Hub DataCamp Scholarship',
        description: metadata.description,
        financialAidEligible: 'Full DataCamp scholarship at no cost to selected students',
        provider: { '@type': 'Organization', name: 'SEES Tech Hub', url: 'https://tech.seesunilag.com' },
        sponsor: { '@type': 'Organization', name: 'DataCamp', url: 'https://www.datacamp.com' },
        occupationalCategory: ['Data science', 'Artificial intelligence', 'Programming', 'Technology'],
      },
    ],
  };
  return <div className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    <PageEntrances />
    <a className={styles.skip} href="#scholarship-main">Skip to content</a>
    <header className={styles.header}>
      <HubLogo />
      <div className={styles.headerPartner}>
        <Image src="/datacamp/WhatsApp Image 2026-09-10 at 21.13.28 (1).jpeg" alt="DataCamp Donates" width={1080} height={202} priority />
      </div>
    </header>

    <main id="scholarship-main">
      <section className={`${styles.container} ${styles.hero}`} aria-labelledby="scholarship-title">
        <FadeGrid />
        <AmbientMotion />
        <div className={styles.heroIntro} data-enter>
          <ScholarshipHeadline />
          <p className={styles.lead}>In partnership with DataCamp, SEES Tech Hub is giving out 500 scholarships to students ready to build real data, AI, and tech skills.</p>
          <ApplicationButton />
        </div>
        <div className={styles.heroAside} data-enter>
          <div className={styles.partnership}>
            <p className={styles.smallLabel}>In partnership with</p>
            <div className={styles.lockup}>
              <div className={styles.sthLogo}><Image src="/logo/logomark.svg" alt="SEES Tech Hub" width={50} height={50} /></div>
              <span className={styles.multiply} aria-hidden="true">×</span>
              <Image className={styles.datacampLogo} src="/datacamp/WhatsApp Image 2026-09-10 at 21.13.28 (1).jpeg" alt="DataCamp Donates" width={1080} height={202} sizes="(max-width: 600px) 220px, 260px" />
            </div>
          </div>
          <a href="#what-you-get" className={styles.explore}>What&apos;s in the scholarship <ArrowDown size={17} aria-hidden="true" /></a>
        </div>
      </section>

      <section id="what-you-get" className={styles.benefits} aria-labelledby="benefits-title">
        <DepthReveal className={styles.container}>
          <p className={styles.eyebrow}>The scholarship</p>
          <h2 id="benefits-title">What&apos;s in the scholarship</h2>
          <ul className={styles.benefitList}>
            {benefits.map((benefit) => <li key={benefit}><span className={styles.check}><Check size={19} strokeWidth={2.5} aria-hidden="true" /></span><p>{benefit}</p></li>)}
          </ul>
        </DepthReveal>
      </section>

      <section id="how-to-apply" className={`${styles.container} ${styles.stepsSection}`} aria-labelledby="steps-title">
        <div className={styles.stepsIntro} data-enter>
          <p className={styles.eyebrow}>How to apply</p>
          <h2 id="steps-title">Three <em>simple</em> steps</h2>
          <p className={styles.stepsCaption}>Follow. Connect. Apply.</p>
          <div className={styles.stepsKey} aria-hidden="true"><span>01</span><i /><span>02</span><i /><span>03</span></div>
        </div>
        <ol className={styles.steps}>
          <li>
            <span className={styles.stepNumber} aria-hidden="true">01</span>
            <DepthReveal>
              <div className={styles.stepBody}>
                <h3>Follow SEES Tech Hub</h3>
                <p>Follow us on LinkedIn, X, and Instagram. You&apos;ll drop these links in the form.</p>
                <div className={styles.stepActions} aria-label="Follow SEES Tech Hub">
                  <Destination name="linkedin"><LinkedInIcon /> LinkedIn</Destination>
                  <Destination name="x"><XIcon /> X</Destination>
                  <Destination name="instagram"><InstagramIcon /> Instagram</Destination>
                </div>
              </div>
            </DepthReveal>
          </li>
          <li>
            <span className={styles.stepNumber} aria-hidden="true">02</span>
            <DepthReveal>
              <div className={styles.stepBody}>
                <h3>Join the community</h3>
                <p>If you&apos;re not already in the SEES Tech Hub WhatsApp community, <Destination name="whatsapp">join here</Destination>. This is where every update, opportunity, and event gets shared first.</p>
                <div className={styles.stepActions}><Destination name="whatsapp"><MessageCircle size={16} aria-hidden="true" /> Join on WhatsApp</Destination></div>
              </div>
            </DepthReveal>
          </li>
          <li>
            <span className={styles.stepNumber} aria-hidden="true">03</span>
            <DepthReveal>
              <div className={`${styles.stepBody} ${styles.finalStep}`}>
                <h3>Fill the application</h3>
                <p>Head to the form and apply. Already a registered SEES Tech Hub member? Let us know in the form, registered members get priority consideration.</p>
                <div className={styles.stepApply}><ApplicationButton showArrow /></div>
                <p className={styles.memberNote}>Not a member yet? <Destination name="registration">Join here</Destination> before you apply, it only takes a minute.</p>
              </div>
            </DepthReveal>
          </li>
        </ol>
      </section>

      <section className={`${styles.container} ${styles.selection}`} aria-labelledby="selection-title" data-enter>
        <div className={styles.selectionHeading}><span className={styles.noteMark} aria-hidden="true">↳</span><h2 id="selection-title">How selection works</h2></div>
        <p>Applications are reviewed on a rolling basis, so applying earlier can mean an earlier response. We&apos;re looking for students who are ready to use the opportunity well, and every applicant will receive the outcome by email.</p>
      </section>

      <section id="faqs" className={`${styles.container} ${styles.faq}`} aria-labelledby="faq-title">
        <div><h2 id="faq-title">FAQ</h2></div>
        <ScholarshipFaq questions={questions} />
      </section>

      <section className={styles.closing} aria-labelledby="closing-title">
        <DepthReveal className={styles.container}>
          <h2 id="closing-title">Don&apos;t sit on this one.</h2>
          <p>500 spots. One form. Apply now.</p>
          <ApplicationButton />
        </DepthReveal>
      </section>

    </main>

    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerMain}>
          <div className={styles.footerBrand}><HubLogo /><p>A community for students<br />building in tech.</p></div>
          <nav className={styles.footerLinks} aria-label="Explore SEES Tech Hub">
            <h2>Explore</h2>
            <Link href="/">Home</Link>
            <a href="#scholarship-main">DataCamp scholarships</a>
            <a href="#how-to-apply">How to apply</a>
            <a href="#faqs">FAQs</a>
          </nav>
          <nav className={styles.footerLinks} aria-label="SEES Tech Hub social links">
            <h2>Connect</h2>
            <Destination name="linkedin"><LinkedInIcon /> LinkedIn</Destination>
            <Destination name="instagram"><InstagramIcon /> Instagram</Destination>
            <Destination name="x"><XIcon /> X</Destination>
            <Destination name="whatsapp"><MessageCircle size={16} aria-hidden="true" /> WhatsApp</Destination>
          </nav>
        </div>
        <div className={styles.footerCommunity}>
          <div><h2>There&apos;s a community behind this.</h2><p>Join us for updates, events, and what comes next.</p></div>
          <a className={styles.communityLink} href={scholarshipLinks.whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true" /> Join the WhatsApp community<span className={styles.srOnly}> (opens in a new tab)</span></a>
        </div>
        <div className={styles.footerBottom}><small>© {new Date().getFullYear()} SEES Tech Hub. All rights reserved.</small><a href="#scholarship-main">Back to top</a></div>
      </div>
    </footer>
  </div>;
}
