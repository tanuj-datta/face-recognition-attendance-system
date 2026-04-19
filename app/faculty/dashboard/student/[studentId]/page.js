import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DownloadExcelButton from '../../../../components/DownloadExcelButton';
import DeleteStudentButton from '../../../../components/DeleteStudentButton';
import styles from '../../../../student/register/page.module.css';
import { Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, ArrowLeft, Save } from 'lucide-react';
import { TIME_SLOTS } from '../../../../../lib/timeSlots';

const prisma = new PrismaClient();

export default async function FacultyStudentView({ params, searchParams }) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'faculty') {
    redirect('/faculty/login');
  }

  const { studentId } = await params;
  const { date: selectedDateStr } = await searchParams;
  
  const studentData = await prisma.student.findUnique({
    where: { id: studentId },
    include: { 
      course: true,
      attendances: true 
    }
  });

  if (!studentData) return <div style={{ color: 'white', padding: '2rem' }}>Student not found.</div>;

  const today = new Date();
  const selectedDate = selectedDateStr ? new Date(selectedDateStr) : today;
  const formattedSelectedDate = selectedDate.toISOString().split('T')[0];
  
  // Get day of week for timetable
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[selectedDate.getDay()];

  // Get Timetable dynamically to support Slot 7 even with stale Client
  const rawTimetables = await prisma.$queryRawUnsafe(
    `SELECT * FROM Timetable WHERE course_id = ? AND day = ?`,
    studentData.course_id, dayName
  );
  const timetable = rawTimetables?.[0] || null;

  const dayAttendances = studentData.attendances.filter(a => a.date === formattedSelectedDate);

  // Server Action: Toggle Slot Attendance
  async function toggleSlot(formData) {
    'use server';
    const sId = formData.get('studentId');
    const slotIdx = parseInt(formData.get('slotIndex'));
    const date = formData.get('date');
    const subject = formData.get('subject');
    const isCurrentlyPresent = formData.get('isPresent') === 'true';

    const prismaAction = new PrismaClient();

    if (isCurrentlyPresent) {
      await prismaAction.attendance.deleteMany({
        where: { student_id: sId, date: date, slot_index: slotIdx }
      });
    } else {
      await prismaAction.attendance.create({
        data: {
          student_id: sId,
          slot_index: slotIdx,
          date: date,
          subject_name: subject,
          status: 'Present'
        }
      });
    }

    revalidatePath(`/faculty/dashboard/student/${sId}`);
  }

  // Monthly Calendar Logic
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const calendarDays = [];
  const presenceMap = new Set(studentData.attendances.map(a => a.date));

  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), i);
    const dStr = d.toISOString().split('T')[0];
    calendarDays.push({
      day: i,
      fullDate: dStr,
      hasPresence: presenceMap.has(dStr),
      isSelected: dStr === formattedSelectedDate,
      isFuture: d > today
    });
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Link href="/faculty/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={18} /> Student Roster
        </Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <DownloadExcelButton studentName={studentData.name} attendances={studentData.attendances} />
          <DeleteStudentButton studentId={studentData.id} studentName={studentData.name} />
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 400px', gap: '2rem', alignItems: 'start' }}>
        {/* Left: Slot Detail View */}
        <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem' }}>
          <div style={{ marginBottom: '2rem' }}>
             <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>{studentData.name}</h2>
             <p style={{ color: 'var(--text-muted)' }}>{studentData.roll_no} • {studentData.course.course_name}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
             <CalendarIcon size={20} color="var(--primary)" />
             <h3 style={{ fontSize: '1.2rem' }}>Check-ins for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {TIME_SLOTS.map(slot => {
              const subject = timetable?.[`slot${slot.index}`];
              const attendance = dayAttendances.find(a => a.slot_index === slot.index);
              
              return (
                <div key={slot.index} className="glass-panel" style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: subject ? 'rgba(255,255,255,0.02)' : 'transparent', opacity: subject ? 1 : 0.5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ textAlign: 'center', width: '60px' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>{slot.label}</div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{slot.start}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1rem' }}>{subject || 'No Slot Scheduled'}</div>
                      <div style={{ fontSize: '0.75rem', color: attendance ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {attendance ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {attendance ? 'Recorded' : 'Not Marked'}
                      </div>
                    </div>
                  </div>

                  {subject && (
                    <form action={toggleSlot}>
                      <input type="hidden" name="studentId" value={studentData.id} />
                      <input type="hidden" name="slotIndex" value={slot.index} />
                      <input type="hidden" name="date" value={formattedSelectedDate} />
                      <input type="hidden" name="subject" value={subject} />
                      <input type="hidden" name="isPresent" value={attendance ? 'true' : 'false'} />
                      
                      <button type="submit" className="glass-button" style={{ 
                        background: attendance ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: attendance ? 'var(--danger)' : 'var(--success)',
                        border: attendance ? '1px solid var(--danger)' : '1px solid var(--success)',
                        fontSize: '0.75rem',
                        padding: '6px 12px'
                      }}>
                        Mark as {attendance ? 'Absent' : 'Present'}
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selection Calendar */}
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', animationDelay: '0.1s' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Select Date</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {['S','M','T','W','T','F','S'].map(d => (
              <div key={d} style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px' }}>{d}</div>
            ))}
            
            {Array.from({ length: new Date(today.getFullYear(), today.getMonth(), 1).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {calendarDays.map((d) => (
              <Link 
                key={d.day} 
                href={`?date=${d.fullDate}`}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '10px',
                  background: d.isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                  border: d.hasPresence ? `1px solid ${d.isSelected ? 'white' : 'var(--success)'}` : '1px solid transparent',
                  color: d.isFuture ? 'rgba(255,255,255,0.2)' : 'white',
                  fontSize: '0.85rem',
                  fontWeight: d.isSelected ? 'bold' : 'normal',
                  textDecoration: 'none',
                  cursor: 'pointer'
                }}
              >
                {d.day}
              </Link>
            ))}
          </div>
          
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <div style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '3px' }}></div> Selected Date
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <div style={{ width: '12px', height: '12px', border: '1px solid var(--success)', borderRadius: '3px' }}></div> Presence Recorded
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
