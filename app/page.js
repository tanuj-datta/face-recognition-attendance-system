import styles from './page.module.css';
import Link from 'next/link';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={`glass-panel ${styles.hero}`}>
        <h1 className={styles.title}>Automated Student Attendance</h1>
        <p className={styles.subtitle}>
          Secure, Face-Recognition Powered Monitoring System.
        </p>

        <div className={styles.actions} style={{ flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: '0 auto' }}>
          
          <Link href="/student/register" className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', textDecoration: 'none', color: 'white', textAlign: 'center' }}>
            New Student Registration
          </Link>

          <Link href="/attendance/scan" className="btn glass-panel" style={{ padding: '1rem', fontSize: '1.1rem', color: 'white', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
            Put Attendance (Camera)
          </Link>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Link href="/student/login" className="btn glass-panel" style={{ flex: 1, padding: '0.8rem', color: 'white', textDecoration: 'none', textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
              Student Login
            </Link>
            <Link href="/faculty/login" className="btn glass-panel" style={{ flex: 1, padding: '0.8rem', color: 'white', textDecoration: 'none', textAlign: 'center', background: 'rgba(225, 29, 72, 0.2)' }}>
              Faculty Login
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}
