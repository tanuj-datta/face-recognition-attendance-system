'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Copy, Check, Send } from 'lucide-react';
import Link from 'next/link';

export default function DraftJustification() {
  const { slotIndex } = useParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState({
    subject: '',
    body: ''
  });

  useEffect(() => {
    // Generate a draft based on the slot
    const date = new Date().toLocaleDateString();
    const emailSubject = `Absence Justification - Slot ${slotIndex} - ${date}`;
    const emailBody = `Respected Faculty,\n\nI am writing to justify my absence during Slot ${slotIndex} on ${date}. Unfortunately, I missed the attendance marking window due to [Reason: medical/technical issue].\n\nI request you to kindly consider my attendance for this session. I have completed the course materials for the day.\n\nThank you.\n\nBest regards,\n[Your Name]\n[Your Roll Number]`;
    
    setDraft({ subject: emailSubject, body: emailBody });
  }, [slotIndex]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/student/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Absence Justification Draft</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Copy this content and send it to your instructor for approval.</p>

        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '15px', border: '1px solid var(--glass-border)', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Subject</label>
            <div style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginTop: '5px', fontWeight: '500' }}>{draft.subject}</div>
          </div>
          
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Email Body</label>
            <textarea 
              readOnly
              value={draft.body}
              style={{ width: '100%', height: '250px', background: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: '8px', marginTop: '5px', padding: '15px', color: 'var(--text-main)', fontFamily: 'inherit', resize: 'none', fontSize: '0.95rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="glass-button" style={{ flex: 1, justifyContent: 'center' }} onClick={handleCopy}>
            {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? 'Copied to Clipboard' : 'Copy Content'}
          </button>
          <a href={`mailto:faculty@university.edu?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`} className="glass-button" style={{ background: 'var(--secondary)', flex: 1, justifyContent: 'center' }}>
            <Send size={18} /> Open in Mail App
          </a>
        </div>
      </div>
    </div>
  );
}
