'use client';

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function QRCheckin() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(
      (decodedText) => {
        setResult(decodedText);
        scanner.clear();
      },
      (err) => {
        // Just log scanner errors silently
        console.warn(err);
      }
    );

    return () => scanner.clear();
  }, []);

  return (
    <div style={{ padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <Link href="/student/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
          <ArrowLeft size={16} /> Dashboard
        </Link>

        <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>QR Check-in</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem' }}>Scan the QR code projected by your instructor to mark your attendance.</p>

        {!result && !error ? (
          <div className="glass-panel" style={{ padding: '20px', overflow: 'hidden' }}>
            <div id="reader" style={{ width: '100%' }}></div>
          </div>
        ) : result ? (
          <div className="glass-panel animate-fade-in" style={{ padding: '3rem', textAlign: 'center' }}>
            <CheckCircle2 size={64} color="var(--success)" style={{ marginBottom: '1.5rem' }} />
            <h2 style={{ marginBottom: '1rem' }}>Success!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Attendance marked for session: <b>{result}</b></p>
            <Link href="/student/dashboard" className="glass-button" style={{ justifyContent: 'center' }}>
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <div className="glass-panel animate-fade-in" style={{ padding: '3rem', textAlign: 'center' }}>
            <AlertCircle size={64} color="var(--danger)" style={{ marginBottom: '1.5rem' }} />
            <h2 style={{ marginBottom: '1rem' }}>Scan Failed</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{error}</p>
            <button onClick={() => window.location.reload()} className="glass-button" style={{ justifyContent: 'center', width: '100%' }}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
