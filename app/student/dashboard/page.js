import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { PrismaClient } from "@prisma/client";
import styles from "../register/page.module.css";
import { redirect } from 'next/navigation';

const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function StudentPortal() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/student/login');
  }

  const { roll_no, name } = session.user;

  // Retrieve Only this individual student's attendance records
  const studentData = await prisma.student.findUnique({
    where: { roll_no: roll_no },
    include: { attendances: true }
  });

  const attendances = studentData?.attendances || [];

  // Generate an array for the current month
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const presentDays = new Set(
    attendances
      .filter(a => a.status === 'Present')
      .map(a => new Date(a.timestamp).getDate())
  );

  const calendarDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const isPresent = presentDays.has(i);
    const isFuture = i > today.getDate();
    calendarDays.push({ day: i, isPresent, isFuture });
  }

  return (
    <div className={styles.container} style={{ flexDirection: 'column', alignItems: 'center' }}>
      <div className={`glass-panel ${styles.registrationCard}`} style={{ maxWidth: '800px', width: '100%' }}>
        <h2 className={styles.title} style={{ marginBottom: '0.5rem' }}>Student Portal</h2>
        <h3 style={{ color: 'white', textAlign: 'center', marginBottom: '0.5rem' }}>Welcome, {studentData?.name || name} ({roll_no})</h3>
        <p style={{ textAlign: 'center', color: 'var(--success)', fontSize: '0.85rem', marginBottom: '2rem' }}>
          ● Live Sync Active: Dashboard updates automatically on every scan.
        </p>

        <div>
          <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Your Attendance Calendar (This Month)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>{d}</div>
            ))}
            
            {/* Extremely simple placeholder offset to match standard calendar days (assuming month starts on a specific weekday) */}
            {Array.from({ length: new Date(today.getFullYear(), today.getMonth(), 1).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {calendarDays.map((d) => (
              <div 
                key={d.day} 
                style={{
                  padding: '1rem 0',
                  textAlign: 'center',
                  borderRadius: '8px',
                  background: d.isPresent ? 'rgba(16, 185, 129, 0.2)' : d.isFuture ? 'rgba(255,255,255,0.05)' : 'rgba(239, 68, 68, 0.2)',
                  border: d.isPresent ? '1px solid var(--success)' : d.isFuture ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--danger)',
                  color: d.isFuture ? 'var(--text-muted)' : 'white',
                  fontWeight: 'bold',
                }}
              >
                {d.day}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '3rem' }}>
          <h4 style={{ color: 'white', marginBottom: '1rem' }}>Legend</h4>
          <ul style={{ color: 'var(--text-muted)', listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}><span style={{ color: 'var(--success)' }}>■</span> Present</li>
            <li><span style={{ color: 'var(--danger)' }}>■</span> Absent / No scan detected</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
