import Image from 'next/image';
import Link from 'next/link';
import styles from './footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo} aria-label="SEES Tech Hub home">
            <span className={styles.mark}><Image src="/logo/logomark.svg" alt="" width={100} height={100} /></span>
            <span>SEES<small>TECH HUB</small></span>
          </Link>
          <p>A place for students to connect, create, and contribute to tech at UNILAG.</p>
        </div>
        <nav aria-label="Explore SEES Tech Hub">
          <h3>Explore</h3>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/datacamp">DataCamp Scholarships</Link></li>
            <li><Link href="/volunteer">Volunteer with us</Link></li>
            <li><Link href="/login">Member sign in</Link></li>
          </ul>
        </nav>
        <nav aria-label="Follow SEES Tech Hub">
          <h3>Follow along</h3>
          <ul>
            <li><a href="https://www.linkedin.com/company/sees-tech-hub/" target="_blank" rel="noopener noreferrer">LinkedIn<span className={styles.srOnly}> (opens in a new tab)</span></a></li>
            <li><a href="https://www.instagram.com/sees_techhub" target="_blank" rel="noopener noreferrer">Instagram<span className={styles.srOnly}> (opens in a new tab)</span></a></li>
            <li><a href="https://x.com/SEESTechHub" target="_blank" rel="noopener noreferrer">X<span className={styles.srOnly}> (opens in a new tab)</span></a></li>
          </ul>
        </nav>
        <div className={styles.join}>
          <h3>Stay connected</h3>
          <p>Keep up with our events, activities, and announcements.</p>
          <a className={styles.community} href="https://chat.whatsapp.com/JAIc2yFhyqAL30lD3bBXis?s=cl&p=a&mlu=0&ilr=0" target="_blank" rel="noopener noreferrer">Join our WhatsApp community<span className={styles.srOnly}> (opens in a new tab)</span></a>
        </div>
      </div>
      <div className={styles.bottom}><small>© {new Date().getUTCFullYear()} SEES Tech Hub. All rights reserved.</small><span>University of Lagos</span></div>
    </footer>
  );
}
