import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import styles from '../../../../student/register/page.module.css';

const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function FacultyStudentView({ params, searchParams }) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'faculty') {
    redirect('/faculty/login');
  }

  const { studentId } = await params;
  const { modified } = await searchParams;
  const isModified = modified === 'true';

  const studentData = await prisma.student.findUnique({
    where: { id: studentId },
    include: { attendances: true }
  });

  if (!studentData) {
    return <div style={{ color: 'white', padding: '2rem' }}>Student not found.</div>;
  }

  // Server Action: Toggle Attendance
  async function toggleDay(formData) {
    'use server';
    const day = parseInt(formData.get('day'));
    const isCurrentlyPresent = formData.get('isPresent') === 'true';
    const sId = formData.get('studentId');

    const today = new Date();
    const targetDateStart = new Date(today.getFullYear(), today.getMonth(), day, 0, 0, 0);
    const targetDateEnd = new Date(today.getFullYear(), today.getMonth(), day, 23, 59, 59);

    if (isCurrentlyPresent) {
      await prisma.attendance.deleteMany({
        where: {
          student_id: sId,
          timestamp: { gte: targetDateStart, lte: targetDateEnd }
        }
      });
    } else {
      const manualTime = new Date(today.getFullYear(), today.getMonth(), day, 12, 0, 0);
      await prisma.attendance.create({
        data: {
          student_id: sId,
          status: 'Present',
          subject_name: 'Manual Faculty Override',
          timestamp: manualTime
        }
      });
    }

    revalidatePath(`/faculty/dashboard/student/${sId}`);
    redirect(`/faculty/dashboard/student/${sId}?modified=true`);
  }

  // Generate an array for the current month representation
  const attendances = studentData.attendances || [];
  const presentDays = new Set(
    attendances
      .filter(a => a.status === 'Present')
      .map(a => new Date(a.timestamp).getDate())
  );

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const isPresent = presentDays.has(i);
    const isFuture = i > today.getDate();
    calendarDays.push({ day: i, isPresent, isFuture });
  }

  return (
    <div className={styles.container} style={{ flexDirection: 'column', alignItems: 'center' }}>
      
      <div style={{ width: '100%', maxWidth: '800px', marginBottom: '1rem' }}>
        <Link href="/faculty/dashboard" className="btn btn-primary" style={{ textDecoration: 'none', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>
          ← Back to Faculty Roster
        </Link>
      </div>

      <div className={`glass-panel ${styles.registrationCard}`} style={{ maxWidth: '800px', width: '100%', border: isModified ? '1px solid var(--success)' : '1px solid #f43f5e' }}>
        <h2 className={styles.title} style={{ marginBottom: '0.5rem' }}>Manual Attendance Editor</h2>
        <h3 style={{ color: 'white', textAlign: 'center', marginBottom: '1rem' }}>Managing: {studentData.name} ({studentData.roll_no})</h3>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ color: isModified ? 'var(--success)' : 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>
            Current Total Presents: {presentDays.size}
          </span>
          <p style={{ color: isModified ? 'var(--success)' : '#94a3b8', marginTop: '0.5rem' }}>
            {isModified ? '✓ Changes detected! Review and click Save below.' : 'Click on any day to toggle status. Changes are saved instantly.'}
          </p>
        </div>

        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>{d}</div>
            ))}
            
            {/* Offset for Weekday Alignment */}
            {Array.from({ length: new Date(today.getFullYear(), today.getMonth(), 1).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {calendarDays.map((d) => (
              <form key={d.day} action={toggleDay}>
                <input type="hidden" name="day" value={d.day} />
                <input type="hidden" name="isPresent" value={d.isPresent ? 'true' : 'false'} />
                <input type="hidden" name="studentId" value={studentData.id} />
                
                <button 
                  type="submit"
                  disabled={d.isFuture}
                  style={{
                    width: '100%',
                    padding: '1rem 0',
                    textAlign: 'center',
                    borderRadius: '8px',
                    background: d.isPresent ? 'rgba(16, 185, 129, 0.2)' : d.isFuture ? 'rgba(255,255,255,0.05)' : 'rgba(239, 68, 68, 0.2)',
                    border: d.isPresent ? '1px solid var(--success)' : d.isFuture ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--danger)',
                    color: d.isFuture ? 'rgba(255,255,255,0.3)' : 'white',
                    fontWeight: 'bold',
                    cursor: d.isFuture ? 'not-allowed' : 'pointer',
                    transition: '0.2s ease-in-out'
                  }}
                >
                  {d.day}
                </button>
              </form>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
          {isModified ? (
            <Link href="/faculty/dashboard" className="btn btn-primary" style={{ padding: '1rem 3rem', textDecoration: 'none', background: 'var(--success)', border: 'none', animation: 'pulse 1.5s infinite' }}>
              Save & Finish Editing
            </Link>
          ) : (
            <button className="btn btn-primary" disabled style={{ padding: '1rem 3rem', textDecoration: 'none', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'not-allowed', color: 'rgba(255,255,255,0.3)' }}>
              Save & Finish (No Changes)
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
