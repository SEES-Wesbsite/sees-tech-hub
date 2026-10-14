'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { APPLICATION_URL, DEADLINE_ISO, DEADLINE_LABEL, recruitmentState } from './recruitment';
import styles from './volunteer.module.css';

const WindowContext = createContext<{
  now: number;
  closeIfExpired: () => boolean;
} | null>(null);

export function ApplicationWindow({ initialNow, children }: { initialNow: number; children: ReactNode }) {
  const [now, setNow] = useState(initialNow);
  const clock = useRef<{ server: number; local: number } | null>(null);

  // Anchor to server time, then measure elapsed time locally.
  // Neither the visitor's timezone nor absolute clock setting determines the deadline.
  useEffect(() => {
    clock.current = { server: initialNow, local: Date.now() };
    let interval: ReturnType<typeof setInterval> | undefined;
    const update = () => {
      const time = clock.current!.server + Math.max(0, Date.now() - clock.current!.local);
      setNow(time);
      if (recruitmentState(time).closed) clearInterval(interval);
    };
    if (!recruitmentState(initialNow).closed) interval = setInterval(update, 1000);
    document.addEventListener('visibilitychange', update);
    window.addEventListener('focus', update);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', update);
      window.removeEventListener('focus', update);
    };
  }, [initialNow]);

  const closeIfExpired = () => {
    const time = clock.current
      ? clock.current.server + Math.max(0, Date.now() - clock.current.local)
      : initialNow;
    if (!recruitmentState(time).closed) return false;
    setNow(time);
    return true;
  };

  return <WindowContext.Provider value={{ now, closeIfExpired }}>{children}</WindowContext.Provider>;
}

export function useApplicationWindow() {
  const window = useContext(WindowContext);
  if (!window) throw new Error('Recruitment controls require ApplicationWindow');
  return window;
}

export function ApplicationStatus() {
  const { now } = useApplicationWindow();
  return <span className={styles.status} role="status"><span aria-hidden="true" />
    {recruitmentState(now).closed ? 'Applications closed' : 'Volunteer applications are open'}
  </span>;
}

export function ApplyButton() {
  const { now, closeIfExpired } = useApplicationWindow();
  return recruitmentState(now).closed
    ? <button type="button" className={styles.apply} disabled>Applications Closed</button>
    : <a className={styles.apply} href={APPLICATION_URL} target="_blank" rel="noopener noreferrer"
      onClick={(event) => { if (closeIfExpired()) event.preventDefault(); }}>
      Apply to Volunteer<span className={styles.srOnly}> (opens Google Form in a new tab)</span>
    </a>;
}

export function Countdown() {
  const { now } = useApplicationWindow();
  const remaining = recruitmentState(now);
  return <div className={styles.deadlinePanel}>
    <p className={styles.eyebrow}>October 2026 · Volunteer intake</p>
    <div className={styles.deadlineDate}><span className="font-instrument-serif">18</span><div>October<span>Sunday · 11:59 PM WAT</span></div></div>
    <p className={styles.timerLabel}>{remaining.closed ? 'This application window has ended.' : 'Your next chapter starts with showing up.'}</p>
    <div role="status" aria-live="polite" className={styles.srOnly}>{remaining.closed ? 'Applications are now closed.' : 'Applications close ' + DEADLINE_LABEL + '.'}</div>
    {remaining.closed
      ? <div className={styles.closedMessage}><strong>Applications Closed</strong><p>Thank you for your interest in joining SEES Tech Hub. This volunteer intake is now closed.</p></div>
      : <div className={styles.countdown} role="timer" aria-label="Time remaining until applications close" aria-live="off">
        {(['days', 'hours', 'minutes', 'seconds'] as const).map((unit) => <div key={unit}>
          <span>{String(remaining[unit]).padStart(2, '0')}</span><small>{unit}</small>
        </div>)}
      </div>}
    <p className={styles.deadlineFoot}>Application deadline<br /><time dateTime={DEADLINE_ISO}>{DEADLINE_LABEL}.</time></p>
  </div>;
}

export function ClosingCopy() {
  const { now } = useApplicationWindow();
  return recruitmentState(now).closed
    ? <><h2>This chapter is <em>underway.</em></h2><p>Applications for this intake have closed. Thank you to everyone who put their hand up.</p></>
    : <><h2>Bring your skills.<br />Find your <em>people.</em></h2><p>Choose a team that speaks to you, and tell us what you would like to contribute.</p></>;
}
