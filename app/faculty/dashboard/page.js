import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { 
  Users, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  LayoutDashboard, 
  FileText, 
  GraduationCap,
  Search,
  ChevronRight,
  Clock
} from 'lucide-react';

const prisma = new PrismaClient();

export default async function FacultyDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'faculty') {
    redirect('/faculty/login');
  }

  // Fetch Stats for Today
  const todayDate = new Date().toISOString().split('T')[0];
  
  const studentsCount = await prisma.student.count();
  const uniquePresentToday = await prisma.attendance.groupBy({
    by: ['student_id'],
    where: { date: todayDate, status: 'Present' }
  });
  
  const presentCount = uniquePresentToday.length;
  const absentCount = studentsCount - presentCount;
  const attendanceRate = studentsCount === 0 ? 0 : Math.round((presentCount / studentsCount) * 100);

  const studentsRaw = await prisma.student.findMany({
    include: {
      course: true,
      _count: {
        select: { attendances: { where: { status: 'Present' } } }
      },
      attendances: {
        where: { date: todayDate },
        take: 1
      }
    }
  });

  const subjectsList = ['DSA', 'CN', 'CD', 'OOP', 'AI', 'TOC'];
  const SESSIONS_PER_SUBJECT = 20;
  const totalPossibleSessions = subjectsList.length * SESSIONS_PER_SUBJECT;

  const students = studentsRaw.map(s => ({
    ...s,
    attendancePercent: Math.min(100, Math.round((s._count.attendances / totalPossibleSessions) * 100))
  }));

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Faculty Console</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor student performance and session attendance.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/faculty/timetable" className="glass-button">
            <Clock size={20} /> Slot Management
          </Link>
          <Link href="/faculty/marks" className="glass-button">
            <GraduationCap size={20} /> Manage Marks
          </Link>
          <Link href="/faculty/reports" className="glass-button" style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}>
            <FileText size={20} /> Attendance Reports
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-panel stat-card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="stat-label">Total Enrollment</span>
            <Users size={20} color="var(--primary)" />
          </div>
          <div className="stat-value">{studentsCount}</div>
        </div>
        
        <div className="glass-panel stat-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="stat-label">Active Today</span>
            <UserCheck size={20} color="var(--success)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{presentCount}</div>
        </div>

        <div className="glass-panel stat-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="stat-label">Not Checked-in</span>
            <UserX size={20} color="var(--danger)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{absentCount}</div>
        </div>

        <div className="glass-panel stat-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="stat-label">Daily Reach</span>
            <TrendingUp size={20} color="var(--primary)" />
          </div>
          <div className="stat-value">{attendanceRate}%</div>
        </div>
      </div>

      <div className="glass-panel animate-fade-in" style={{ padding: '2rem', animationDelay: '0.4s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem' }}>
            <LayoutDashboard size={22} color="var(--primary)" /> Student Directory
          </h3>
          <div style={{ position: 'relative' }}>
             <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
             <input type="text" placeholder="Search by name or ID..." className="glass-panel" style={{ padding: '10px 15px 10px 40px', fontSize: '0.85rem', outline: 'none', color: 'white', width: '300px' }} />
          </div>
        </div>
        
        <table className="custom-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Roll Number</th>
              <th>Department / Course</th>
              <th>Overall Attendance</th>
              <th>Daily Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {s.name.charAt(0)}
                    </div>
                    <span style={{ fontWeight: '600' }}>{s.name}</span>
                  </div>
                </td>
                <td>{s.roll_no}</td>
                <td><span style={{ color: 'var(--text-muted)' }}>{s.course.course_name}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="progress-container" style={{ width: '80px', height: '6px', marginTop: 0 }}>
                       <div className="progress-bar" style={{ 
                         width: `${s.attendancePercent}%`,
                         background: s.attendancePercent < 75 ? 'var(--danger)' : 'var(--success)'
                       }}></div>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{s.attendancePercent}%</span>
                  </div>
                </td>
                <td>
                  <span style={{ 
                    padding: '6px 14px', 
                    borderRadius: '20px', 
                    fontSize: '0.7rem', 
                    fontWeight: '800',
                    background: s.attendances.length > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: s.attendances.length > 0 ? 'var(--success)' : 'var(--danger)',
                    border: s.attendances.length > 0 ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                    letterSpacing: '0.05em'
                  }}>
                    {s.attendances.length > 0 ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td>
                  <Link href={`/faculty/dashboard/student/${s.id}`} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    color: 'var(--primary)', 
                    textDecoration: 'none', 
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}>
                    Manage Profile <ChevronRight size={16} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

