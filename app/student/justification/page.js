'use client';

import { useState, useEffect, Suspense } from 'react';
import { Sparkles, Send, Copy, ArrowLeft, Loader2, Info } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function JustificationContent() {
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get('subject');
  const dateParam = searchParams.get('date');
  const slotParam = searchParams.get('slot');

  const [reason, setReason] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);

  const generateJustification = async () => {
    if (!reason) return;
    setLoading(true);
    
    const subject = subjectParam || '[Subject]';
    const dateFormatted = dateParam ? new Date(dateParam).toLocaleDateString() : '[Date]';
    
    // AI Generation with Dynamic Context
    const templates = [
      `Subject: Absence Justification - ${subject} session on ${dateFormatted}\n\nDear Professor,\n\nI am writing to formally apologize for my absence from the ${subject} class earlier on ${dateFormatted}. Unfortunately, I was unable to attend because ${reason}. \n\nI have reached out to my peers to collect the notes and will ensure I am prepared for the next session. Thank you for your time and understanding.\n\nBest regards,\n[Student Name]`,
      `Hi Professor,\n\nPlease accept this notification regarding my absence from the ${subject} lecture (Slot ${slotParam || 'N/A'}) on ${dateFormatted}. I could not attend due to ${reason}. I will catch up on the course material as soon as possible.\n\nSincerely,\n[Student Name]`
    ];

    await new Promise(r => setTimeout(r, 1200));
    setGeneratedText(templates[Math.floor(Math.random() * templates.length)]);
    setLoading(false);
  };

  return (
    <div style={{ padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '700px' }}>
        <Link href="/student/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
          <ArrowLeft size={16} /> Dashboard
        </Link>

        <h1 style={{ marginBottom: '1rem', fontSize: '2.5rem', fontWeight: '800' }}>AI Justification Generator</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Stuck on how to explain an absence? Let our AI draft a professional message for you.</p>

        {subjectParam && (
          <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '4px solid var(--primary)', background: 'rgba(99, 102, 241, 0.05)' }}>
            <Info size={20} color="var(--primary)" />
            <span style={{ fontSize: '0.9rem' }}>
              Justifying absence for <strong>{subjectParam}</strong> on <strong>{dateParam}</strong>
            </span>
          </div>
        )}

        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>Why did you miss the class?</label>
          <textarea 
            placeholder="e.g., medical emergency, family event, technical issues..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ 
              width: '100%', 
              height: '100px', 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid var(--glass-border)', 
              borderRadius: '12px', 
              padding: '15px', 
              color: 'white', 
              outline: 'none',
              marginBottom: '1.5rem',
              fontFamily: 'inherit',
              transition: 'all 0.3s ease'
            }}
          />
          <button 
            onClick={generateJustification} 
            disabled={loading || !reason}
            className="glass-button" 
            style={{ width: '100%', justifyContent: 'center', background: 'var(--primary)' }}
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />} Generate Professional Draft
          </button>
        </div>

        {generatedText && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold' }}>AI SUGGESTED DRAFT</h3>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generatedText);
                }}
                className="copy-btn"
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center' }}
              >
                <Copy size={16} /> Copy Text
              </button>
            </div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>
              {generatedText}
            </div>
            <div style={{ marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
               <button className="glass-button" style={{ background: 'var(--success)', border: 'none' }}>
                 <Send size={16} /> Send via Email
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function JustificationGenerator() {
  return (
    <Suspense fallback={<div style={{ color: 'white', padding: '2rem' }}>Loading generator...</div>}>
      <JustificationContent />
    </Suspense>
  );
}
