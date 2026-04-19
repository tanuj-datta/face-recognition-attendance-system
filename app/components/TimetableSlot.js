'use client';

import { useState, useEffect } from 'react';
import { Save, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function TimetableSlot({ slot, daySchedule, courseId, day, subjects, updateAction }) {
  const isSlot7 = slot.index === 7;
  const serverSubject = daySchedule?.[`slot${slot.index}`] || 'None';
  const serverStart = daySchedule?.[`slot7_start`] || '';
  const serverEnd = daySchedule?.[`slot7_end`] || '';

  const [selectedSubject, setSelectedSubject] = useState(serverSubject);
  const [customStart, setCustomStart] = useState(serverStart);
  const [customEnd, setCustomEnd] = useState(serverEnd);
  const [status, setStatus] = useState('idle'); // idle, loading, success

  // Sync with server if props change externally
  useEffect(() => {
    setSelectedSubject(serverSubject);
    setCustomStart(serverStart);
    setCustomEnd(serverEnd);
  }, [serverSubject, serverStart, serverEnd]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setStatus('loading');
    try {
      await updateAction(formData);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const hasChanges = selectedSubject !== serverSubject || (isSlot7 && (customStart !== serverStart || customEnd !== serverEnd));

  return (
    <div className="glass-panel" style={{ 
      background: status === 'success' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.03)', 
      padding: '1.5rem', 
      borderRadius: '15px', 
      border: status === 'success' ? '1px solid var(--success)' : hasChanges ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>{isSlot7 ? 'SPECIAL SLOT 7' : `SLOT ${slot.index}`}</span>
          {!isSlot7 && <div style={{ fontSize: '0.65rem', color: 'var(--primary)', marginTop: '2px' }}>{slot.start} - {slot.end}</div>}
          {isSlot7 && <div style={{ fontSize: '0.6rem', color: 'var(--success)', marginTop: '2px' }}>Custom Timing</div>}
        </div>
        <Clock size={12} color="var(--text-muted)" />
      </div>
      
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="courseId" value={courseId} />
        <input type="hidden" name="day" value={day} />
        <input type="hidden" name="slotIndex" value={slot.index} />
        
        <select 
          name="subject"
          value={selectedSubject}
          onChange={(e) => {
            setSelectedSubject(e.target.value);
            if (status === 'success') setStatus('idle');
          }}
          disabled={status === 'loading'}
          style={{ width: '100%', padding: '8px', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', marginBottom: '0.5rem', fontSize: '0.85rem' }}
        >
          {subjects.map(s => <option key={s} value={s} style={{ background: 'var(--bg-dark)' }}>{s}</option>)}
        </select>

        {isSlot7 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Start Time</label>
              <input 
                type="time" 
                name="slot7_start" 
                value={customStart} 
                onChange={(e) => setCustomStart(e.target.value)}
                style={{ width: '100%', padding: '5px', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'white', fontSize: '0.8rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>End Time</label>
              <input 
                type="time" 
                name="slot7_end" 
                value={customEnd} 
                onChange={(e) => setCustomEnd(e.target.value)}
                style={{ width: '100%', padding: '5px', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'white', fontSize: '0.8rem' }}
              />
            </div>
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={status === 'loading' || (status === 'success' && !hasChanges)}
          style={{ 
            width: '100%', 
            padding: '8px', 
            fontSize: '0.75rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px', 
            cursor: status === 'loading' ? 'not-allowed' : 'pointer', 
            transition: '0.2s', 
            borderRadius: '8px',
            border: status === 'success' ? 'none' : '1px solid var(--primary)', 
            background: status === 'success' ? 'var(--success)' : hasChanges ? 'var(--primary)' : 'rgba(129, 140, 248, 0.1)',
            color: 'white',
            fontWeight: 'bold',
            marginTop: isSlot7 ? '0' : '0.5rem'
          }}
        >
           {status === 'loading' ? (
             'Updating...'
           ) : status === 'success' ? (
             <><CheckCircle size={14} /> Updated</>
           ) : status === 'error' ? (
             <><AlertCircle size={14} /> Error</>
           ) : (
             <><Save size={14} /> {hasChanges ? 'Save Changes' : 'Update'}</>
           )}
        </button>
      </form>
    </div>
  );
}
