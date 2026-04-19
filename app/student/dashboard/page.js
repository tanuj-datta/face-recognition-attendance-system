export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { 
  BarChart3, 
  Calendar, 
  Mail, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Camera,
  FileText
} from 'lucide-react';
import { TIME_SLOTS, getCurrentSlot, isSlotPast } from "../../../lib/timeSlots";
import DateSwitcher from '../../components/DateSwitcher';

const prisma = new PrismaClient();

export default async function StudentDashboard({ searchParams }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'student') {
    redirect('/student/login');
  }

  const student = await prisma.student.findUnique({
    where: { roll_no: session.user.roll_no },
    include: {
      course: true,
      attendances: {
        orderBy: { timestamp: 'desc' },
        take: 5
      }
    }
  });

  if (!student) return <div>Student data not found.</div>;

  const { date: selectedDateStr } = await searchParams;
  const today = new Date();
  const selectedDate = selectedDateStr ? new Date(selectedDateStr) : today;
  const formattedDate = selectedDate.toISOString().split('T')[0];
  const isToday = formattedDate === today.toISOString().split('T')[0];

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const activeDay = dayNames[selectedDate.getDay()];

  // Get Timetable dynamically to support Slot 7 even with stale Client
  const rawTimetables = await prisma.$queryRawUnsafe(
    `SELECT * FROM Timetable WHERE course_id = ? AND day = ?`,
    student.course_id, activeDay
  );
  const timetable = rawTimetables?.[0] || null;

  // Calculate Overall Attendance
  const subjectsList = ['DSA', 'CN', 'CD', 'OOP', 'AI', 'TOC'];
  const SESSIONS_PER_SUBJECT = 20; // Assume 20 classes for each course in semester
  
  const presentCount = await prisma.attendance.count({
    where: { student_id: student.id, status: 'Present' }
  });

  // Accurate overall attendance: Total attended / Total possible across all subjects
  const totalPossibleSessions = subjectsList.length * SESSIONS_PER_SUBJECT;
  const attendancePercentage = Math.min(100, Math.round((presentCount / totalPossibleSessions) * 100));

  const todayAttendances = await prisma.attendance.findMany({
    where: { student_id: student.id, date: formattedDate }
  });

  // Course-wise Breakdown
  const courseBreakdown = await Promise.all(subjectsList.map(async (sub) => {
    const total = SESSIONS_PER_SUBJECT; 
    const attended = await prisma.attendance.count({
      where: { student_id: student.id, subject_name: sub, status: 'Present' }
    });
    return {
      name: sub,
      total: total,
      attended: attended,
      percent: Math.round((attended / total) * 100)
    };
  }));

  let currentSlot = getCurrentSlot();
  
  // Custom Slot 7 Overwrite for Current Session Indicator
  if (!currentSlot && isToday && timetable?.slot7_start && timetable?.slot7_end) {
    const nowTime = new Date().getHours() * 60 + new Date().getMinutes();
    const [sH, sM] = timetable.slot7_start.split(':').map(Number);
    const [eH, eM] = timetable.slot7_end.split(':').map(Number);
    const startM = sH * 60 + sM;
    const endM = eH * 60 + eM;
    
    if (nowTime >= startM && nowTime < endM) {
      currentSlot = { index: 7, start: timetable.slot7_start, end: timetable.slot7_end, label: 'Slot 7' };
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Roll No: {student.roll_no} | Enrolled in {student.course.course_name}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <DateSwitcher defaultValue={formattedDate} />
          <Link href="/student/marks" className="glass-button" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <FileText size={18} /> Marks
          </Link>
          <Link href="/student/justification" className="glass-button" style={{ background: 'var(--secondary)' }}>
            <Mail size={18} /> Justify
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
         {/* Overall Attendance Card */}
         <div className="glass-panel stat-card animate-fade-in" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label">Overall Attendance</span>
              <div className="stat-value">{attendancePercentage}%</div>
            </div>
            <TrendingUp color="var(--success)" size={32} />
          </div>
          <div className="progress-container" style={{ margin: '15px 0' }}>
            <div className="progress-bar" style={{ width: `${attendancePercentage}%` }}></div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            You attended {presentCount} sessions total. Keep it up!
          </p>
        </div>

        {/* Status Card */}
        <div className="glass-panel stat-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <span className="stat-label">Current Session</span>
          <div style={{ marginTop: '10px' }}>
            {currentSlot ? (
              <>
                <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                  {(currentSlot.index === 7 ? (timetable?.slot7 || timetable?.Slot7) : timetable?.[`slot${currentSlot.index}`]) || 'Free Period'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {currentSlot.index === 7 && timetable?.slot7_start ? `${timetable.slot7_start} - ${timetable.slot7_end}` : `${currentSlot.start} - ${currentSlot.end}`}
                </div>
              </>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No active slot at this time.</div>
            )}
          </div>
          {currentSlot && timetable?.[(currentSlot.index === 7 ? 'slot7' : `slot${currentSlot.index}`)] && (
            todayAttendances.find(a => a.slot_index === currentSlot.index) ? (
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                <CheckCircle2 size={16} /> Attendance Recorded
              </div>
            ) : (
              <Link href={`/student/attendance/scan/${currentSlot.index}`} className="glass-button" style={{ marginTop: 'auto', fontSize: '0.85rem', padding: '8px 15px' }}>
                <Camera size={16} /> Mark Now
              </Link>
            )
          )}
        </div>
      </div>

      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Calendar size={22} color="var(--primary)" /> {activeDay}'s Schedule ({formattedDate})
      </h2>
      
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '3rem' }}>
        {TIME_SLOTS.map(slot => {
          const isSlot7 = slot.index === 7;
          let subject = timetable?.[`slot${slot.index}`] || timetable?.[`Slot${slot.index}`];
          let displayTime = `${slot.start} - ${slot.end}`;
          
          if (isSlot7) {
            const s7 = timetable?.slot7 || timetable?.Slot7;
            const s7s = timetable?.slot7_start || timetable?.Slot7_start;
            const s7e = timetable?.slot7_end || timetable?.Slot7_end;
            
            if (s7) subject = s7;
            if (s7s && s7e) displayTime = `${s7s} - ${s7e}`;
          }
          
          const attendance = todayAttendances.find(a => a.slot_index === slot.index);
          const isToday = selectedDate.toDateString() === new Date().toDateString();
          
          let isSlotCurrent = isToday && currentSlot?.index === slot.index;
          let isPast = isToday ? isSlotPast(slot.index) : (selectedDate < today);
          
          if (isSlot7 && timetable?.slot7_start && timetable?.slot7_end && isToday) {
            const nowTime = new Date().getHours() * 60 + new Date().getMinutes();
            const [sH, sM] = timetable.slot7_start.split(':').map(Number);
            const [eH, eM] = timetable.slot7_end.split(':').map(Number);
            const startTime = sH * 60 + sM;
            const endTime = eH * 60 + eM;
            
            isSlotCurrent = nowTime >= startTime && nowTime < endTime;
            isPast = nowTime >= endTime;
          }

          const canMark = isToday && isSlotCurrent && subject && !attendance;
          
          return (
            <Link 
              key={slot.index} 
              href={canMark ? `/student/attendance/scan/${slot.index}` : '#'}
              className="glass-panel animate-fade-in" 
              style={{ 
                padding: '1.2rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px', 
                textDecoration: 'none',
                color: 'inherit',
                opacity: (isPast && !attendance) || !subject ? '0.6' : '1', 
                border: isSlotCurrent ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                cursor: canMark ? 'pointer' : 'default',
                transform: isSlotCurrent ? 'scale(1.02)' : 'none',
                boxShadow: isSlotCurrent ? '0 0 20px var(--primary-glow)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>{slot.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{displayTime}</div>
                </div>
                {attendance && <CheckCircle2 size={16} color="var(--success)" />}
              </div>
              
              <div style={{ fontWeight: '800', fontSize: '1.1rem', color: subject ? 'var(--text-main)' : 'rgba(255,255,255,0.2)', minHeight: '40px' }}>
                {subject || 'No Class'}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                {attendance ? (
                  <span style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: 'bold' }}>✓ MARKED SUCCESSFULLY</span>
                ) : canMark ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    <Camera size={14} /> TAP TO SCAN
                  </div>
                ) : isPast && subject ? (
                  <Link 
                    href={`/student/justification?subject=${subject}&date=${formattedDate}&slot=${slot.index}`}
                    style={{ display: 'flex', flexDirection: 'column', gap: '4px', textDecoration: 'none' }}
                  >
                    <span style={{ color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 'bold' }}>ABSENT</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 'bold' }}>Justify Absence →</span>
                  </Link>
                ) : subject ? (
                   <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>UPCOMING</span>
                ) : (
                  <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '0.75rem' }}>FREE SLOT</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Course Breakdown Table */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={20} /> Attendance by Course
          </h3>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Total</th>
                <th>Attended</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {courseBreakdown.map((c, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: '600' }}>{c.name}</td>
                  <td>{c.total}</td>
                  <td>{c.attended}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="progress-container" style={{ width: '60px', marginTop: 0 }}>
                        <div className="progress-bar" style={{ width: `${c.percent}%` }}></div>
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{c.percent}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Activity */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} /> Latest Check-ins
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {student.attendances.map((att, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px' }}>
                <CheckCircle2 color="var(--success)" size={18} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{att.subject_name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {att.date} at {new Date(att.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {student.attendances.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No records yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

