import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Automated Student Attendance',
  description: 'AI-powered face recognition attendance system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar glass-panel" style={{ borderRadius: '0' }}>
          <div className="navbar-brand">
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              Attendance AI
            </Link>
          </div>

        </nav>
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
