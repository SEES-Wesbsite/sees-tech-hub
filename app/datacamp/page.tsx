import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Check, MessageCircle } from 'lucide-react';
import { scholarshipLinks, selectionTimeline } from './links';
import styles from './scholarship.module.css';
import { AmbientMotion, DepthReveal, FadeGrid, PageEntrances, ScholarshipHeadline } from './motion';
import { ScholarshipFaq } from './faq';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: '500 DataCamp Scholarships',
  description: 'In partnership with DataCamp, SEES Tech Hub is giving out 500 scholarships to students ready to build real data, AI, and tech skills.',
  alternates: { canonical: '/datacamp' },
  openGraph: {
    title: '500 DataCamp Scholarships. On Us.',
    description: '500 spots. One form. Apply now.',
    url: '/datacamp',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '500 DataCamp Scholarships. On Us.',
    description: 'In partnership with DataCamp, SEES Tech Hub is giving out 500 scholarships.',
  },
};

function ApplicationButton() {
  const content = <>Apply Now <ArrowUpRight size={20} aria-hidden="true" /></>;
  return <div className={styles.application}>
    {scholarshipLinks.application
      ? <a className={styles.apply} href={scholarshipLinks.application} target="_blank" rel="noopener noreferrer">{content}<span className={styles.srOnly}> (opens in a new tab)</span></a>
      : <button className={styles.apply} type="button" disabled aria-describedby="application-pending">{content}</button>}
  </div>;
}

function Destination({ name, children }: { name: keyof typeof scholarshipLinks; children: React.ReactNode }) {
  const href = scholarshipLinks[name];
  return href
    ? <a className={styles.inlineLink} href={href} target="_blank" rel="noopener noreferrer">{children}<span className={styles.srOnly}> (opens in a new tab)</span></a>
    : <span className={styles.stub} role="link" aria-disabled="true">{children}<span className={styles.srOnly}> (link coming soon)</span></span>;
}

const benefits = [
  "Full access to DataCamp's courses and learning tracks",
  'Hands-on projects and certifications you can actually show for it',
  'A real head start in data, AI, and tech skills, no cost to you',
];

const questions = [
  { question: 'Who can apply?', answer: "Any student. You don't have to be a SEES or STH member to apply, though registered members get priority consideration." },
  { question: 'Is this really free?', answer: 'Yes. 500 full scholarships, no payment required at any point.' },
  { question: 'When will I know if I was selected?', answer: selectionTimeline ?? '[Insert date/timeline once confirmed]' },
  { question: "What if I'm not selected this time?", answer: 'Stay in the STH community, more opportunities like this come through regularly.' },
];

function HubLogo() {
  return <Link href="/" className={styles.home} aria-label="SEES Tech Hub home">
    <span className={styles.logoMark}><Image src="/logo/logomark.svg" alt="" width={100} height={100} /></span>
    <span className={styles.wordmark}>SEES<span>TECH HUB</span></span>
  </Link>;
}

export default function DataCampPage() {
  const hasSocialStubs = !scholarshipLinks.linkedin || !scholarshipLinks.x || !scholarshipLinks.instagram;
  return <div className={styles.page}>
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
          {!scholarshipLinks.application && <p id="application-pending" className={styles.pending}>Application link coming soon.</p>}
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
                  <Destination name="linkedin">LinkedIn <ArrowUpRight size={14} aria-hidden="true" /></Destination>
                  <Destination name="x">X <ArrowUpRight size={14} aria-hidden="true" /></Destination>
                  <Destination name="instagram">Instagram <ArrowUpRight size={14} aria-hidden="true" /></Destination>
                </div>
                {hasSocialStubs && <small className={styles.stubNote}>Social links coming soon.</small>}
              </div>
            </DepthReveal>
          </li>
          <li>
            <span className={styles.stepNumber} aria-hidden="true">02</span>
            <DepthReveal>
              <div className={styles.stepBody}>
                <h3>Join the community</h3>
                <p>If you&apos;re not already in the SEES Tech Hub WhatsApp community, <Destination name="whatsapp">join here <span aria-hidden="true">↗</span></Destination>. This is where every update, opportunity, and event gets shared first.</p>
                <div className={styles.stepActions}><Destination name="whatsapp"><MessageCircle size={16} aria-hidden="true" /> Join on WhatsApp <ArrowUpRight size={14} aria-hidden="true" /></Destination></div>
              </div>
            </DepthReveal>
          </li>
          <li>
            <span className={styles.stepNumber} aria-hidden="true">03</span>
            <DepthReveal>
              <div className={`${styles.stepBody} ${styles.finalStep}`}>
                <h3>Fill the application</h3>
                <p>Head to the form and apply. Already a registered SEES Tech Hub member? Let us know in the form, registered members get priority consideration.</p>
                <div className={styles.stepApply}><ApplicationButton />{!scholarshipLinks.application && <small className={styles.pending}>Application link coming soon.</small>}</div>
                <p className={styles.memberNote}>Not a member yet? <Destination name="registration">Join here</Destination> before you apply, it only takes a minute <span aria-hidden="true">↗</span></p>
              </div>
            </DepthReveal>
          </li>
        </ol>
      </section>

      <section className={`${styles.container} ${styles.selection}`} aria-labelledby="selection-title" data-enter>
        <div className={styles.selectionHeading}><span className={styles.noteMark} aria-hidden="true">↳</span><h2 id="selection-title">How selection works</h2></div>
        <p>Applications are reviewed. We&apos;re looking for students who are genuinely ready to use this opportunity, so take the form seriously. Selected applicants will be contacted directly with next steps.</p>
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
            <Destination name="linkedin">LinkedIn <ArrowUpRight size={14} aria-hidden="true" /></Destination>
            <Destination name="instagram">Instagram <ArrowUpRight size={14} aria-hidden="true" /></Destination>
            <Destination name="x">X <ArrowUpRight size={14} aria-hidden="true" /></Destination>
            <Destination name="whatsapp">WhatsApp <ArrowUpRight size={14} aria-hidden="true" /></Destination>
          </nav>
        </div>
        <div className={styles.footerCommunity}>
          <div><h2>There&apos;s a community behind this.</h2><p>Join us for updates, events, and what comes next.</p></div>
          <a className={styles.communityLink} href={scholarshipLinks.whatsapp!} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true" /> Join the WhatsApp community <ArrowUpRight size={18} aria-hidden="true" /><span className={styles.srOnly}> (opens in a new tab)</span></a>
        </div>
        <div className={styles.footerBottom}><small>© {new Date().getFullYear()} SEES Tech Hub. All rights reserved.</small><a href="#scholarship-main">Back to top <ArrowUpRight size={14} aria-hidden="true" /></a></div>
      </div>
    </footer>
  </div>;
}
