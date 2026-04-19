'use client';

import { ArrowLeft, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function Timetable() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const schedule = [
    { day: 'Monday', time: '10:00 AM - 11:30 AM', course: 'CS-101: Computer Science', room: 'L-401' },
    { day: 'Monday', time: '02:00 PM - 03:30 PM', course: 'MA-202: Advanced Math', room: 'M-102' },
    { day: 'Tuesday', time: '09:00 AM - 10:30 AM', course: 'CS-101: Computer Science', room: 'L-401' },
    { day: 'Wednesday', time: '11:00 AM - 12:30 PM', course: 'MA-202: Advanced Math', room: 'M-102' },
    { day: 'Thursday', time: '10:00 AM - 11:30 AM', course: 'CS-101: Computer Science', room: 'Lab-A' },
  ];

  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <Link href="/student/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <h1 style={{ marginBottom: '3rem' }}>Your Academic Schedule</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {days.map((day) => (
          <div key={day} style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ width: '120px', fontWeight: 'bold', color: 'var(--primary)', paddingTop: '10px' }}>{day}</div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {schedule.filter(s => s.day === day).map((session, i) => (
                <div key={i} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ marginBottom: '10px' }}>{session.course}</h3>
                    <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {session.time}</span>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {session.room}</span>
                    </div>
                  </div>
                  <div style={{ padding: '8px 15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', fontSize: '0.8rem' }}>
                    Lecture
                  </div>
                </div>
              ))}
              {schedule.filter(s => s.day === day).length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', paddingTop: '10px' }}>No sessions scheduled.</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
