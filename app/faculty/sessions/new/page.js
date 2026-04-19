'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewSession() {
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(false);

  const createSession = async () => {
    setLoading(true);
    // In a real app, this would be a POST to /api/sessions/create
    const mockSession = {
      id: Math.random().toString(36).substr(2, 9),
      courseName: 'CS-101: Computer Science',
      startTime: new Date().toLocaleTimeString(),
      qrValue: `AUTH-${Math.random().toString(36).substr(2, 12)}`
    };
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));
    setSessionData(mockSession);
    setLoading(false);
  };

  return (
    <div style={{ padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <Link href="/faculty/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        
        {!sessionData ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1rem' }}>Initiate New Session</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Select a course to generate a dynamic attendance QR code.</p>
            
            <select className="glass-panel" style={{ width: '100%', padding: '15px', color: 'white', background: 'var(--bg-dark)', marginBottom: '2rem', outline: 'none' }}>
              <option>CS-101: Computer Science Fundamentals</option>
              <option>MA-202: Advanced Mathematics</option>
            </select>

            <button onClick={createSession} disabled={loading} className="glass-button" style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Generating...' : 'Start Session & Generate QR'}
            </button>
          </div>
        ) : (
          <div className="glass-panel animate-fade-in" style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <h2 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Session Active</h2>
             <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{sessionData.courseName}</p>
             
             <div style={{ background: 'white', padding: '20px', borderRadius: '20px', marginBottom: '2rem' }}>
               <QRCodeSVG value={sessionData.qrValue} size={256} />
             </div>

             <div style={{ display: 'flex', gap: '20px', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                  <Clock size={16} /> Started: {sessionData.startTime}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--success)' }}>
                  <CheckCircle size={16} /> QR Dynamic: Active
                </div>
             </div>

             <button onClick={() => setSessionData(null)} className="glass-button" style={{ background: 'var(--danger)', width: '100%', justifyContent: 'center' }}>
               End Session
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
